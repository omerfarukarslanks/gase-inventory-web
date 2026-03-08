"use client";

import { useCallback, useState } from "react";
import { cancelSale, type SaleListItem } from "@/lib/sales";

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
      await cancelSale(cancelTargetSale.id, {
        reason: cancelReason.trim() || undefined,
        note: cancelNote.trim() || undefined,
      });
      onSuccess("Satis fisi iptal edildi.");
      setCancelDialogOpen(false);
      setCancelTargetSale(null);
      await onRefreshSales();
    } catch {
      onError("Satis fisi iptal edilemedi. Lutfen tekrar deneyin.");
    } finally {
      setCancellingSale(false);
    }
  }, [cancelNote, cancelReason, cancelTargetSale, onError, onRefreshSales, onSuccess]);

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
