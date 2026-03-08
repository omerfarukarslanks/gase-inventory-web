"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { clearStringError } from "@/lib/form-errors";
import type { Currency } from "@/lib/products";
import {
  addSaleLine,
  getSaleById,
  removeSaleLine,
  updateSaleLine,
  type SaleDetailLine,
  type SaleListItem,
} from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
import { buildAddSaleLinePayload, buildPatchSaleLinePayload } from "@/components/sales/payload";
import { validateAddSaleLineForm, validateManagedSaleLineForm } from "@/components/sales/validation";
import {
  createLineRow,
  type ManagedLineEditForm,
  type SaleLineForm,
} from "@/components/sales/types";

type UseSaleLinesOptions = {
  isWholesaleStoreType: boolean;
  onRefreshSales: () => Promise<void>;
};

function createEditLineForm(line: SaleDetailLine): ManagedLineEditForm {
  return {
    quantity: line.quantity != null ? String(line.quantity) : "",
    unitPrice: line.unitPrice != null ? String(line.unitPrice) : "",
    currency: (line.currency as Currency) ?? "TRY",
    discountMode: line.discountAmount != null ? "amount" : "percent",
    discountPercent: line.discountPercent != null ? String(line.discountPercent) : "",
    discountAmount: line.discountAmount != null ? String(line.discountAmount) : "",
    taxMode: line.taxAmount != null ? "amount" : "percent",
    taxPercent: line.taxPercent != null ? String(line.taxPercent) : "",
    taxAmount: line.taxAmount != null ? String(line.taxAmount) : "",
    campaignCode: line.campaignCode ?? "",
  };
}

export function useSaleLines({
  isWholesaleStoreType,
  onRefreshSales,
}: UseSaleLinesOptions) {
  const { t } = useLang();
  const [linesDrawerOpen, setLinesDrawerOpen] = useState(false);
  const [linesDrawerSale, setLinesDrawerSale] = useState<SaleListItem | null>(null);
  const [managedLines, setManagedLines] = useState<SaleDetailLine[]>([]);
  const [linesDrawerLoading, setLinesDrawerLoading] = useState(false);
  const [linesDrawerError, setLinesDrawerError] = useState("");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editLineForm, setEditLineForm] = useState<ManagedLineEditForm>({
    quantity: "",
    unitPrice: "",
    currency: "TRY",
    discountMode: "percent",
    discountPercent: "",
    discountAmount: "",
    taxMode: "percent",
    taxPercent: "",
    taxAmount: "",
    campaignCode: "",
  });
  const [lineOpSubmitting, setLineOpSubmitting] = useState(false);
  const [lineOpError, setLineOpError] = useState("");
  const [deleteLineTarget, setDeleteLineTarget] = useState<string | null>(null);
  const [deleteLineDialogOpen, setDeleteLineDialogOpen] = useState(false);
  const [deletingLine, setDeletingLine] = useState(false);
  const [addLineExpanded, setAddLineExpanded] = useState(false);
  const [addLineForm, setAddLineForm] = useState<SaleLineForm>(() => createLineRow());

  const refreshManagedLines = useCallback(async (saleId: string) => {
    const response = await getSaleById(saleId);
    const detail = normalizeSaleDetail(response);
    setManagedLines(detail?.lines ?? []);
  }, []);

  const openManageLinesDrawer = useCallback(async (sale: SaleListItem) => {
    setLinesDrawerSale(sale);
    setManagedLines([]);
    clearStringError(linesDrawerError, setLinesDrawerError);
    setEditingLineId(null);
    clearStringError(lineOpError, setLineOpError);
    setDeleteLineDialogOpen(false);
    setDeleteLineTarget(null);
    setAddLineExpanded(false);
    setAddLineForm(createLineRow());
    setLinesDrawerOpen(true);
    setLinesDrawerLoading(true);

    try {
      await refreshManagedLines(sale.id);
    } catch {
      setLinesDrawerError(t("sales.linesDrawerLoadError"));
    } finally {
      setLinesDrawerLoading(false);
    }
  }, [lineOpError, linesDrawerError, refreshManagedLines, t]);

  const closeManageLinesDrawer = useCallback(() => {
    if (lineOpSubmitting || deletingLine) return;
    setLinesDrawerOpen(false);
    setLinesDrawerSale(null);
    setManagedLines([]);
    setEditingLineId(null);
    clearStringError(lineOpError, setLineOpError);
    setDeleteLineDialogOpen(false);
    setDeleteLineTarget(null);
    setAddLineExpanded(false);
  }, [deletingLine, lineOpError, lineOpSubmitting]);

  const startEditLine = useCallback((line: SaleDetailLine) => {
    setEditingLineId(line.id);
    clearStringError(lineOpError, setLineOpError);
    setEditLineForm(createEditLineForm(line));
  }, [lineOpError]);

  const cancelEditLine = useCallback(() => {
    setEditingLineId(null);
    clearStringError(lineOpError, setLineOpError);
  }, [lineOpError]);

  const submitEditLine = useCallback(async (lineId: string) => {
    if (!linesDrawerSale) return;

    const validationError = validateManagedSaleLineForm(editLineForm, {
      quantityInvalid: t("sales.lineQuantityInvalid"),
      unitPriceInvalid: t("sales.lineUnitPriceInvalid"),
    });
    if (validationError) {
      setLineOpError(validationError);
      return;
    }

    setLineOpSubmitting(true);
    clearStringError(lineOpError, setLineOpError);

    try {
      await updateSaleLine(linesDrawerSale.id, lineId, buildPatchSaleLinePayload(editLineForm));
      setEditingLineId(null);
      await refreshManagedLines(linesDrawerSale.id);
      await onRefreshSales();
    } catch {
      setLineOpError(t("sales.lineUpdateError"));
    } finally {
      setLineOpSubmitting(false);
    }
  }, [editLineForm, lineOpError, linesDrawerSale, onRefreshSales, refreshManagedLines, t]);

  const requestDeleteLine = useCallback((lineId: string) => {
    setDeleteLineTarget(lineId);
    setDeleteLineDialogOpen(true);
  }, []);

  const closeDeleteLineDialog = useCallback(() => {
    if (deletingLine) return;
    setDeleteLineDialogOpen(false);
    setDeleteLineTarget(null);
  }, [deletingLine]);

  const confirmDeleteLine = useCallback(async () => {
    if (!linesDrawerSale || !deleteLineTarget) return;

    setDeletingLine(true);
    try {
      await removeSaleLine(linesDrawerSale.id, deleteLineTarget);
      setDeleteLineDialogOpen(false);
      setDeleteLineTarget(null);
      await refreshManagedLines(linesDrawerSale.id);
      await onRefreshSales();
    } catch {
      setLineOpError(t("sales.lineDeleteError"));
      setDeleteLineDialogOpen(false);
    } finally {
      setDeletingLine(false);
    }
  }, [deleteLineTarget, linesDrawerSale, onRefreshSales, refreshManagedLines, t]);

  const toggleAddLineExpanded = useCallback(() => {
    setAddLineExpanded((prev) => !prev);
    clearStringError(lineOpError, setLineOpError);
  }, [lineOpError]);

  const handleEditLineFormChange = useCallback((patch: Partial<ManagedLineEditForm>) => {
    clearStringError(lineOpError, setLineOpError);
    setEditLineForm((prev) => ({ ...prev, ...patch }));
  }, [lineOpError]);

  const handleAddLineFormChange = useCallback((patch: Partial<SaleLineForm>) => {
    clearStringError(lineOpError, setLineOpError);
    setAddLineForm((prev) => ({ ...prev, ...patch }));
  }, [lineOpError]);

  const submitAddLine = useCallback(async () => {
    if (!linesDrawerSale) return;

    const validationError = validateAddSaleLineForm(addLineForm, {
      itemRequired: isWholesaleStoreType
        ? t("sales.packagePlaceholder")
        : t("sales.variantPlaceholder"),
      quantityInvalid: t("sales.lineQuantityInvalid"),
      unitPriceInvalid: t("sales.lineUnitPriceInvalid"),
    });
    if (validationError) {
      setLineOpError(validationError);
      return;
    }

    setLineOpSubmitting(true);
    clearStringError(lineOpError, setLineOpError);

    try {
      await addSaleLine(
        linesDrawerSale.id,
        buildAddSaleLinePayload(addLineForm, isWholesaleStoreType),
      );
      setAddLineExpanded(false);
      setAddLineForm(createLineRow());
      await refreshManagedLines(linesDrawerSale.id);
      await onRefreshSales();
    } catch {
      setLineOpError(t("sales.lineAddError"));
    } finally {
      setLineOpSubmitting(false);
    }
  }, [addLineForm, isWholesaleStoreType, lineOpError, linesDrawerSale, onRefreshSales, refreshManagedLines, t]);

  return {
    linesDrawerOpen,
    linesDrawerSale,
    managedLines,
    linesDrawerLoading,
    linesDrawerError,
    editingLineId,
    editLineForm,
    lineOpSubmitting,
    lineOpError,
    deleteLineDialogOpen,
    deletingLine,
    addLineExpanded,
    addLineForm,
    openManageLinesDrawer,
    closeManageLinesDrawer,
    startEditLine,
    cancelEditLine,
    submitEditLine,
    requestDeleteLine,
    closeDeleteLineDialog,
    confirmDeleteLine,
    toggleAddLineExpanded,
    handleEditLineFormChange,
    handleAddLineFormChange,
    submitAddLine,
  };
}
