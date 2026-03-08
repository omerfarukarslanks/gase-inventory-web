"use client";

import { toNumberOrNull } from "@/lib/format";
import { omitUndefined, trimToUndefined } from "@/lib/payload";
import type {
  AddSaleLinePayload,
  CancelSaleMeta,
  CreateSalePayload,
  CreateSalePaymentPayload,
  CreateSaleReturnLine,
  CreateSaleReturnPayload,
  PatchSaleLinePayload,
  PaymentMethod,
  UpdateSalePayload,
  UpdateSalePaymentPayload,
} from "@/lib/sales";
import type { ManagedLineEditForm, SaleLineForm } from "@/components/sales/types";

type LinePayloadForm = Pick<
  SaleLineForm,
  | "quantity"
  | "currency"
  | "unitPrice"
  | "discountMode"
  | "discountPercent"
  | "discountAmount"
  | "taxMode"
  | "taxPercent"
  | "taxAmount"
  | "campaignCode"
> |
  ManagedLineEditForm;

function toOptionalNumberInput(value: string): number | undefined {
  const numericValue = toNumberOrNull(value.trim());
  return numericValue == null ? undefined : numericValue;
}

function buildLineCommonPayload(form: LinePayloadForm) {
  return omitUndefined({
    quantity: Number(form.quantity),
    currency: form.currency,
    unitPrice: Number(form.unitPrice),
    discountPercent:
      form.discountMode === "percent" ? toOptionalNumberInput(form.discountPercent) : undefined,
    discountAmount:
      form.discountMode === "amount" ? toOptionalNumberInput(form.discountAmount) : undefined,
    taxPercent: form.taxMode === "percent" ? toOptionalNumberInput(form.taxPercent) : undefined,
    taxAmount: form.taxMode === "amount" ? toOptionalNumberInput(form.taxAmount) : undefined,
    campaignCode: trimToUndefined(form.campaignCode),
  });
}

export function buildAddSaleLinePayload(
  form: SaleLineForm,
  isWholesaleStoreType: boolean,
): AddSaleLinePayload {
  const common = buildLineCommonPayload(form);

  return isWholesaleStoreType
    ? { productPackageId: form.productVariantId, ...common }
    : { productVariantId: form.productVariantId, ...common };
}

export function buildPatchSaleLinePayload(form: ManagedLineEditForm): PatchSaleLinePayload {
  return buildLineCommonPayload(form);
}

export function buildCreateSaleLinePayloads(
  lines: SaleLineForm[],
  isWholesaleStoreType: boolean,
) {
  return lines.map((line) => buildAddSaleLinePayload(line, isWholesaleStoreType));
}

export function buildCreateSalePayload(input: {
  canTenantOnly: boolean;
  storeId: string;
  customerId: string;
  note: string;
  lines: SaleLineForm[];
  isWholesaleStoreType: boolean;
  initialPaymentAmount: string;
  paymentMethod: PaymentMethod;
}): CreateSalePayload {
  return omitUndefined({
    storeId: input.canTenantOnly ? undefined : trimToUndefined(input.storeId),
    customerId: input.customerId,
    meta: buildSaleMeta(input.note),
    lines: buildCreateSaleLinePayloads(input.lines, input.isWholesaleStoreType),
    initialPayment: {
      amount: Number(input.initialPaymentAmount),
      paymentMethod: input.paymentMethod,
    },
  });
}

export function buildUpdateSalePayload(input: {
  customerId: string;
  note: string;
}): UpdateSalePayload {
  return omitUndefined({
    customerId: input.customerId,
    meta: buildSaleMeta(input.note),
  });
}

export function buildSaleMeta(note: string): { note?: string } | undefined {
  const meta = omitUndefined({
    note: trimToUndefined(note),
  });

  return Object.keys(meta).length > 0 ? meta : undefined;
}

export function buildSalePaymentPayload({
  amount,
  paymentMethod,
  note,
  paidAt,
  currency,
}: {
  amount: number;
  paymentMethod: CreateSalePaymentPayload["paymentMethod"] | UpdateSalePaymentPayload["paymentMethod"];
  note: string;
  paidAt?: string;
  currency: CreateSalePaymentPayload["currency"] | UpdateSalePaymentPayload["currency"];
}): CreateSalePaymentPayload {
  return omitUndefined({
    amount,
    paymentMethod,
    note: trimToUndefined(note),
    paidAt,
    currency,
  });
}

export function buildCancelSaleMeta(reason: string, note: string): CancelSaleMeta | undefined {
  const meta = omitUndefined({
    reason: trimToUndefined(reason),
    note: trimToUndefined(note),
  });

  return Object.keys(meta).length > 0 ? meta : undefined;
}

export function buildSaleReturnPayload(
  lines: CreateSaleReturnLine[],
  notes: string,
): CreateSaleReturnPayload {
  return omitUndefined({
    lines,
    notes: trimToUndefined(notes),
  });
}
