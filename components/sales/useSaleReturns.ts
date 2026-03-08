"use client";

import { useCallback, useState } from "react";
import {
  createSaleReturn,
  getSaleById,
  type CreateSaleReturnLine,
  type SaleDetailLine,
  type SaleListItem,
} from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
import type { ReturnLineForm } from "@/components/sales/types";

type UseSaleReturnsOptions = {
  onRefreshSales: () => Promise<void>;
  onSuccess: (message: string) => void;
};

function createReturnLineForm(line: SaleDetailLine): ReturnLineForm {
  const variants = line.variantPool ?? line.packageItems ?? [];

  return {
    saleLineId: line.id,
    lineName:
      line.productVariantName ??
      line.productPackageName ??
      line.productName ??
      line.id,
    originalQuantity: line.originalQuantity ?? line.quantity ?? 0,
    returnedQuantity: line.returnedQuantity ?? 0,
    completePackagesRemaining: line.completePackagesRemaining ?? null,
    partialPackage: line.partialPackage ?? null,
    isPackageLine: Boolean(line.productPackageId),
    returnMode: "quantity",
    returnQuantity: "",
    packageVariantReturns: variants.map((item) => ({
      productVariantId: item.productVariantId,
      name: item.productVariantName ?? item.productVariantId,
      qtyPerPackage: item.qtyPerPackage,
      remaining: (item as { remaining?: number | null }).remaining ?? null,
      returnQuantity: "",
    })),
    refundAmount: "",
  };
}

function hasReturnSelection(line: ReturnLineForm): boolean {
  if (line.returnMode === "variants") {
    return line.packageVariantReturns.some((variant) => Number(variant.returnQuantity) > 0);
  }

  return line.returnQuantity !== "" && Number(line.returnQuantity) > 0;
}

function isInvalidReturnSelection(line: ReturnLineForm): boolean {
  if (line.returnMode === "variants") {
    return line.packageVariantReturns.some((variant) => {
      if (variant.returnQuantity === "" || Number(variant.returnQuantity) === 0) {
        return false;
      }

      const quantity = Number(variant.returnQuantity);
      if (!Number.isFinite(quantity) || quantity < 0) return true;
      if (variant.remaining != null && quantity > variant.remaining) return true;
      return false;
    });
  }

  const quantity = Number(line.returnQuantity);
  const maxQuantity = line.isPackageLine
    ? (line.completePackagesRemaining ?? line.originalQuantity)
    : line.originalQuantity;

  return !Number.isFinite(quantity) || quantity <= 0 || quantity > maxQuantity;
}

function buildReturnPayloadLine(line: ReturnLineForm): CreateSaleReturnLine {
  const refund =
    line.refundAmount !== "" && Number(line.refundAmount) >= 0
      ? { refundAmount: Number(line.refundAmount) }
      : {};

  if (line.returnMode === "variants") {
    return {
      saleLineId: line.saleLineId,
      packageVariantReturns: line.packageVariantReturns
        .filter((variant) => Number(variant.returnQuantity) > 0)
        .map((variant) => ({
          productVariantId: variant.productVariantId,
          quantity: Number(variant.returnQuantity),
        })),
      ...refund,
    };
  }

  return {
    saleLineId: line.saleLineId,
    quantity: Number(line.returnQuantity),
    ...refund,
  };
}

export function useSaleReturns({
  onRefreshSales,
  onSuccess,
}: UseSaleReturnsOptions) {
  const [returnDrawerOpen, setReturnDrawerOpen] = useState(false);
  const [returnTargetSale, setReturnTargetSale] = useState<SaleListItem | null>(null);
  const [returnLines, setReturnLines] = useState<ReturnLineForm[]>([]);
  const [returnNotes, setReturnNotes] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnFormError, setReturnFormError] = useState("");
  const [returnDetailLoading, setReturnDetailLoading] = useState(false);

  const openReturnDrawer = useCallback(async (sale: SaleListItem) => {
    setReturnTargetSale(sale);
    setReturnNotes("");
    setReturnFormError("");
    setReturnLines([]);
    setReturnDrawerOpen(true);
    setReturnDetailLoading(true);

    try {
      const response = await getSaleById(sale.id);
      const detail = normalizeSaleDetail(response);
      if (!detail) {
        setReturnFormError("Satis detayi alinamadi.");
        return;
      }

      setReturnLines(detail.lines.map(createReturnLineForm));
    } catch {
      setReturnFormError("Satis satirlari yuklenemedi.");
    } finally {
      setReturnDetailLoading(false);
    }
  }, []);

  const closeReturnDrawer = useCallback(() => {
    if (returnSubmitting) return;
    setReturnDrawerOpen(false);
    setReturnTargetSale(null);
    setReturnLines([]);
    setReturnNotes("");
    setReturnFormError("");
  }, [returnSubmitting]);

  const submitReturn = useCallback(async () => {
    if (!returnTargetSale) return;

    const activeLines = returnLines.filter(hasReturnSelection);
    if (activeLines.length === 0) {
      setReturnFormError("En az bir satir icin iade adedi girin.");
      return;
    }

    if (activeLines.some(isInvalidReturnSelection)) {
      setReturnFormError("Iade adedi gecersiz. Lutfen kontrol edin.");
      return;
    }

    setReturnSubmitting(true);
    setReturnFormError("");

    try {
      await createSaleReturn(returnTargetSale.id, {
        lines: activeLines.map(buildReturnPayloadLine),
        notes: returnNotes.trim() || undefined,
      });
      onSuccess("Iade olusturuldu.");
      setReturnDrawerOpen(false);
      setReturnTargetSale(null);
      setReturnLines([]);
      setReturnNotes("");
      await onRefreshSales();
    } catch {
      setReturnFormError("Iade olusturulamadi. Lutfen tekrar deneyin.");
    } finally {
      setReturnSubmitting(false);
    }
  }, [onRefreshSales, onSuccess, returnLines, returnNotes, returnTargetSale]);

  const handleReturnModeChange = useCallback((lineIndex: number, value: "quantity" | "variants") => {
    if (returnFormError) setReturnFormError("");
    setReturnLines((prev) =>
      prev.map((line, index) => (index === lineIndex ? { ...line, returnMode: value } : line)),
    );
  }, [returnFormError]);

  const handleReturnQuantityChange = useCallback((lineIndex: number, value: string) => {
    if (returnFormError) setReturnFormError("");
    setReturnLines((prev) =>
      prev.map((line, index) => (index === lineIndex ? { ...line, returnQuantity: value } : line)),
    );
  }, [returnFormError]);

  const handleRefundAmountChange = useCallback((lineIndex: number, value: string) => {
    if (returnFormError) setReturnFormError("");
    setReturnLines((prev) =>
      prev.map((line, index) => (index === lineIndex ? { ...line, refundAmount: value } : line)),
    );
  }, [returnFormError]);

  const handlePackageVariantReturnQuantityChange = useCallback((
    lineIndex: number,
    variantIndex: number,
    value: string,
  ) => {
    if (returnFormError) setReturnFormError("");
    setReturnLines((prev) =>
      prev.map((line, index) => {
        if (index !== lineIndex) return line;

        return {
          ...line,
          packageVariantReturns: line.packageVariantReturns.map((variant, innerIndex) =>
            innerIndex === variantIndex ? { ...variant, returnQuantity: value } : variant,
          ),
        };
      }),
    );
  }, [returnFormError]);

  const handleReturnNotesChange = useCallback((value: string) => {
    if (returnFormError) setReturnFormError("");
    setReturnNotes(value);
  }, [returnFormError]);

  return {
    returnDrawerOpen,
    returnTargetSale,
    returnLines,
    returnNotes,
    returnSubmitting,
    returnFormError,
    returnDetailLoading,
    openReturnDrawer,
    closeReturnDrawer,
    submitReturn,
    handleReturnModeChange,
    handleReturnQuantityChange,
    handleRefundAmountChange,
    handlePackageVariantReturnQuantityChange,
    handleReturnNotesChange,
  };
}
