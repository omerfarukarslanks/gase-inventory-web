"use client";

import { useCallback, useMemo, useState } from "react";
import type { Currency } from "@/lib/products";
import { buildInventoryMeta } from "@/components/stock/product-inventory";
import type {
  ProductInventoryOperation,
  ProductInventoryTarget,
} from "@/components/stock/product-inventory-types";
import {
  buildInventorySubmitMessages,
  submitMultiInventoryOperation,
  submitSingleInventoryOperation,
} from "@/components/stock/product-inventory-submit";

type TranslateFn = (key: string) => string;

type UseProductInventorySubmitActionsOptions = {
  operation: ProductInventoryOperation | null;
  target: ProductInventoryTarget | null;
  applyToAllVariants: boolean;
  supplierId: string;
  storeId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: string;
  newQuantity: string;
  unitPrice: string;
  currency: Currency;
  applyToAllStores: boolean;
  reason: string;
  note: string;
  variantQtys: Record<string, string>;
  variantNewQtys: Record<string, string>;
  variantStoreIds: Record<string, string>;
  onClose: () => void;
  onSuccess: (message: string) => void;
  t: TranslateFn;
};

export function useProductInventorySubmitActions({
  operation,
  target,
  applyToAllVariants,
  supplierId,
  storeId,
  fromStoreId,
  toStoreId,
  quantity,
  newQuantity,
  unitPrice,
  currency,
  applyToAllStores,
  reason,
  note,
  variantQtys,
  variantNewQtys,
  variantStoreIds,
  onClose,
  onSuccess,
  t,
}: UseProductInventorySubmitActionsOptions) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const resetSubmissionState = useCallback(() => {
    setSubmitting(false);
    setFormError("");
  }, []);

  const completeSuccessfulSubmit = useCallback(
    async (message: string) => {
      onSuccess(message);
      onClose();
    },
    [onClose, onSuccess],
  );

  const messages = useMemo(() => buildInventorySubmitMessages(t), [t]);

  const handleSubmit = useCallback(async () => {
    if (!target || !operation) return;
    setFormError("");

    const meta = buildInventoryMeta(reason, note);

    setSubmitting(true);
    try {
      const error = applyToAllVariants
        ? await submitSingleInventoryOperation({
            operation,
            target,
            storeId,
            applyToAllStores,
            supplierId,
            quantity,
            newQuantity,
            unitPrice,
            currency,
            fromStoreId,
            toStoreId,
            meta,
            messages,
            onSuccess: completeSuccessfulSubmit,
          })
        : await submitMultiInventoryOperation({
            operation,
            target,
            storeId,
            supplierId,
            unitPrice,
            currency,
            fromStoreId,
            toStoreId,
            variantQtys,
            variantNewQtys,
            variantStoreIds,
            meta,
            messages,
            onSuccess: completeSuccessfulSubmit,
          });

      if (error) {
        setFormError(error);
      }
    } catch {
      setFormError(messages.operationError);
    } finally {
      setSubmitting(false);
    }
  }, [
    applyToAllVariants,
    applyToAllStores,
    completeSuccessfulSubmit,
    currency,
    fromStoreId,
    messages,
    note,
    newQuantity,
    operation,
    quantity,
    reason,
    storeId,
    supplierId,
    target,
    toStoreId,
    unitPrice,
    variantNewQtys,
    variantQtys,
    variantStoreIds,
  ]);

  return {
    submitting,
    formError,
    resetSubmissionState,
    handleSubmit,
  };
}
