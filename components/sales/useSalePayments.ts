"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { clearStringError, clearStringRecordError } from "@/lib/form-errors";
import type { Currency } from "@/lib/products";
import {
  createSalePayment,
  deleteSalePayment,
  getSalePayments,
  updateSalePayment,
  type PaymentMethod,
  type SalePayment,
} from "@/lib/sales";
import { buildSalePaymentPayload } from "@/components/sales/payload";
import { validateSalePaymentSubmission } from "@/components/sales/validation";

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
  const { t } = useLang();
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
      setPaymentErrorBySaleId((prev) => clearStringRecordError(prev, saleId));
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
    clearStringError(paymentFormError, setPaymentFormError);
    setPaymentDrawerOpen(true);
  }, [paymentFormError]);

  const openEditPaymentDrawer = useCallback((saleId: string, payment: SalePayment) => {
    setPaymentDrawerSaleId(saleId);
    setEditingPaymentId(payment.id);
    setPaymentAmount(payment.amount != null ? String(payment.amount) : "");
    setPaymentPaidAtInput(normalizePaidAtInput(payment.paidAt));
    setPaymentMethodInput(normalizePaymentMethod(payment.paymentMethod as string | null | undefined));
    setPaymentCurrency(normalizeCurrency(payment.currency as string | null | undefined));
    setPaymentNoteInput(payment.note ?? "");
    clearStringError(paymentFormError, setPaymentFormError);
    setPaymentDrawerOpen(true);
  }, [paymentFormError]);

  const closePaymentDrawer = useCallback(() => {
    if (paymentSubmitting) return;
    setPaymentDrawerOpen(false);
    clearStringError(paymentFormError, setPaymentFormError);
  }, [paymentFormError, paymentSubmitting]);

  const submitPayment = useCallback(async () => {
    const normalizedPaidAt = paymentPaidAtInput.trim();
    const paidAt =
      normalizedPaidAt.length > 0
        ? new Date(`${normalizedPaidAt}T00:00:00.000Z`).toISOString()
        : undefined;

    const validation = validateSalePaymentSubmission(
      {
        saleId: paymentDrawerSaleId,
        amount: paymentAmount,
      },
      {
        saleRequired: t("sales.saleRecordRequired"),
        amountInvalid: t("sales.paymentAmountInvalid"),
      },
    );
    if (validation.error || validation.amount == null) {
      setPaymentFormError(validation.error ?? t("sales.paymentAmountInvalid"));
      return;
    }

    setPaymentSubmitting(true);
    clearStringError(paymentFormError, setPaymentFormError);

    try {
      if (editingPaymentId) {
        await updateSalePayment(
          paymentDrawerSaleId,
          editingPaymentId,
          buildSalePaymentPayload({
            amount: validation.amount,
            paymentMethod: paymentMethodInput,
            note: paymentNoteInput,
            paidAt,
            currency: paymentCurrency,
          }),
        );
        onSuccess(t("sales.paymentUpdatedSuccess"));
      } else {
        await createSalePayment(
          paymentDrawerSaleId,
          buildSalePaymentPayload({
            amount: validation.amount,
            paymentMethod: paymentMethodInput,
            note: paymentNoteInput,
            paidAt,
            currency: paymentCurrency,
          }),
        );
        onSuccess(t("sales.paymentCreatedSuccess"));
      }

      setPaymentDrawerOpen(false);
      setEditingPaymentId(null);
      setPaymentAmount("");
      setPaymentPaidAtInput("");
      setPaymentNoteInput("");
      await fetchSalePayments(paymentDrawerSaleId, true);
      await onRefreshSales();
    } catch {
      setPaymentFormError(
        editingPaymentId ? t("sales.paymentUpdateError") : t("sales.paymentCreateError"),
      );
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
    paymentFormError,
    paymentMethodInput,
    paymentNoteInput,
    paymentPaidAtInput,
    t,
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
      onSuccess(t("sales.paymentDeletedSuccess"));
      setPaymentDeleteDialogOpen(false);
      setPaymentDeleteTarget(null);
      await fetchSalePayments(paymentDeleteTarget.saleId, true);
      await onRefreshSales();
    } catch {
      onError(t("sales.paymentDeleteError"));
    } finally {
      setDeletingPayment(false);
    }
  }, [fetchSalePayments, onError, onRefreshSales, onSuccess, paymentDeleteTarget, t]);

  const withClearedPaymentFormError = useCallback((apply: () => void) => {
    clearStringError(paymentFormError, setPaymentFormError);
    apply();
  }, [paymentFormError]);

  const handlePaymentAmountChange = useCallback((value: string) => {
    withClearedPaymentFormError(() => setPaymentAmount(value));
  }, [withClearedPaymentFormError]);

  const handlePaymentPaidAtInputChange = useCallback((value: string) => {
    withClearedPaymentFormError(() => setPaymentPaidAtInput(value));
  }, [withClearedPaymentFormError]);

  const handlePaymentMethodInputChange = useCallback((value: string) => {
    withClearedPaymentFormError(() => setPaymentMethodInput(normalizePaymentMethod(value)));
  }, [withClearedPaymentFormError]);

  const handlePaymentCurrencyChange = useCallback((value: string) => {
    withClearedPaymentFormError(() => setPaymentCurrency(normalizeCurrency(value)));
  }, [withClearedPaymentFormError]);

  const handlePaymentNoteInputChange = useCallback((value: string) => {
    withClearedPaymentFormError(() => setPaymentNoteInput(value));
  }, [withClearedPaymentFormError]);

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
