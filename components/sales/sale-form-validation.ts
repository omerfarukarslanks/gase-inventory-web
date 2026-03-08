"use client";

import { toNumberOrNull } from "@/lib/format";
import type { PaymentMethod } from "@/lib/sales";
import type { FieldErrors, SaleLineForm } from "@/components/sales/types";

type SaleFormValidationInput = {
  customerId: string;
  editingSaleId: string | null;
  canTenantOnly: boolean;
  storeId: string;
  paymentMethod: PaymentMethod | "";
  initialPaymentAmount: string;
  lines: SaleLineForm[];
  isWholesaleStoreType: boolean;
};

type SaleFormValidationMessages = {
  customerRequired: string;
  storeRequired: string;
  paymentMethodRequired: string;
  initialPaymentAmountInvalid: string;
  linesRequired: string;
  wholesaleLinesInvalid: string;
  retailLinesInvalid: string;
};

export function validateSaleForm(
  input: SaleFormValidationInput,
  messages: SaleFormValidationMessages,
): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (!input.customerId) {
    nextErrors.customerId = messages.customerRequired;
  }

  if (!input.editingSaleId && input.canTenantOnly && !input.storeId) {
    nextErrors.storeId = messages.storeRequired;
  }

  if (!input.editingSaleId && !input.paymentMethod) {
    nextErrors.paymentMethod = messages.paymentMethodRequired;
  }

  if (!input.editingSaleId) {
    const amount = toNumberOrNull(input.initialPaymentAmount);
    if (amount == null || amount < 0) {
      nextErrors.initialPaymentAmount = messages.initialPaymentAmountInvalid;
    }
  }

  if (!input.editingSaleId) {
    if (input.lines.length === 0) {
      nextErrors.lines = messages.linesRequired;
    } else {
      const invalidLine = input.lines.some((line) => {
        const quantity = toNumberOrNull(line.quantity);
        const unitPrice = toNumberOrNull(line.unitPrice);
        return !line.productVariantId || quantity == null || quantity <= 0 || unitPrice == null || unitPrice < 0;
      });

      if (invalidLine) {
        nextErrors.lines = input.isWholesaleStoreType
          ? messages.wholesaleLinesInvalid
          : messages.retailLinesInvalid;
      }
    }
  }

  return nextErrors;
}
