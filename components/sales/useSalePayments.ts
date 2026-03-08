"use client";

import { useCallback, useState } from "react";
import { toNumberOrNull } from "@/lib/format";
import type { Currency } from "@/lib/products";
import {
  createSalePayment,
  deleteSalePayment,
  getSalePayments,
  updateSalePayment,
  type PaymentMethod,
  type SalePayment,
} from "@/lib/sales";

type UseSalePaymentsOptions = {
  paymentsLoadErrorMessage: string;
  onRefreshSales: () => Promise<void>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

function normalizePaymentMethod(value?: string | null): PaymentMethod {
  if (value === "CASH" || value === "CARD" || value === "TRANSFER" || value === "OTHER") {
    return value;
  }
  return "OTHER";
}

function normalizeCurrency(value?: string | null): Currency {
  if (value === "TRY" || value === "USD" || value === "EUR") return value;
  return "TRY";
}

function normalizePaidAtInput(value?: string | null): string {
  if (!value) return "";
  const directDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directDate) return directDate[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function useSalePayments({
  paymentsLoadErrorMessage,
  onRefreshSales,
  onSuccess,
  onError,
}: UseSalePaymentsOptions) {
  const [expandedPaymentSaleIds, setExpandedPaymentSaleIds] = useState<string[]>([]);
  const [paymentsBySaleId, setPaymentsBySaleId] = useState<Record<string, SalePayment[]>>({});
  const [paymentLoadingBySaleId, setPaymentLoadingBySaleId] = useState<Record<string, boolean>>({});
  const [paymentErrorBySaleId, setPaymentErrorBySaleId] = useState<Record<string, string>>({});
  const [paymentDeleteDialogOpen, setPaymentDeleteDialogOpen] = useState(false);
  const [paymentDeleteTarget, setPaymentDeleteTarget] = useState<{
    saleId: string;
    paymentId: string;
  } | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [paymentDrawerSaleId, setPaymentDrawerSaleId] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPaidAtInput, setPaymentPaidAtInput] = useState("");
  const [paymentMethodInput, setPaymentMethodInput] = useState<PaymentMethod>("CASH");
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>("TRY");
  const [paymentNoteInput, setPaymentNoteInput] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState("");

  const fetchSalePayments = useCallback(
    async (saleId: string, force = false) => {
      if (!saleId) return;
      if (!force && paymentLoadingBySaleId[saleId]) return;

      setPaymentLoadingBySaleId((prev) => ({ ...prev, [saleId]: true }));
      setPaymentErrorBySaleId((prev) => ({ ...prev, [saleId]: "" }));
      try {
        const payments = await getSalePayments(saleId);
        setPaymentsBySaleId((prev) => ({ ...prev, [saleId]: payments }));
      } catch {
        setPaymentErrorBySaleId((prev) => ({
          ...prev,
          [saleId]: paymentsLoadErrorMessage,
        }));
      } finally {
        setPaymentLoadingBySaleId((prev) => ({ ...prev, [saleId]: false }));
      }
    },
    [paymentLoadingBySaleId, paymentsLoadErrorMessage],
  );

  const togglePaymentsCollapse = useCallback(
    (saleId: string) => {
      const isExpanded = expandedPaymentSaleIds.includes(saleId);
      if (isExpanded) {
        setExpandedPaymentSaleIds((prev) => prev.filter((id) => id !== saleId));
        return;
      }

      setExpandedPaymentSaleIds((prev) => [...prev, saleId]);
      void fetchSalePayments(saleId, !paymentsBySaleId[saleId]);
    },
    [expandedPaymentSaleIds, fetchSalePayments, paymentsBySaleId],
  );

  const openAddPaymentDrawer = useCallback((saleId: string) => {
    setPaymentDrawerSaleId(saleId);
    setEditingPaymentId(null);
    setPaymentAmount("");
    setPaymentPaidAtInput("");
    setPaymentMethodInput("CASH");
    setPaymentCurrency("TRY");
    setPaymentNoteInput("");
    setPaymentFormError("");
    setPaymentDrawerOpen(true);
  }, []);

  const openEditPaymentDrawer = useCallback((saleId: string, payment: SalePayment) => {
    setPaymentDrawerSaleId(saleId);
    setEditingPaymentId(payment.id);
    setPaymentAmount(payment.amount != null ? String(payment.amount) : "");
    setPaymentPaidAtInput(normalizePaidAtInput(payment.paidAt));
    setPaymentMethodInput(normalizePaymentMethod(payment.paymentMethod as string | null | undefined));
    setPaymentCurrency(normalizeCurrency(payment.currency as string | null | undefined));
    setPaymentNoteInput(payment.note ?? "");
    setPaymentFormError("");
    setPaymentDrawerOpen(true);
  }, []);

  const closePaymentDrawer = useCallback(() => {
    if (paymentSubmitting) return;
    setPaymentDrawerOpen(false);
    setPaymentFormError("");
  }, [paymentSubmitting]);

  const submitPayment = useCallback(async () => {
    const amount = toNumberOrNull(paymentAmount);
    const normalizedPaidAt = paymentPaidAtInput.trim();
    const paidAt =
      normalizedPaidAt.length > 0
        ? new Date(`${normalizedPaidAt}T00:00:00.000Z`).toISOString()
        : undefined;

    if (!paymentDrawerSaleId) {
      setPaymentFormError("Satis kaydi secilmedi.");
      return;
    }

    if (amount == null || amount < 0) {
      setPaymentFormError("Gecerli bir tutar girin.");
      return;
    }

    setPaymentSubmitting(true);
    setPaymentFormError("");

    try {
      if (editingPaymentId) {
        await updateSalePayment(paymentDrawerSaleId, editingPaymentId, {
          amount,
          paymentMethod: paymentMethodInput,
          note: paymentNoteInput.trim() || undefined,
          paidAt,
          currency: paymentCurrency,
        });
        onSuccess("Odeme kaydi guncellendi.");
      } else {
        await createSalePayment(paymentDrawerSaleId, {
          amount,
          paymentMethod: paymentMethodInput,
          note: paymentNoteInput.trim() || undefined,
          paidAt,
          currency: paymentCurrency,
        });
        onSuccess("Odeme kaydi eklendi.");
      }

      setPaymentDrawerOpen(false);
      setEditingPaymentId(null);
      setPaymentAmount("");
      setPaymentPaidAtInput("");
      setPaymentNoteInput("");
      await fetchSalePayments(paymentDrawerSaleId, true);
      await onRefreshSales();
    } catch {
      setPaymentFormError(editingPaymentId ? "Odeme guncellenemedi." : "Odeme olusturulamadi.");
    } finally {
      setPaymentSubmitting(false);
    }
  }, [
    editingPaymentId,
    fetchSalePayments,
    onRefreshSales,
    onSuccess,
    paymentAmount,
    paymentCurrency,
    paymentDrawerSaleId,
    paymentMethodInput,
    paymentNoteInput,
    paymentPaidAtInput,
  ]);

  const openDeletePaymentDialog = useCallback((saleId: string, payment: SalePayment) => {
    setPaymentDeleteTarget({ saleId, paymentId: payment.id });
    setPaymentDeleteDialogOpen(true);
  }, []);

  const closeDeletePaymentDialog = useCallback(() => {
    if (deletingPayment) return;
    setPaymentDeleteDialogOpen(false);
    setPaymentDeleteTarget(null);
  }, [deletingPayment]);

  const confirmDeletePayment = useCallback(async () => {
    if (!paymentDeleteTarget) return;

    setDeletingPayment(true);
    try {
      await deleteSalePayment(paymentDeleteTarget.saleId, paymentDeleteTarget.paymentId);
      onSuccess("Odeme kaydi silindi.");
      setPaymentDeleteDialogOpen(false);
      setPaymentDeleteTarget(null);
      await fetchSalePayments(paymentDeleteTarget.saleId, true);
      await onRefreshSales();
    } catch {
      onError("Odeme kaydi silinemedi. Lutfen tekrar deneyin.");
    } finally {
      setDeletingPayment(false);
    }
  }, [fetchSalePayments, onError, onRefreshSales, onSuccess, paymentDeleteTarget]);

  const handlePaymentAmountChange = useCallback((value: string) => {
    if (paymentFormError) setPaymentFormError("");
    setPaymentAmount(value);
  }, [paymentFormError]);

  const handlePaymentPaidAtInputChange = useCallback((value: string) => {
    if (paymentFormError) setPaymentFormError("");
    setPaymentPaidAtInput(value);
  }, [paymentFormError]);

  const handlePaymentMethodInputChange = useCallback((value: string) => {
    if (paymentFormError) setPaymentFormError("");
    setPaymentMethodInput(normalizePaymentMethod(value));
  }, [paymentFormError]);

  const handlePaymentCurrencyChange = useCallback((value: string) => {
    if (paymentFormError) setPaymentFormError("");
    setPaymentCurrency(normalizeCurrency(value));
  }, [paymentFormError]);

  const handlePaymentNoteInputChange = useCallback((value: string) => {
    if (paymentFormError) setPaymentFormError("");
    setPaymentNoteInput(value);
  }, [paymentFormError]);

  return {
    expandedPaymentSaleIds,
    paymentsBySaleId,
    paymentLoadingBySaleId,
    paymentErrorBySaleId,
    paymentDeleteDialogOpen,
    deletingPayment,
    paymentDrawerOpen,
    editingPaymentId,
    paymentAmount,
    paymentPaidAtInput,
    paymentMethodInput,
    paymentCurrency,
    paymentNoteInput,
    paymentSubmitting,
    paymentFormError,
    fetchSalePayments,
    togglePaymentsCollapse,
    openAddPaymentDrawer,
    openEditPaymentDrawer,
    closePaymentDrawer,
    submitPayment,
    openDeletePaymentDialog,
    closeDeletePaymentDialog,
    confirmDeletePayment,
    handlePaymentAmountChange,
    handlePaymentPaidAtInputChange,
    handlePaymentMethodInputChange,
    handlePaymentCurrencyChange,
    handlePaymentNoteInputChange,
  };
}
