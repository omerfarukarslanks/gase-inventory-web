"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { clearStringError } from "@/lib/form-errors";
import {
  createSaleReturn,
  getSaleById,
  type SaleListItem,
} from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
import { buildSaleReturnPayload } from "@/components/sales/payload";
import type { ReturnLineForm } from "@/components/sales/types";
import {
  buildReturnPayloadLine,
  createReturnLineForm,
  validateSaleReturnSelection,
} from "@/components/sales/validation";

type UseSaleReturnsOptions = {
  onRefreshSales: () => Promise<void>;
  onSuccess: (message: string) => void;
};

export function useSaleReturns({
  onRefreshSales,
  onSuccess,
}: UseSaleReturnsOptions) {
  const { t } = useLang();
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
    clearStringError(returnFormError, setReturnFormError);
    setReturnLines([]);
    setReturnDrawerOpen(true);
    setReturnDetailLoading(true);

    try {
      const response = await getSaleById(sale.id);
      const detail = normalizeSaleDetail(response);
      if (!detail) {
        setReturnFormError(t("sales.returnSaleDetailError"));
        return;
      }

      setReturnLines(detail.lines.map(createReturnLineForm));
    } catch {
      setReturnFormError(t("sales.returnLinesLoadError"));
    } finally {
      setReturnDetailLoading(false);
    }
  }, [returnFormError, t]);

  const closeReturnDrawer = useCallback(() => {
    if (returnSubmitting) return;
    setReturnDrawerOpen(false);
    setReturnTargetSale(null);
    setReturnLines([]);
    setReturnNotes("");
    clearStringError(returnFormError, setReturnFormError);
  }, [returnFormError, returnSubmitting]);

  const withClearedReturnFormError = useCallback((apply: () => void) => {
    clearStringError(returnFormError, setReturnFormError);
    apply();
  }, [returnFormError]);

  const patchReturnLine = useCallback((
    lineIndex: number,
    patch: Partial<ReturnLineForm>,
  ) => {
    setReturnLines((prev) =>
      prev.map((line, index) => (index === lineIndex ? { ...line, ...patch } : line)),
    );
  }, []);

  const patchReturnLineVariant = useCallback((
    lineIndex: number,
    variantIndex: number,
    returnQuantity: string,
  ) => {
    setReturnLines((prev) =>
      prev.map((line, index) => {
        if (index !== lineIndex) return line;

        return {
          ...line,
          packageVariantReturns: line.packageVariantReturns.map((variant, innerIndex) =>
            innerIndex === variantIndex ? { ...variant, returnQuantity } : variant,
          ),
        };
      }),
    );
  }, []);

  const submitReturn = useCallback(async () => {
    if (!returnTargetSale) return;

    const validation = validateSaleReturnSelection(returnLines, {
      selectionRequired: t("sales.returnLinesRequired"),
      quantityInvalid: t("sales.returnQuantityInvalidError"),
    });
    if (validation.error) {
      setReturnFormError(validation.error);
      return;
    }

    setReturnSubmitting(true);
    clearStringError(returnFormError, setReturnFormError);

    try {
      await createSaleReturn(
        returnTargetSale.id,
        buildSaleReturnPayload(validation.selectedLines.map(buildReturnPayloadLine), returnNotes),
      );
      onSuccess(t("sales.returnSuccess"));
      setReturnDrawerOpen(false);
      setReturnTargetSale(null);
      setReturnLines([]);
      setReturnNotes("");
      await onRefreshSales();
    } catch {
      setReturnFormError(t("sales.returnCreateError"));
    } finally {
      setReturnSubmitting(false);
    }
  }, [onRefreshSales, onSuccess, returnFormError, returnLines, returnNotes, returnTargetSale, t]);

  const handleReturnModeChange = useCallback((lineIndex: number, value: "quantity" | "variants") => {
    withClearedReturnFormError(() => patchReturnLine(lineIndex, { returnMode: value }));
  }, [patchReturnLine, withClearedReturnFormError]);

  const handleReturnQuantityChange = useCallback((lineIndex: number, value: string) => {
    withClearedReturnFormError(() => patchReturnLine(lineIndex, { returnQuantity: value }));
  }, [patchReturnLine, withClearedReturnFormError]);

  const handleRefundAmountChange = useCallback((lineIndex: number, value: string) => {
    withClearedReturnFormError(() => patchReturnLine(lineIndex, { refundAmount: value }));
  }, [patchReturnLine, withClearedReturnFormError]);

  const handlePackageVariantReturnQuantityChange = useCallback((
    lineIndex: number,
    variantIndex: number,
    value: string,
  ) => {
    withClearedReturnFormError(() => patchReturnLineVariant(lineIndex, variantIndex, value));
  }, [patchReturnLineVariant, withClearedReturnFormError]);

  const handleReturnNotesChange = useCallback((value: string) => {
    withClearedReturnFormError(() => setReturnNotes(value));
  }, [withClearedReturnFormError]);

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
