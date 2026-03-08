"use client";

import { useCallback } from "react";
import { useLang } from "@/context/LangContext";
import { clearStringError } from "@/lib/form-errors";
import {
  createSale,
  updateSale,
  type PaymentMethod,
} from "@/lib/sales";
import {
  buildCreateSalePayload,
  buildUpdateSalePayload,
} from "@/components/sales/payload";
import { validateSaleForm } from "@/components/sales/sale-form-validation";
import type { FieldErrors, SaleLineForm } from "@/components/sales/types";

type UseSaleSubmitActionsOptions = {
  editingSaleId: string | null;
  canTenantOnly: boolean;
  storeId: string;
  customerId: string;
  note: string;
  lines: SaleLineForm[];
  isWholesaleStoreType: boolean;
  initialPaymentAmount: string;
  paymentMethod: PaymentMethod | "";
  formError: string;
  setErrors: (errors: FieldErrors) => void;
  setSubmitting: (value: boolean) => void;
  setFormError: (message: string) => void;
  onSuccess: (message: string) => void;
  onCompleteSuccess: () => Promise<void>;
};

export function useSaleSubmitActions({
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
  onCompleteSuccess,
}: UseSaleSubmitActionsOptions) {
  const { t } = useLang();

  const validate = useCallback((): boolean => {
    const nextErrors = validateSaleForm(
      {
        customerId,
        editingSaleId,
        canTenantOnly,
        storeId,
        paymentMethod,
        initialPaymentAmount,
        lines,
        isWholesaleStoreType,
      },
      {
        customerRequired: t("sales.customerRequired"),
        storeRequired: t("stock.storeRequired"),
        paymentMethodRequired: t("sales.paymentMethodRequired"),
        initialPaymentAmountInvalid: t("sales.initialPaymentAmountInvalid"),
        linesRequired: t("sales.linesRequired"),
        wholesaleLinesInvalid: t("sales.wholesaleLinesInvalid"),
        retailLinesInvalid: t("sales.retailLinesInvalid"),
      },
    );

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [
    canTenantOnly,
    customerId,
    editingSaleId,
    initialPaymentAmount,
    isWholesaleStoreType,
    lines,
    paymentMethod,
    setErrors,
    storeId,
    t,
  ]);

  const submitCreateSale = useCallback(async () => {
    const payload = buildCreateSalePayload({
      canTenantOnly,
      storeId,
      customerId,
      note,
      lines,
      isWholesaleStoreType,
      initialPaymentAmount,
      paymentMethod: paymentMethod as PaymentMethod,
    });

    await createSale(payload);
    onSuccess(t("sales.saleCreatedSuccess"));
  }, [
    canTenantOnly,
    customerId,
    initialPaymentAmount,
    isWholesaleStoreType,
    lines,
    note,
    onSuccess,
    paymentMethod,
    storeId,
    t,
  ]);

  const submitUpdateSale = useCallback(async (saleId: string) => {
    const payload = buildUpdateSalePayload({
      customerId,
      note,
    });

    await updateSale(saleId, payload);
    onSuccess(t("sales.saleUpdatedSuccess"));
  }, [customerId, note, onSuccess, t]);

  const onSubmit = useCallback(async () => {
    clearStringError(formError, setFormError);

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingSaleId) {
        await submitUpdateSale(editingSaleId);
      } else {
        await submitCreateSale();
      }

      await onCompleteSuccess();
    } catch {
      setFormError(
        editingSaleId
          ? t("sales.saleUpdateError")
          : t("sales.saleCreateError"),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    editingSaleId,
    formError,
    onCompleteSuccess,
    setFormError,
    setSubmitting,
    submitCreateSale,
    submitUpdateSale,
    t,
    validate,
  ]);

  return {
    onSubmit,
  };
}
