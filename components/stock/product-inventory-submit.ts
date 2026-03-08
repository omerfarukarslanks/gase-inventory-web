"use client";

import type { Currency } from "@/lib/products";
import {
  adjustInventory,
  receiveInventory,
  receiveInventoryBulk,
  transferInventory,
  transferInventoryBulk,
} from "@/lib/inventory";
import {
  buildInventoryMeta,
  prepareBulkAdjustInventorySubmission,
  prepareBulkReceiveInventorySubmission,
  prepareBulkTransferInventorySubmission,
  prepareSingleAdjustInventorySubmission,
  prepareSingleReceiveInventorySubmission,
  prepareSingleTransferInventorySubmission,
} from "@/components/stock/product-inventory";
import type {
  ProductInventoryOperation,
  ProductInventoryTarget,
} from "@/components/stock/product-inventory-types";

type TranslateFn = (key: string) => string;

type InventorySubmitMessages = {
  success: Record<ProductInventoryOperation, string>;
  receive: {
    storeRequired: string;
    quantityPositive: string;
    unitPricePositive: string;
    variantQuantityRequired: string;
  };
  adjust: {
    quantityValid: string;
    variantQuantityRequired: string;
  };
  transfer: {
    sourceStoreRequired: string;
    targetStoreRequired: string;
    sameStoreError: string;
    quantityPositive: string;
    variantTransferQuantityRequired: string;
  };
  operationError: string;
};

type SingleInventorySubmitArgs = {
  operation: ProductInventoryOperation;
  target: ProductInventoryTarget;
  storeId: string;
  applyToAllStores: boolean;
  supplierId: string;
  quantity: string;
  newQuantity: string;
  unitPrice: string;
  currency: Currency;
  fromStoreId: string;
  toStoreId: string;
  meta: ReturnType<typeof buildInventoryMeta>;
  messages: InventorySubmitMessages;
  onSuccess: (message: string) => Promise<void>;
};

type MultiInventorySubmitArgs = {
  operation: ProductInventoryOperation;
  target: ProductInventoryTarget;
  storeId: string;
  supplierId: string;
  unitPrice: string;
  currency: Currency;
  fromStoreId: string;
  toStoreId: string;
  variantQtys: Record<string, string>;
  variantNewQtys: Record<string, string>;
  variantStoreIds: Record<string, string>;
  meta: ReturnType<typeof buildInventoryMeta>;
  messages: InventorySubmitMessages;
  onSuccess: (message: string) => Promise<void>;
};

export function buildInventorySubmitMessages(t: TranslateFn): InventorySubmitMessages {
  return {
    success: {
      receive: t("stock.receiveSuccess"),
      adjust: t("stock.adjustSuccess"),
      transfer: t("stock.transferSuccess"),
    },
    receive: {
      storeRequired: t("stock.storeRequired"),
      quantityPositive: t("stock.quantityPositive"),
      unitPricePositive: t("stock.unitPricePositive"),
      variantQuantityRequired: t("stock.variantQuantityRequired"),
    },
    adjust: {
      quantityValid: t("stock.quantityValid"),
      variantQuantityRequired: t("stock.variantQuantityRequired"),
    },
    transfer: {
      sourceStoreRequired: t("stock.sourceStoreRequired"),
      targetStoreRequired: t("stock.targetStoreRequired"),
      sameStoreError: t("stock.sameStoreError"),
      quantityPositive: t("stock.quantityPositive"),
      variantTransferQuantityRequired: t("stock.variantTransferQuantityRequired"),
    },
    operationError: t("stock.operationError"),
  };
}

export async function submitSingleInventoryOperation({
  operation,
  target,
  storeId,
  applyToAllStores,
  supplierId,
  quantity,
  newQuantity,
  unitPrice,
  currency,
  fromStoreId,
  toStoreId,
  meta,
  messages,
  onSuccess,
}: SingleInventorySubmitArgs): Promise<string | null> {
  if (operation === "receive") {
    const result = prepareSingleReceiveInventorySubmission(
      {
        productId: target.productId,
        storeId,
        applyToAllStores,
        supplierId,
        quantity,
        unitPrice,
        currency,
        meta,
      },
      messages.receive,
    );
    if (result.error || !result.payload) {
      return result.error ?? messages.operationError;
    }

    await receiveInventory(result.payload);
    await onSuccess(messages.success.receive);
    return null;
  }

  if (operation === "adjust") {
    const result = prepareSingleAdjustInventorySubmission(
      {
        productId: target.productId,
        storeId,
        newQuantity,
        applyToAllStores,
        meta,
      },
      messages.adjust,
    );
    if (result.error || !result.payload) {
      return result.error ?? messages.operationError;
    }

    await adjustInventory(result.payload);
    await onSuccess(messages.success.adjust);
    return null;
  }

  const result = prepareSingleTransferInventorySubmission(
    {
      productId: target.productId,
      fromStoreId,
      toStoreId,
      quantity,
      meta,
    },
    messages.transfer,
  );
  if (result.error || !result.payload) {
    return result.error ?? messages.operationError;
  }

  await transferInventory(result.payload);
  await onSuccess(messages.success.transfer);
  return null;
}

export async function submitMultiInventoryOperation({
  operation,
  target,
  storeId,
  supplierId,
  unitPrice,
  currency,
  fromStoreId,
  toStoreId,
  variantQtys,
  variantNewQtys,
  variantStoreIds,
  meta,
  messages,
  onSuccess,
}: MultiInventorySubmitArgs): Promise<string | null> {
  const variants = target.variants;

  if (operation === "receive") {
    const result = prepareBulkReceiveInventorySubmission(
      {
        variants,
        storeId,
        variantStoreIds,
        supplierId,
        quantityByVariantId: variantQtys,
        unitPriceInput: unitPrice,
        currency,
        meta,
      },
      messages.receive,
    );
    if (result.error) {
      return result.error;
    }

    await receiveInventoryBulk(result.items);
    await onSuccess(messages.success.receive);
    return null;
  }

  if (operation === "adjust") {
    const result = prepareBulkAdjustInventorySubmission(
      {
        variants,
        storeId,
        variantStoreIds,
        newQuantityByVariantId: variantNewQtys,
        meta,
      },
      messages.adjust,
    );
    if (result.error) {
      return result.error;
    }

    await adjustInventory({ items: result.items });
    await onSuccess(messages.success.adjust);
    return null;
  }

  const result = prepareBulkTransferInventorySubmission(
    {
      variants,
      quantityByVariantId: variantQtys,
      fromStoreId,
      toStoreId,
      meta,
    },
    messages.transfer,
  );
  if (result.error) {
    return result.error;
  }

  await transferInventoryBulk({ items: result.items });
  await onSuccess(messages.success.transfer);
  return null;
}
