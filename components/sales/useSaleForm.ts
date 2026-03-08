"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { clearFieldError as clearObjectFieldError, clearStringError } from "@/lib/form-errors";
import {
  getSaleById,
  type PaymentMethod,
} from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
import {
  mapSaleDetailToEditState,
  type SaleEditState,
} from "@/components/sales/edit-state";
import {
  type FieldErrors,
  type VariantPreset,
} from "@/components/sales/types";
import { useSaleLineState } from "@/components/sales/useSaleLineState";
import { useSaleCustomerState } from "@/components/sales/useSaleCustomerState";
import { useSaleDrawerLifecycle } from "@/components/sales/useSaleDrawerLifecycle";
import { useSaleSubmitActions } from "@/components/sales/useSaleSubmitActions";

type UseSaleFormOptions = {
  canTenantOnly: boolean;
  scopedStoreId: string;
  isWholesaleStoreType: boolean;
  variantPresetsById: Record<string, VariantPreset>;
  onRefreshSales: () => Promise<void>;
  onSuccess: (message: string) => void;
  clearFeedback?: () => void;
};

export function useSaleForm({
  canTenantOnly,
  scopedStoreId,
  isWholesaleStoreType,
  variantPresetsById,
  onRefreshSales,
  onSuccess,
  clearFeedback,
}: UseSaleFormOptions) {
  const { t } = useLang();
  const [storeId, setStoreId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("CASH");
  const [initialPaymentAmount, setInitialPaymentAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setErrors((prev) => clearObjectFieldError(prev, field, undefined));
  }, []);

  const clearLinesError = useCallback(() => {
    setErrors((prev) => clearObjectFieldError(prev, "lines", undefined));
  }, []);

  const clearCustomerError = useCallback(() => {
    clearFieldError("customerId");
  }, [clearFieldError]);

  const {
    customerId,
    customerDropdownRefreshKey,
    customerPreview,
    applyCustomerState,
    resetCustomerState,
    handleCustomerIdChange,
    selectCustomer,
    quickCreateCustomer,
  } = useSaleCustomerState({
    onCustomerChanged: clearCustomerError,
  });

  const {
    lines,
    setLines,
    resetLines,
    onChangeLine,
    applyVariantPreset,
    addLine,
    removeLine,
  } = useSaleLineState({
    storeId,
    variantPresetsById,
    onLinesMutated: clearLinesError,
  });

  const applyEditState = useCallback((editState: ReturnType<typeof mapSaleDetailToEditState>) => {
    applyCustomerState(editState.customerId, editState.customerPreview);
    setNote(editState.note);
    if (editState.storeId) {
      setStoreId(editState.storeId);
    }
    setLines(editState.lines);
  }, [applyCustomerState, setLines]);

  const resetSaleForm = useCallback(() => {
    setStoreId(canTenantOnly ? scopedStoreId : "");
    resetCustomerState();
    setPaymentMethod("CASH");
    setInitialPaymentAmount("");
    setNote("");
    resetLines();
    setErrors({});
    setFormError("");
  }, [canTenantOnly, resetCustomerState, resetLines, scopedStoreId]);

  const clearFormError = useCallback(() => {
    clearStringError(formError, setFormError);
  }, [formError]);

  const loadEditState = useCallback(async (saleId: string): Promise<SaleEditState | null> => {
    const response = await getSaleById(saleId);
    const detail = normalizeSaleDetail(response);
    return detail ? mapSaleDetailToEditState(detail) : null;
  }, []);

  const {
    saleDrawerOpen,
    editingSaleId,
    openSaleDrawer,
    closeSaleDrawer,
    closeCompletedDrawer,
    openEditDrawer,
  } = useSaleDrawerLifecycle({
    isBusy: submitting,
    setBusy: setSubmitting,
    clearFeedback,
    clearFormError,
    setFormError,
    resetSaleForm,
    applyEditState,
    loadEditState,
    messages: {
      saleDetailUnavailable: t("sales.saleDetailUnavailable"),
      saleDetailLoadError: t("sales.saleDetailLoadError"),
    },
  });

  const completeSuccessfulSubmit = useCallback(async () => {
    resetSaleForm();
    closeCompletedDrawer();
    await onRefreshSales();
  }, [closeCompletedDrawer, onRefreshSales, resetSaleForm]);

  const { onSubmit } = useSaleSubmitActions({
    editingSaleId,
    canTenantOnly,
    storeId,
    customerId,
    note,
    lines,
    isWholesaleStoreType,
    initialPaymentAmount,
    paymentMethod,
    formError,
    setErrors,
    setSubmitting,
    setFormError,
    onSuccess,
    onCompleteSuccess: completeSuccessfulSubmit,
  });

  return {
    saleDrawerOpen,
    editingSaleId,
    storeId,
    customerId,
    customerDropdownRefreshKey,
    name: customerPreview.name,
    surname: customerPreview.surname,
    phoneNumber: customerPreview.phoneNumber,
    email: customerPreview.email,
    paymentMethod,
    initialPaymentAmount,
    note,
    lines,
    errors,
    submitting,
    formError,
    clearFieldError,
    handleCustomerIdChange,
    onSelectCustomer: selectCustomer,
    onQuickCreateCustomer: quickCreateCustomer,
    onChangeLine,
    applyVariantPreset,
    addLine,
    removeLine,
    openSaleDrawer,
    closeSaleDrawer,
    openEditDrawer,
    onSubmit,
    setStoreId,
    setPaymentMethod,
    setInitialPaymentAmount,
    setNote,
  };
}
