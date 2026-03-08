"use client";

import { useCallback, useState } from "react";
import { transferInventory, type InventoryStoreStockItem, type InventoryTransferPayload } from "@/lib/inventory";
import type { VariantActionParams } from "@/components/stock/StockTable";
import type { TransferFormState, TransferTarget } from "@/components/stock/TransferDrawer";

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
    setTransferFormError("");
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
  }, [resolveVariantStores]);

  const closeTransferDrawer = useCallback(() => {
    if (transferSubmitting) return;
    setTransferOpen(false);
    setTransferTarget(null);
    setTransferFormError("");
  }, [transferSubmitting]);

  const patchTransferForm = useCallback((patch: Partial<TransferFormState>) => {
    setTransferForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const submitTransfer = useCallback(async () => {
    if (!transferTarget) return;
    if (!transferForm.fromStoreId) {
      setTransferFormError(sourceStoreRequiredMessage);
      return;
    }
    if (!transferForm.toStoreId) {
      setTransferFormError(targetStoreRequiredMessage);
      return;
    }
    if (transferForm.fromStoreId === transferForm.toStoreId) {
      setTransferFormError(sameStoreErrorMessage);
      return;
    }
    if (!transferForm.quantity || Number(transferForm.quantity) <= 0) {
      setTransferFormError(quantityPositiveMessage);
      return;
    }

    const quantity = Number(transferForm.quantity);
    const fromStore = transferTarget.stores.find((store) => store.storeId === transferForm.fromStoreId);
    const available = Number(fromStore?.quantity ?? 0);
    if (quantity > available) {
      setTransferFormError(transferExceedsStockMessage);
      return;
    }

    const payload: InventoryTransferPayload = {
      fromStoreId: transferForm.fromStoreId,
      toStoreId: transferForm.toStoreId,
      productVariantId: transferTarget.productVariantId,
      quantity,
      meta: {
        reason: transferForm.reason || undefined,
        note: transferForm.note || undefined,
      },
    };

    setTransferSubmitting(true);
    setTransferFormError("");
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
