"use client";

import { toNumberOrNull } from "@/lib/format";
import type { CreateSaleReturnLine, SaleDetailLine } from "@/lib/sales";
import type {
  ManagedLineEditForm,
  ReturnLineForm,
  SaleLineForm,
} from "@/components/sales/types";

type LineValidationMessages = {
  quantityInvalid: string;
  unitPriceInvalid: string;
};

export function validateManagedSaleLineForm(
  form: Pick<ManagedLineEditForm, "quantity" | "unitPrice">,
  messages: LineValidationMessages,
): string | null {
  const quantity = toNumberOrNull(form.quantity);
  if (quantity == null || quantity <= 0) {
    return messages.quantityInvalid;
  }

  const unitPrice = toNumberOrNull(form.unitPrice);
  if (unitPrice == null || unitPrice < 0) {
    return messages.unitPriceInvalid;
  }

  return null;
}

export function validateAddSaleLineForm(
  form: Pick<SaleLineForm, "productVariantId" | "quantity" | "unitPrice">,
  messages: LineValidationMessages & {
    itemRequired: string;
  },
): string | null {
  if (!form.productVariantId) {
    return messages.itemRequired;
  }

  return validateManagedSaleLineForm(form, messages);
}

type SalePaymentValidationMessages = {
  saleRequired: string;
  amountInvalid: string;
};

export function validateSalePaymentSubmission(
  input: {
    saleId: string;
    amount: string;
  },
  messages: SalePaymentValidationMessages,
): { error: string | null; amount: number | null } {
  if (!input.saleId) {
    return { error: messages.saleRequired, amount: null };
  }

  const amount = toNumberOrNull(input.amount);
  if (amount == null || amount < 0) {
    return { error: messages.amountInvalid, amount: null };
  }

  return { error: null, amount };
}

export function createReturnLineForm(line: SaleDetailLine): ReturnLineForm {
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

export function getSelectedReturnLines(lines: ReturnLineForm[]): ReturnLineForm[] {
  return lines.filter((line) => {
    if (line.returnMode === "variants") {
      return line.packageVariantReturns.some((variant) => Number(variant.returnQuantity) > 0);
    }

    return line.returnQuantity !== "" && Number(line.returnQuantity) > 0;
  });
}

export function hasInvalidReturnSelection(line: ReturnLineForm): boolean {
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

export function validateSaleReturnSelection(
  lines: ReturnLineForm[],
  messages: {
    selectionRequired: string;
    quantityInvalid: string;
  },
): { error: string | null; selectedLines: ReturnLineForm[] } {
  const selectedLines = getSelectedReturnLines(lines);

  if (selectedLines.length === 0) {
    return { error: messages.selectionRequired, selectedLines: [] };
  }

  if (selectedLines.some(hasInvalidReturnSelection)) {
    return { error: messages.quantityInvalid, selectedLines };
  }

  return { error: null, selectedLines };
}

export function buildReturnPayloadLine(line: ReturnLineForm): CreateSaleReturnLine {
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
