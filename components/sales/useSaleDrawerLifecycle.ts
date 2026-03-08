"use client";

import { useCallback, useState } from "react";
import type { SaleListItem } from "@/lib/sales";
import type { SaleEditState } from "@/components/sales/edit-state";

type UseSaleDrawerLifecycleOptions = {
  isBusy: boolean;
  setBusy: (value: boolean) => void;
  clearFeedback?: () => void;
  clearFormError: () => void;
  setFormError: (message: string) => void;
  resetSaleForm: () => void;
  applyEditState: (editState: SaleEditState) => void;
  loadEditState: (saleId: string) => Promise<SaleEditState | null>;
  messages: {
    saleDetailUnavailable: string;
    saleDetailLoadError: string;
  };
};

export function useSaleDrawerLifecycle({
  isBusy,
  setBusy,
  clearFeedback,
  clearFormError,
  setFormError,
  resetSaleForm,
  applyEditState,
  loadEditState,
  messages,
}: UseSaleDrawerLifecycleOptions) {
  const [saleDrawerOpen, setSaleDrawerOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  const prepareDrawerForOpen = useCallback(() => {
    clearFormError();
    setEditingSaleId(null);
    resetSaleForm();
    clearFeedback?.();
    setSaleDrawerOpen(true);
  }, [clearFeedback, clearFormError, resetSaleForm]);

  const openSaleDrawer = useCallback(() => {
    prepareDrawerForOpen();
  }, [prepareDrawerForOpen]);

  const closeSaleDrawer = useCallback(() => {
    if (isBusy) return;
    clearFormError();
    setEditingSaleId(null);
    setSaleDrawerOpen(false);
  }, [clearFormError, isBusy]);

  const closeCompletedDrawer = useCallback(() => {
    setEditingSaleId(null);
    setSaleDrawerOpen(false);
  }, []);

  const openEditDrawer = useCallback(async (sale: SaleListItem) => {
    prepareDrawerForOpen();
    setEditingSaleId(sale.id);
    setBusy(true);

    try {
      const editState = await loadEditState(sale.id);
      if (!editState) {
        setFormError(messages.saleDetailUnavailable);
        return;
      }

      applyEditState(editState);
    } catch {
      setFormError(messages.saleDetailLoadError);
    } finally {
      setBusy(false);
    }
  }, [
    applyEditState,
    loadEditState,
    messages.saleDetailLoadError,
    messages.saleDetailUnavailable,
    prepareDrawerForOpen,
    setBusy,
    setFormError,
  ]);

  return {
    saleDrawerOpen,
    editingSaleId,
    openSaleDrawer,
    closeSaleDrawer,
    closeCompletedDrawer,
    openEditDrawer,
  };
}
