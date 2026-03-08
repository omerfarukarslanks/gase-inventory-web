"use client";

import { useCallback, useState } from "react";
import { receiveInventory, receiveInventoryBulk, type InventoryReceiveItem, type InventoryStoreStockItem } from "@/lib/inventory";
import type { Currency, ProductVariant } from "@/lib/products";
import type { VariantActionParams } from "@/components/stock/StockTable";
import type { ReceiveTarget } from "@/components/stock/ReceiveDrawer";
import type { StockEntryInitialEntry } from "@/components/inventory/StockEntryForm";

type UseStockReceiveFlowOptions = {
  onRefreshSummary: () => Promise<void>;
  onRefreshVariantStores: (variantId: string) => Promise<void>;
  resolveVariantStores: (variantId: string, fallback: InventoryStoreStockItem[]) => Promise<InventoryStoreStockItem[]>;
  onSuccess: (message: string) => void;
  atLeastOneStoreRowMessage: string;
  receiveSuccessMessage: string;
  receiveErrorMessage: string;
};

export function useStockReceiveFlow({
  onRefreshSummary,
  onRefreshVariantStores,
  resolveVariantStores,
  onSuccess,
  atLeastOneStoreRowMessage,
  receiveSuccessMessage,
  receiveErrorMessage,
}: UseStockReceiveFlowOptions) {
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);
  const [receiveFormError, setReceiveFormError] = useState("");
  const [receiveTarget, setReceiveTarget] = useState<ReceiveTarget | null>(null);
  const [receiveVariants, setReceiveVariants] = useState<ProductVariant[]>([]);
  const [receiveInitial, setReceiveInitial] = useState<Record<string, StockEntryInitialEntry[]>>({});
  const [receiveSupplierId, setReceiveSupplierId] = useState("");
  const [receiveCurrency, setReceiveCurrency] = useState<Currency>("TRY");

  const openReceiveDrawer = useCallback(async (params: VariantActionParams) => {
    setReceiveFormError("");
    setReceiveLoading(true);
    setReceiveTarget({
      productVariantId: params.productVariantId,
      productName: params.productName,
      variantName: params.variantName,
    });
    setReceiveVariants([
      {
        id: params.productVariantId,
        name: params.variantName,
        code: params.variantName,
      },
    ]);
    setReceiveSupplierId("");

    const normalizedStores = await resolveVariantStores(params.productVariantId, params.stores);
    const currency = normalizedStores[0]?.currency;
    setReceiveCurrency(
      currency === "TRY" || currency === "USD" || currency === "EUR" ? currency : "TRY",
    );
    setReceiveInitial({});
    setReceiveOpen(true);
    setReceiveLoading(false);
  }, [resolveVariantStores]);

  const closeReceiveDrawer = useCallback(() => {
    if (receiveSubmitting) return;
    setReceiveOpen(false);
    setReceiveTarget(null);
    setReceiveInitial({});
    setReceiveSupplierId("");
    setReceiveFormError("");
  }, [receiveSubmitting]);

  const submitReceive = useCallback(async (items: InventoryReceiveItem[]) => {
    if (!receiveTarget) return;
    if (items.length === 0) {
      setReceiveFormError(atLeastOneStoreRowMessage);
      return;
    }

    setReceiveSubmitting(true);
    setReceiveFormError("");
    try {
      if (items.length === 1) {
        await receiveInventory(items[0]);
      } else {
        await receiveInventoryBulk(items);
      }
      onSuccess(receiveSuccessMessage);
      closeReceiveDrawer();
      await onRefreshSummary();
      if (receiveTarget.productVariantId) {
        await onRefreshVariantStores(receiveTarget.productVariantId);
      }
    } catch {
      setReceiveFormError(receiveErrorMessage);
    } finally {
      setReceiveSubmitting(false);
    }
  }, [
    atLeastOneStoreRowMessage,
    closeReceiveDrawer,
    onRefreshSummary,
    onRefreshVariantStores,
    onSuccess,
    receiveErrorMessage,
    receiveSuccessMessage,
    receiveTarget,
  ]);

  return {
    receiveOpen,
    receiveLoading,
    receiveSubmitting,
    receiveFormError,
    receiveTarget,
    receiveVariants,
    receiveInitial,
    receiveSupplierId,
    receiveCurrency,
    setReceiveSupplierId,
    openReceiveDrawer,
    closeReceiveDrawer,
    submitReceive,
  };
}
