"use client";

import { useCallback, useState } from "react";
import {
  adjustInventory,
  type InventoryAdjustItem,
  type InventoryAdjustSinglePayload,
  type InventoryReceiveItem,
  type InventoryStoreStockItem,
} from "@/lib/inventory";
import type { Currency, ProductVariant } from "@/lib/products";
import type { VariantActionParams } from "@/components/stock/StockTable";
import type { AdjustTarget } from "@/components/stock/AdjustDrawer";
import type { StockEntryInitialEntry } from "@/components/inventory/StockEntryForm";

type UseStockAdjustFlowOptions = {
  canTenantOnly: boolean;
  isStoreScopedUser: boolean;
  scopedStoreId: string;
  onRefreshSummary: () => Promise<void>;
  onRefreshVariantStores: (variantId: string) => Promise<void>;
  resolveVariantStores: (variantId: string, fallback: InventoryStoreStockItem[]) => Promise<InventoryStoreStockItem[]>;
  onSuccess: (message: string) => void;
  atLeastOneStoreRowMessage: string;
  sameStoreTwiceMessage: string;
  adjustSuccessMessage: string;
  adjustErrorMessage: string;
};

export function useStockAdjustFlow({
  canTenantOnly,
  isStoreScopedUser,
  scopedStoreId,
  onRefreshSummary,
  onRefreshVariantStores,
  resolveVariantStores,
  onSuccess,
  atLeastOneStoreRowMessage,
  sameStoreTwiceMessage,
  adjustSuccessMessage,
  adjustErrorMessage,
}: UseStockAdjustFlowOptions) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustFormError, setAdjustFormError] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null);
  const [adjustInitial, setAdjustInitial] = useState<Record<string, StockEntryInitialEntry[]>>({});
  const [adjustApplyToAllStores, setAdjustApplyToAllStores] = useState(false);
  const [adjustVariants, setAdjustVariants] = useState<ProductVariant[]>([]);
  const [adjustCurrency, setAdjustCurrency] = useState<Currency>("TRY");

  const openAdjustDrawer = useCallback(async (params: VariantActionParams) => {
    setAdjustFormError("");
    setAdjustLoading(true);
    setAdjustTarget({
      productVariantId: params.productVariantId,
      productName: params.productName,
      variantName: params.variantName,
    });
    setAdjustVariants([
      {
        id: params.productVariantId,
        name: params.variantName,
        code: params.variantName,
      },
    ]);

    const normalizedStores = await resolveVariantStores(params.productVariantId, params.stores);
    const currency = normalizedStores[0]?.currency;
    setAdjustCurrency(
      currency === "TRY" || currency === "USD" || currency === "EUR" ? currency : "TRY",
    );
    setAdjustInitial({
      [params.productVariantId]: normalizedStores.map((store) => ({
        storeId: store.storeId,
        quantity: store.quantity,
        unitPrice: store.salePrice ?? 0,
        currency:
          store.currency === "TRY" || store.currency === "USD" || store.currency === "EUR"
            ? store.currency
            : "TRY",
        taxMode: "percent",
        taxPercent: store.taxPercent ?? undefined,
        discountMode: "percent",
        discountPercent: store.discountPercent ?? undefined,
      })),
    });

    setAdjustOpen(true);
    setAdjustLoading(false);
  }, [resolveVariantStores]);

  const closeAdjustDrawer = useCallback(() => {
    if (adjustSubmitting) return;
    setAdjustOpen(false);
    setAdjustTarget(null);
    setAdjustInitial({});
    setAdjustApplyToAllStores(false);
    setAdjustFormError("");
  }, [adjustSubmitting]);

  const submitAdjust = useCallback(async (items: InventoryReceiveItem[]) => {
    if (!adjustTarget) return;

    if (items.length === 0) {
      setAdjustFormError(atLeastOneStoreRowMessage);
      return;
    }

    const usedStoreIds = new Set<string>();
    for (const item of items) {
      if (usedStoreIds.has(item.storeId)) {
        setAdjustFormError(sameStoreTwiceMessage);
        return;
      }
      usedStoreIds.add(item.storeId);
    }

    setAdjustSubmitting(true);
    setAdjustFormError("");

    try {
      const adjustItems: InventoryAdjustItem[] = items.map((item) => ({
        storeId: item.storeId,
        productVariantId: item.productVariantId ?? "",
        newQuantity: item.quantity,
        meta: item.meta ? { reason: item.meta.reason, note: item.meta.note } : {},
      }));

      if (isStoreScopedUser) {
        const scopedPayload: InventoryAdjustSinglePayload = {
          productVariantId: adjustTarget.productVariantId,
          newQuantity: adjustItems[0]?.newQuantity ?? 0,
          meta: adjustItems[0]?.meta ?? {},
        };
        await adjustInventory(scopedPayload);
      } else if (adjustApplyToAllStores) {
        const applyAllPayload: InventoryAdjustSinglePayload = {
          productVariantId: adjustTarget.productVariantId,
          newQuantity: adjustItems[0]?.newQuantity ?? 0,
          applyToAllStores: true,
          meta: adjustItems[0]?.meta ?? {},
        };
        await adjustInventory(applyAllPayload);
      } else if (adjustItems.length > 1) {
        await adjustInventory({ items: adjustItems });
      } else {
        await adjustInventory(adjustItems[0]);
      }

      onSuccess(adjustSuccessMessage);
      closeAdjustDrawer();
      await onRefreshSummary();
      await onRefreshVariantStores(adjustTarget.productVariantId);
    } catch {
      setAdjustFormError(adjustErrorMessage);
    } finally {
      setAdjustSubmitting(false);
    }
  }, [
    adjustApplyToAllStores,
    adjustErrorMessage,
    adjustSuccessMessage,
    adjustTarget,
    atLeastOneStoreRowMessage,
    closeAdjustDrawer,
    isStoreScopedUser,
    onRefreshSummary,
    onRefreshVariantStores,
    onSuccess,
    sameStoreTwiceMessage,
  ]);

  return {
    adjustOpen,
    adjustLoading,
    adjustSubmitting,
    adjustFormError,
    adjustTarget,
    adjustInitial,
    adjustApplyToAllStores,
    setAdjustApplyToAllStores,
    adjustVariants,
    adjustCurrency,
    showStoreSelector: canTenantOnly && !adjustApplyToAllStores,
    fixedStoreId: isStoreScopedUser ? scopedStoreId : undefined,
    openAdjustDrawer,
    closeAdjustDrawer,
    submitAdjust,
  };
}
