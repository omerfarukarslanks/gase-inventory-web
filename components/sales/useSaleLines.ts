"use client";

import { useCallback, useState } from "react";
import { toNumberOrNull } from "@/lib/format";
import type { Currency } from "@/lib/products";
import {
  addSaleLine,
  getSaleById,
  removeSaleLine,
  updateSaleLine,
  type AddSaleLinePayload,
  type PatchSaleLinePayload,
  type SaleDetailLine,
  type SaleListItem,
} from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
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

function buildPatchPayload(form: ManagedLineEditForm): PatchSaleLinePayload {
  return {
    quantity: Number(form.quantity),
    unitPrice: Number(form.unitPrice),
    currency: form.currency,
    ...(form.discountMode === "percent" && form.discountPercent
      ? { discountPercent: Number(form.discountPercent) }
      : {}),
    ...(form.discountMode === "amount" && form.discountAmount
      ? { discountAmount: Number(form.discountAmount) }
      : {}),
    ...(form.taxMode === "percent" && form.taxPercent
      ? { taxPercent: Number(form.taxPercent) }
      : {}),
    ...(form.taxMode === "amount" && form.taxAmount
      ? { taxAmount: Number(form.taxAmount) }
      : {}),
    ...(form.campaignCode.trim() ? { campaignCode: form.campaignCode.trim() } : {}),
  };
}

function buildAddPayload(
  form: SaleLineForm,
  isWholesaleStoreType: boolean,
): AddSaleLinePayload {
  const common = {
    quantity: Number(form.quantity),
    currency: form.currency,
    unitPrice: Number(form.unitPrice),
    ...(form.discountMode === "percent" && form.discountPercent
      ? { discountPercent: Number(form.discountPercent) }
      : {}),
    ...(form.discountMode === "amount" && form.discountAmount
      ? { discountAmount: Number(form.discountAmount) }
      : {}),
    ...(form.taxMode === "percent" && form.taxPercent
      ? { taxPercent: Number(form.taxPercent) }
      : {}),
    ...(form.taxMode === "amount" && form.taxAmount
      ? { taxAmount: Number(form.taxAmount) }
      : {}),
    ...(form.campaignCode.trim() ? { campaignCode: form.campaignCode.trim() } : {}),
  };

  return isWholesaleStoreType
    ? { productPackageId: form.productVariantId, ...common }
    : { productVariantId: form.productVariantId, ...common };
}

export function useSaleLines({
  isWholesaleStoreType,
  onRefreshSales,
}: UseSaleLinesOptions) {
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
    setLinesDrawerError("");
    setEditingLineId(null);
    setLineOpError("");
    setDeleteLineDialogOpen(false);
    setDeleteLineTarget(null);
    setAddLineExpanded(false);
    setAddLineForm(createLineRow());
    setLinesDrawerOpen(true);
    setLinesDrawerLoading(true);

    try {
      await refreshManagedLines(sale.id);
    } catch {
      setLinesDrawerError("Satirlar yuklenemedi.");
    } finally {
      setLinesDrawerLoading(false);
    }
  }, [refreshManagedLines]);

  const closeManageLinesDrawer = useCallback(() => {
    if (lineOpSubmitting || deletingLine) return;
    setLinesDrawerOpen(false);
    setLinesDrawerSale(null);
    setManagedLines([]);
    setEditingLineId(null);
    setLineOpError("");
    setDeleteLineDialogOpen(false);
    setDeleteLineTarget(null);
    setAddLineExpanded(false);
  }, [deletingLine, lineOpSubmitting]);

  const startEditLine = useCallback((line: SaleDetailLine) => {
    setEditingLineId(line.id);
    setLineOpError("");
    setEditLineForm(createEditLineForm(line));
  }, []);

  const cancelEditLine = useCallback(() => {
    setEditingLineId(null);
    setLineOpError("");
  }, []);

  const submitEditLine = useCallback(async (lineId: string) => {
    if (!linesDrawerSale) return;

    const quantity = toNumberOrNull(editLineForm.quantity);
    const unitPrice = toNumberOrNull(editLineForm.unitPrice);
    if (quantity == null || quantity <= 0) {
      setLineOpError("Gecerli bir adet girin.");
      return;
    }
    if (unitPrice == null || unitPrice < 0) {
      setLineOpError("Gecerli bir birim fiyat girin.");
      return;
    }

    setLineOpSubmitting(true);
    setLineOpError("");

    try {
      await updateSaleLine(linesDrawerSale.id, lineId, buildPatchPayload(editLineForm));
      setEditingLineId(null);
      await refreshManagedLines(linesDrawerSale.id);
      await onRefreshSales();
    } catch {
      setLineOpError("Satir guncellenemedi.");
    } finally {
      setLineOpSubmitting(false);
    }
  }, [editLineForm, linesDrawerSale, onRefreshSales, refreshManagedLines]);

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
      setLineOpError("Satir silinemedi.");
      setDeleteLineDialogOpen(false);
    } finally {
      setDeletingLine(false);
    }
  }, [deleteLineTarget, linesDrawerSale, onRefreshSales, refreshManagedLines]);

  const toggleAddLineExpanded = useCallback(() => {
    setAddLineExpanded((prev) => !prev);
    setLineOpError("");
  }, []);

  const handleEditLineFormChange = useCallback((patch: Partial<ManagedLineEditForm>) => {
    setLineOpError("");
    setEditLineForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleAddLineFormChange = useCallback((patch: Partial<SaleLineForm>) => {
    setLineOpError("");
    setAddLineForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const submitAddLine = useCallback(async () => {
    if (!linesDrawerSale) return;

    const quantity = toNumberOrNull(addLineForm.quantity);
    const unitPrice = toNumberOrNull(addLineForm.unitPrice);
    if (!addLineForm.productVariantId) {
      setLineOpError("Urun/varyant secin.");
      return;
    }
    if (quantity == null || quantity <= 0) {
      setLineOpError("Gecerli bir adet girin.");
      return;
    }
    if (unitPrice == null || unitPrice < 0) {
      setLineOpError("Gecerli bir birim fiyat girin.");
      return;
    }

    setLineOpSubmitting(true);
    setLineOpError("");

    try {
      await addSaleLine(
        linesDrawerSale.id,
        buildAddPayload(addLineForm, isWholesaleStoreType),
      );
      setAddLineExpanded(false);
      setAddLineForm(createLineRow());
      await refreshManagedLines(linesDrawerSale.id);
      await onRefreshSales();
    } catch {
      setLineOpError("Satir eklenemedi.");
    } finally {
      setLineOpSubmitting(false);
    }
  }, [addLineForm, isWholesaleStoreType, linesDrawerSale, onRefreshSales, refreshManagedLines]);

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
