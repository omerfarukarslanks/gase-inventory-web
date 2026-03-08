"use client";

import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";
import type { SaleDetail } from "@/lib/sales";
import {
  formatAmountWithCurrency,
  getPaymentStatusLabel,
  getSaleCustomerFullName,
  getSaleStatusLabel,
} from "@/components/sales/display";

type TranslateFn = (key: string) => string;

type SaleDetailSummaryCardsProps = {
  detail: SaleDetail;
  t: TranslateFn;
};

type SummaryCardProps = {
  title: string;
  children: ReactNode;
};

function SummaryCard({ title, children }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface2/30 p-3">
      <p className="text-xs font-semibold text-muted">{title}</p>
      <div className="mt-1 space-y-1">{children}</div>
    </div>
  );
}

export default function SaleDetailSummaryCards({ detail, t }: SaleDetailSummaryCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard title={t("sales.buyerInfo")}>
        <p className="text-sm font-medium text-text">{getSaleCustomerFullName(detail)}</p>
        <p className="text-xs text-text2">{detail.phoneNumber || "-"}</p>
        <p className="text-xs text-text2">{detail.email || "-"}</p>
      </SummaryCard>

      <SummaryCard title={t("sales.saleInfo")}>
        <p className="text-xs text-text2">
          {t("common.status")}: {getSaleStatusLabel(detail.status, t)}
        </p>
        <p className="text-xs text-text2">
          {t("sales.paymentStatus")}: {getPaymentStatusLabel(detail.paymentStatus, t)}
        </p>
        <p className="text-xs text-text2">
          {t("sales.sourceLabel")}: {detail.source || "-"}
        </p>
        <p className="text-xs text-text2">
          {t("sales.storeLabel")}: {detail.storeName || "-"}
        </p>
      </SummaryCard>

      <SummaryCard title={t("sales.amountsTitle")}>
        <p className="text-xs font-medium text-text">
          {t("stock.lineTotal")}: {formatAmountWithCurrency(detail.lineTotal, detail.currency)}
        </p>
        <p className="text-xs text-text2">
          {t("sales.paidLabel")}: {formatAmountWithCurrency(detail.paidAmount, detail.currency)}
        </p>
        <p className="text-xs text-text2">
          {t("sales.remaining")}: {formatAmountWithCurrency(detail.remainingAmount, detail.currency)}
        </p>
      </SummaryCard>

      <SummaryCard title={t("sales.dateTitle")}>
        <p className="text-xs text-text2">
          {t("sales.purchaseDate")}: {formatDate(detail.createdAt)}
        </p>
        <p className="text-xs text-text2">
          {t("sales.updateDate")}: {formatDate(detail.updatedAt)}
        </p>
      </SummaryCard>
    </div>
  );
}
