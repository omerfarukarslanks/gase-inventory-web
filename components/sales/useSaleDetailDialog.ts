"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { clearStringError } from "@/lib/form-errors";
import { getSaleById, type SaleDetail } from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";

export function useSaleDetailDialog() {
  const { t } = useLang();
  const [saleDetailOpen, setSaleDetailOpen] = useState(false);
  const [saleDetailLoading, setSaleDetailLoading] = useState(false);
  const [saleDetailError, setSaleDetailError] = useState("");
  const [saleDetail, setSaleDetail] = useState<SaleDetail | null>(null);

  const openSaleDetailDialog = useCallback(async (saleId: string) => {
    setSaleDetailOpen(true);
    setSaleDetailLoading(true);
    clearStringError(saleDetailError, setSaleDetailError);

    try {
      const response = await getSaleById(saleId);
      const normalized = normalizeSaleDetail(response);
      if (!normalized) {
        setSaleDetail(null);
        setSaleDetailError(t("sales.saleReceiptDetailUnavailable"));
        return;
      }

      setSaleDetail(normalized);
    } catch {
      setSaleDetail(null);
      setSaleDetailError(t("sales.saleReceiptDetailLoadError"));
    } finally {
      setSaleDetailLoading(false);
    }
  }, [saleDetailError, t]);

  const closeSaleDetailDialog = useCallback(() => {
    setSaleDetailOpen(false);
    clearStringError(saleDetailError, setSaleDetailError);
    setSaleDetail(null);
  }, [saleDetailError]);

  return {
    saleDetailOpen,
    saleDetailLoading,
    saleDetailError,
    saleDetail,
    openSaleDetailDialog,
    closeSaleDetailDialog,
  };
}
