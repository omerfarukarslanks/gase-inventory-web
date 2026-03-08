"use client";

import { useCallback } from "react";
import { downloadSaleReceipt } from "@/lib/sales";

type UseSaleReceiptDownloadOptions = {
  token?: string | null;
  onError: (message: string) => void;
};

export function useSaleReceiptDownload({
  token,
  onError,
}: UseSaleReceiptDownloadOptions) {
  const handleDownloadReceipt = useCallback(async (saleId: string) => {
    try {
      const blob = await downloadSaleReceipt(saleId, token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fis-${saleId}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      onError("Fis indirilemedi. Lutfen tekrar deneyin.");
    }
  }, [onError, token]);

  return { handleDownloadReceipt };
}
