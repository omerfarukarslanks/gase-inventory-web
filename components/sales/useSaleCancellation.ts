"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { cancelSale, type SaleListItem } from "@/lib/sales";
import { buildCancelSaleMeta } from "@/components/sales/payload";

type UseSaleCancellationOptions = {
  onRefreshSales: () => Promise<void>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export function useSaleCancellation({
  onRefreshSales,
  onSuccess,
  onError,
}: UseSaleCancellationOptions) {
  const { t } = useLang();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetSale, setCancelTargetSale] = useState<SaleListItem | null>(null);
  const [cancellingSale, setCancellingSale] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");

  const openCancelDialog = useCallback((sale: SaleListItem) => {
    setCancelTargetSale(sale);
    setCancelReason("");
    setCancelNote("");
    setCancelDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    if (cancellingSale) return;
    setCancelDialogOpen(false);
    setCancelTargetSale(null);
  }, [cancellingSale]);

  const confirmCancelSale = useCallback(async () => {
    if (!cancelTargetSale) return;

    setCancellingSale(true);
    try {
      await cancelSale(cancelTargetSale.id, buildCancelSaleMeta(cancelReason, cancelNote));
      onSuccess(t("sales.saleCancelledSuccess"));
      setCancelDialogOpen(false);
      setCancelTargetSale(null);
      await onRefreshSales();
    } catch {
      onError(t("sales.saleCancelError"));
    } finally {
      setCancellingSale(false);
    }
  }, [cancelNote, cancelReason, cancelTargetSale, onError, onRefreshSales, onSuccess, t]);

  return {
    cancelDialogOpen,
    cancellingSale,
    cancelReason,
    cancelNote,
    openCancelDialog,
    closeCancelDialog,
    confirmCancelSale,
    setCancelReason,
    setCancelNote,
  };
}
