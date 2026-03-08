import { formatPrice } from "@/lib/format";
import type { SaleDetail, SaleDetailLine, SaleListItem } from "@/lib/sales";

type TranslateFn = (key: string) => string;

export function getSaleTotal(sale: SaleListItem) {
  if (sale.lineTotal != null) return sale.lineTotal;
  if (sale.total != null) return sale.total;
  if (!Array.isArray(sale.lines)) return null;
  return sale.lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0);
}

export function getPaymentStatusLabel(status?: string | null, t?: TranslateFn) {
  if (!t) return status ?? "-";
  if (status === "PARTIAL") return t("sales.paymentPartial");
  if (status === "PAID") return t("sales.paymentPaid");
  if (status === "UNPAID") return t("sales.paymentUnpaid");
  if (status === "PENDING") return t("sales.paymentPending");
  if (status === "CANCELLED") return t("sales.paymentCancelled");
  if (status === "UPDATED") return t("sales.paymentUpdated");
  if (status === "ACTIVE") return t("common.active");
  return status ?? "-";
}

export function getPaymentStatusClass(status?: string | null) {
  if (status === "PAID" || status === "ACTIVE") {
    return "inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary";
  }
  if (status === "CANCELLED" || status === "UNPAID") {
    return "inline-block rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error";
  }
  return "inline-block rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-medium text-muted";
}

export function getSaleStatusLabel(status?: string | null, t?: TranslateFn) {
  if (!t) return status ?? "-";
  if (status === "CONFIRMED") return t("sales.statusConfirmed");
  if (status === "CANCELLED") return t("sales.statusCancelled");
  if (status === "DRAFT") return t("sales.statusDraft");
  return status ?? "-";
}

export function getSaleStatusClass(status?: string | null) {
  if (status === "CONFIRMED") {
    return "inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary";
  }
  if (status === "CANCELLED") {
    return "inline-block rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error";
  }
  return "inline-block rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-medium text-muted";
}

export function getPaymentMethodLabel(paymentMethod?: string | null, t?: TranslateFn) {
  if (!t) return paymentMethod ?? "-";
  if (paymentMethod === "CASH") return t("sales.methodCash");
  if (paymentMethod === "CARD") return t("sales.methodCard");
  if (paymentMethod === "TRANSFER") return t("sales.methodTransfer");
  if (paymentMethod === "OTHER") return t("sales.methodOther");
  return paymentMethod ?? "-";
}

export function shouldShowAddPaymentButton(remainingAmount?: number | null) {
  if (remainingAmount == null) return true;
  return Number(remainingAmount) !== 0;
}

export function getCurrencySuffix(currency?: string | null) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "EUR";
  if (currency === "TRY") return "TL";
  return currency ?? "";
}

export function formatAmountWithCurrency(
  value: number | string | null | undefined,
  currency?: string | null,
) {
  const formatted = formatPrice(value);
  if (formatted === "-") return "-";
  const suffix = getCurrencySuffix(currency);
  if (!suffix) return formatted;
  return `${formatted}${suffix}`;
}

export function getSaleCustomerFullName(detail: Pick<SaleDetail, "name" | "surname">) {
  return `${detail.name ?? "-"} ${detail.surname ?? ""}`.trim();
}

export function getSaleDetailLineProductLabel(line: SaleDetailLine) {
  return line.productName ?? line.productPackageName ?? "-";
}

export function getSaleDetailLineVariantLabel(line: SaleDetailLine) {
  return line.productVariantName ?? line.productPackageName ?? "-";
}

export function getSaleDetailLineCode(line: SaleDetailLine) {
  return line.productVariantCode ?? "-";
}

export function formatSaleLinePercentOrAmount(
  percent: number | null | undefined,
  amount: number | string | null | undefined,
) {
  if (percent != null) return `%${percent}`;
  return formatPrice(amount);
}
