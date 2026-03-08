"use client";

import type {
  InventoryAdjustItem,
  InventoryAdjustSinglePayload,
  InventoryReceiveItem,
  InventoryTransferItem,
  InventoryTransferPayload,
  InventoryVariantStockItem,
} from "@/lib/inventory";
import type { Currency } from "@/lib/products";
import { omitUndefined, trimToUndefined } from "@/lib/payload";
import {
  validateNonNegativeNumericInput,
  validatePositiveNumericInput,
} from "@/components/stock/validation";

type InventoryMeta = InventoryReceiveItem["meta"];

type BulkItemInput = {
  variants: InventoryVariantStockItem[];
  storeId: string;
  variantStoreIds: Record<string, string>;
  meta?: InventoryMeta;
};

type BulkReceiveItemInput = BulkItemInput & {
  supplierId: string;
  quantityByVariantId: Record<string, string>;
  unitPrice: number;
  currency: Currency;
};

type BulkAdjustItemInput = BulkItemInput & {
  newQuantityByVariantId: Record<string, string>;
};

type BulkTransferItemInput = {
  variants: InventoryVariantStockItem[];
  quantityByVariantId: Record<string, string>;
  fromStoreId: string;
  toStoreId: string;
  meta?: InventoryMeta;
};

type TransferStoreMessages = {
  sourceStoreRequired: string;
  targetStoreRequired: string;
  sameStoreError: string;
};

type ReceiveSubmissionMessages = {
  storeRequired: string;
  quantityPositive: string;
  unitPricePositive: string;
  variantQuantityRequired: string;
};

type AdjustSubmissionMessages = {
  quantityValid: string;
  variantQuantityRequired: string;
};

type TransferSubmissionMessages = TransferStoreMessages & {
  quantityPositive: string;
  variantTransferQuantityRequired: string;
};

export function buildInventoryMeta(reason: string, note: string): InventoryMeta | undefined {
  const meta = omitUndefined({
    reason: trimToUndefined(reason),
    note: trimToUndefined(note),
  });

  return Object.keys(meta).length > 0 ? meta : undefined;
}

export function validateInventoryTransferStores(
  input: {
    fromStoreId: string;
    toStoreId: string;
  },
  messages: TransferStoreMessages,
): string | null {
  if (!input.fromStoreId) {
    return messages.sourceStoreRequired;
  }

  if (!input.toStoreId) {
    return messages.targetStoreRequired;
  }

  if (input.fromStoreId === input.toStoreId) {
    return messages.sameStoreError;
  }

  return null;
}

export function buildSingleReceiveInventoryPayload(input: {
  productId: string;
  storeId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  meta?: InventoryMeta;
}): InventoryReceiveItem {
  return {
    productId: input.productId,
    storeId: input.storeId,
    supplierId: trimToUndefined(input.supplierId),
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    currency: input.currency,
    meta: input.meta,
  };
}

export function buildSingleAdjustInventoryPayload(input: {
  productId: string;
  storeId: string;
  newQuantity: number;
  applyToAllStores: boolean;
  meta?: InventoryMeta;
}): InventoryAdjustSinglePayload {
  return omitUndefined({
    productId: input.productId,
    storeId: trimToUndefined(input.storeId),
    newQuantity: input.newQuantity,
    applyToAllStores: input.applyToAllStores || undefined,
    meta: input.meta,
  });
}

export function buildSingleTransferInventoryPayload(input: {
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
  meta?: InventoryMeta;
}): InventoryTransferPayload {
  return {
    productId: input.productId,
    fromStoreId: input.fromStoreId,
    toStoreId: input.toStoreId,
    quantity: input.quantity,
    meta: input.meta,
  };
}

export function buildBulkReceiveInventoryItems(
  input: BulkReceiveItemInput,
): InventoryReceiveItem[] {
  return input.variants
    .map((variant) => ({
      productVariantId: variant.productVariantId,
      storeId: input.variantStoreIds[variant.productVariantId] ?? input.storeId,
      supplierId: trimToUndefined(input.supplierId),
      quantity: Number(input.quantityByVariantId[variant.productVariantId] ?? 0),
      unitPrice: input.unitPrice,
      currency: input.currency,
      meta: input.meta,
    }))
    .filter((item) => item.quantity > 0);
}

export function buildBulkAdjustInventoryItems(
  input: BulkAdjustItemInput,
): InventoryAdjustItem[] {
  return input.variants
    .map((variant) => ({
      storeId: input.variantStoreIds[variant.productVariantId] ?? input.storeId ?? "",
      productVariantId: variant.productVariantId,
      newQuantity: Number(input.newQuantityByVariantId[variant.productVariantId] ?? 0),
      meta: input.meta,
    }))
    .filter(
      (_, index) =>
        input.newQuantityByVariantId[input.variants[index].productVariantId] !== undefined &&
        input.newQuantityByVariantId[input.variants[index].productVariantId] !== "",
    );
}

export function buildBulkTransferInventoryItems(
  input: BulkTransferItemInput,
): InventoryTransferItem[] {
  return input.variants
    .filter((variant) => Number(input.quantityByVariantId[variant.productVariantId] ?? 0) > 0)
    .map((variant) => ({
      productVariantId: variant.productVariantId,
      fromStoreId: input.fromStoreId,
      toStoreId: input.toStoreId,
      quantity: Number(input.quantityByVariantId[variant.productVariantId]),
      meta: input.meta,
    }));
}

export function prepareSingleReceiveInventorySubmission(
  input: {
    productId: string;
    storeId: string;
    applyToAllStores: boolean;
    supplierId: string;
    quantity: string;
    unitPrice: string;
    currency: Currency;
    meta?: InventoryMeta;
  },
  messages: ReceiveSubmissionMessages,
): { error: string | null; payload: InventoryReceiveItem | null } {
  if (!input.storeId && !input.applyToAllStores) {
    return { error: messages.storeRequired, payload: null };
  }

  const quantityValidation = validatePositiveNumericInput(
    input.quantity,
    messages.quantityPositive,
  );
  if (quantityValidation.error || quantityValidation.value == null) {
    return { error: quantityValidation.error ?? messages.quantityPositive, payload: null };
  }

  const unitPriceValidation = validatePositiveNumericInput(
    input.unitPrice,
    messages.unitPricePositive,
  );
  if (unitPriceValidation.error || unitPriceValidation.value == null) {
    return { error: unitPriceValidation.error ?? messages.unitPricePositive, payload: null };
  }

  return {
    error: null,
    payload: buildSingleReceiveInventoryPayload({
      productId: input.productId,
      storeId: input.storeId || "",
      supplierId: input.supplierId,
      quantity: quantityValidation.value,
      unitPrice: unitPriceValidation.value,
      currency: input.currency,
      meta: input.meta,
    }),
  };
}

export function prepareSingleAdjustInventorySubmission(
  input: {
    productId: string;
    storeId: string;
    newQuantity: string;
    applyToAllStores: boolean;
    meta?: InventoryMeta;
  },
  messages: AdjustSubmissionMessages,
): { error: string | null; payload: InventoryAdjustSinglePayload | null } {
  const quantityValidation = validateNonNegativeNumericInput(
    input.newQuantity,
    messages.quantityValid,
  );
  if (quantityValidation.error || quantityValidation.value == null) {
    return { error: quantityValidation.error ?? messages.quantityValid, payload: null };
  }

  return {
    error: null,
    payload: buildSingleAdjustInventoryPayload({
      productId: input.productId,
      newQuantity: quantityValidation.value,
      storeId: input.storeId,
      applyToAllStores: input.applyToAllStores,
      meta: input.meta,
    }),
  };
}

export function prepareSingleTransferInventorySubmission(
  input: {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: string;
    meta?: InventoryMeta;
  },
  messages: TransferSubmissionMessages,
): { error: string | null; payload: InventoryTransferPayload | null } {
  const transferStoreError = validateInventoryTransferStores(
    { fromStoreId: input.fromStoreId, toStoreId: input.toStoreId },
    messages,
  );
  if (transferStoreError) {
    return { error: transferStoreError, payload: null };
  }

  const quantityValidation = validatePositiveNumericInput(
    input.quantity,
    messages.quantityPositive,
  );
  if (quantityValidation.error || quantityValidation.value == null) {
    return { error: quantityValidation.error ?? messages.quantityPositive, payload: null };
  }

  return {
    error: null,
    payload: buildSingleTransferInventoryPayload({
      productId: input.productId,
      fromStoreId: input.fromStoreId,
      toStoreId: input.toStoreId,
      quantity: quantityValidation.value,
      meta: input.meta,
    }),
  };
}

export function prepareBulkReceiveInventorySubmission(
  input: Omit<BulkReceiveItemInput, "unitPrice"> & {
    unitPriceInput: string;
  },
  messages: ReceiveSubmissionMessages,
): { error: string | null; items: InventoryReceiveItem[] } {
  const unitPriceValidation = validatePositiveNumericInput(
    input.unitPriceInput,
    messages.unitPricePositive,
  );
  if (unitPriceValidation.error || unitPriceValidation.value == null) {
    return { error: unitPriceValidation.error ?? messages.unitPricePositive, items: [] };
  }

  const items = buildBulkReceiveInventoryItems({
    ...input,
    unitPrice: unitPriceValidation.value,
  });

  if (items.length === 0) {
    return { error: messages.variantQuantityRequired, items: [] };
  }

  return { error: null, items };
}

export function prepareBulkAdjustInventorySubmission(
  input: BulkAdjustItemInput,
  messages: AdjustSubmissionMessages,
): { error: string | null; items: InventoryAdjustItem[] } {
  const items = buildBulkAdjustInventoryItems(input);

  if (items.length === 0) {
    return { error: messages.variantQuantityRequired, items: [] };
  }

  return { error: null, items };
}

export function prepareBulkTransferInventorySubmission(
  input: BulkTransferItemInput,
  messages: TransferSubmissionMessages,
): { error: string | null; items: InventoryTransferItem[] } {
  const transferStoreError = validateInventoryTransferStores(
    { fromStoreId: input.fromStoreId, toStoreId: input.toStoreId },
    messages,
  );
  if (transferStoreError) {
    return { error: transferStoreError, items: [] };
  }

  const items = buildBulkTransferInventoryItems(input);

  if (items.length === 0) {
    return { error: messages.variantTransferQuantityRequired, items: [] };
  }

  return { error: null, items };
}
