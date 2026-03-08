"use client";

import { useCallback, useState } from "react";
import { transferInventory, type InventoryStoreStockItem, type InventoryTransferPayload } from "@/lib/inventory";
import type { VariantActionParams } from "@/components/stock/StockTable";
import type { TransferFormState, TransferTarget } from "@/components/stock/TransferDrawer";
import { clearStringError } from "@/lib/form-errors";
import { validateInventoryTransferForm } from "@/components/stock/validation";

type UseStockTransferFlowOptions = {
  onRefreshSummary: () => Promise<void>;
  onRefreshVariantStores: (variantId: string) => Promise<void>;
  resolveVariantStores: (variantId: string, fallback: InventoryStoreStockItem[]) => Promise<InventoryStoreStockItem[]>;
  onSuccess: (message: string) => void;
  sourceStoreRequiredMessage: string;
  targetStoreRequiredMessage: string;
  sameStoreErrorMessage: string;
  quantityPositiveMessage: string;
  transferExceedsStockMessage: string;
  transferSuccessMessage: string;
  transferErrorMessage: string;
};

const EMPTY_TRANSFER_FORM: TransferFormState = {
  fromStoreId: "",
  toStoreId: "",
  quantity: "",
  reason: "",
  note: "",
};

export function useStockTransferFlow({
  onRefreshSummary,
  onRefreshVariantStores,
  resolveVariantStores,
  onSuccess,
  sourceStoreRequiredMessage,
  targetStoreRequiredMessage,
  sameStoreErrorMessage,
  quantityPositiveMessage,
  transferExceedsStockMessage,
  transferSuccessMessage,
  transferErrorMessage,
}: UseStockTransferFlowOptions) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferFormError, setTransferFormError] = useState("");
  const [transferTarget, setTransferTarget] = useState<TransferTarget | null>(null);
  const [transferForm, setTransferForm] = useState<TransferFormState>(EMPTY_TRANSFER_FORM);

  const openTransferDrawer = useCallback(async (params: VariantActionParams) => {
    clearStringError(transferFormError, setTransferFormError);
    setTransferLoading(true);

    const normalizedStores = await resolveVariantStores(params.productVariantId, params.stores);
    setTransferTarget({
      productVariantId: params.productVariantId,
      productName: params.productName,
      variantName: params.variantName,
      stores: normalizedStores,
    });
    setTransferForm(EMPTY_TRANSFER_FORM);
    setTransferOpen(true);
    setTransferLoading(false);
  }, [resolveVariantStores, transferFormError]);

  const closeTransferDrawer = useCallback(() => {
    if (transferSubmitting) return;
    setTransferOpen(false);
    setTransferTarget(null);
    clearStringError(transferFormError, setTransferFormError);
  }, [transferFormError, transferSubmitting]);

  const patchTransferForm = useCallback((patch: Partial<TransferFormState>) => {
    clearStringError(transferFormError, setTransferFormError);
    setTransferForm((prev) => ({ ...prev, ...patch }));
  }, [transferFormError]);

  const submitTransfer = useCallback(async () => {
    if (!transferTarget) return;
    const fromStore = transferTarget.stores.find((store) => store.storeId === transferForm.fromStoreId);
    const validation = validateInventoryTransferForm(
      {
        fromStoreId: transferForm.fromStoreId,
        toStoreId: transferForm.toStoreId,
        quantity: transferForm.quantity,
        availableQuantity: Number(fromStore?.quantity ?? 0),
      },
      {
        sourceStoreRequired: sourceStoreRequiredMessage,
        targetStoreRequired: targetStoreRequiredMessage,
        sameStoreError: sameStoreErrorMessage,
        quantityPositive: quantityPositiveMessage,
        exceedsStock: transferExceedsStockMessage,
      },
    );
    if (validation.error || validation.quantity == null) {
      setTransferFormError(validation.error ?? transferErrorMessage);
      return;
    }

    const payload: InventoryTransferPayload = {
      fromStoreId: transferForm.fromStoreId,
      toStoreId: transferForm.toStoreId,
      productVariantId: transferTarget.productVariantId,
      quantity: validation.quantity,
      meta: {
        reason: transferForm.reason || undefined,
        note: transferForm.note || undefined,
      },
    };

    setTransferSubmitting(true);
    clearStringError(transferFormError, setTransferFormError);
    try {
      await transferInventory(payload);
      onSuccess(transferSuccessMessage);
      closeTransferDrawer();
      await onRefreshSummary();
      await onRefreshVariantStores(transferTarget.productVariantId);
    } catch {
      setTransferFormError(transferErrorMessage);
    } finally {
      setTransferSubmitting(false);
    }
  }, [
    closeTransferDrawer,
    onRefreshSummary,
    onRefreshVariantStores,
    onSuccess,
    quantityPositiveMessage,
    sameStoreErrorMessage,
    sourceStoreRequiredMessage,
    targetStoreRequiredMessage,
    transferErrorMessage,
    transferExceedsStockMessage,
    transferForm,
    transferFormError,
    transferSuccessMessage,
    transferTarget,
  ]);

  return {
    transferOpen,
    transferLoading,
    transferSubmitting,
    transferFormError,
    transferTarget,
    transferForm,
    patchTransferForm,
    openTransferDrawer,
    closeTransferDrawer,
    submitTransfer,
  };
}
