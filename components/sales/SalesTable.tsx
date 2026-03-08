"use client";

import type { ReactNode } from "react";
import type { SaleListItem, SalePayment } from "@/lib/sales";
import { useLang } from "@/context/LangContext";
import SalesTableRow from "@/components/sales/SalesTableRow";

type SalesTableProps = {
  salesReceipts: SaleListItem[];
  salesLoading: boolean;
  salesError: string;
  expandedPaymentSaleIds: string[];
  paymentsBySaleId: Record<string, SalePayment[]>;
  paymentLoadingBySaleId: Record<string, boolean>;
  paymentErrorBySaleId: Record<string, string>;
  onTogglePayments: (saleId: string) => void;
  onAddPayment: (saleId: string) => void;
  onEditPayment: (saleId: string, payment: SalePayment) => void;
  onDeletePayment: (saleId: string, payment: SalePayment) => void;
  onOpenDetail: (saleId: string) => void;
  onEdit: (sale: SaleListItem) => void;
  onOpenCancel: (sale: SaleListItem) => void;
  onReturn: (sale: SaleListItem) => void;
  onDownloadReceipt: (saleId: string) => void;
  onManageLines: (sale: SaleListItem) => void;
  canUpdate?: boolean;
  canCancel?: boolean;
  canCreateLines?: boolean;
  canUpdateLines?: boolean;
  canReturn?: boolean;
  canDownloadReceipt?: boolean;
  canCreatePayments?: boolean;
  canUpdatePayments?: boolean;
  footer?: ReactNode;
};

export default function SalesTable({
  salesReceipts,
  salesLoading,
  salesError,
  expandedPaymentSaleIds,
  paymentsBySaleId,
  paymentLoadingBySaleId,
  paymentErrorBySaleId,
  onTogglePayments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onOpenDetail,
  onEdit,
  onOpenCancel,
  onReturn,
  onDownloadReceipt,
  onManageLines,
  canUpdate = true,
  canCancel = true,
  canCreateLines = true,
  canUpdateLines = true,
  canReturn = true,
  canDownloadReceipt = true,
  canCreatePayments = true,
  canUpdatePayments = true,
  footer,
}: SalesTableProps) {
  const { t } = useLang();
  if (salesError) {
    return (
      <section className="overflow-hidden rounded-xl2 border border-border bg-surface">
        <div className="p-6">
          <p className="text-sm text-error">{salesError}</p>
        </div>
        {footer}
      </section>
    );
  }

  if (salesLoading) {
    return (
      <section className="overflow-hidden rounded-xl2 border border-border bg-surface">
        <div className="p-6 text-sm text-muted">{t("sales.receiptsLoading")}</div>
        {footer}
      </section>
    );
  }

  if (salesReceipts.length === 0) {
    return (
      <section className="overflow-hidden rounded-xl2 border border-border bg-surface">
        <div className="p-6 text-sm text-muted">{t("sales.receiptsEmpty")}</div>
        {footer}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl2 border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-315">
          <thead className="border-b border-border bg-surface2/70">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">{t("sales.receiptNo")}</th>
              <th className="px-4 py-3">{t("sales.firstName")}</th>
              <th className="px-4 py-3">{t("sales.surname")}</th>
              <th className="px-4 py-3">{t("sales.paymentStatus")}</th>
              <th className="px-4 py-3">{t("common.status")}</th>
              <th className="px-4 py-3 text-right">{t("sales.currency")}</th>
              <th className="px-4 py-3 text-right">{t("sales.total")}</th>
              <th className="px-4 py-3 text-right">{t("sales.remaining")}</th>
              <th className="sticky right-0 z-20 w-39 bg-surface2/70 px-4 py-3 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.2)]">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {salesReceipts.map((sale) => {
              return (
                <SalesTableRow
                  key={sale.id}
                  sale={sale}
                  isExpanded={expandedPaymentSaleIds.includes(sale.id)}
                  payments={paymentsBySaleId[sale.id] ?? []}
                  loadingPayments={Boolean(paymentLoadingBySaleId[sale.id])}
                  paymentsError={paymentErrorBySaleId[sale.id] ?? ""}
                  onTogglePayments={onTogglePayments}
                  onAddPayment={onAddPayment}
                  onEditPayment={onEditPayment}
                  onDeletePayment={onDeletePayment}
                  onOpenDetail={onOpenDetail}
                  onEdit={onEdit}
                  onOpenCancel={onOpenCancel}
                  onReturn={onReturn}
                  onDownloadReceipt={onDownloadReceipt}
                  onManageLines={onManageLines}
                  canUpdate={canUpdate}
                  canCancel={canCancel}
                  canCreateLines={canCreateLines}
                  canUpdateLines={canUpdateLines}
                  canReturn={canReturn}
                  canDownloadReceipt={canDownloadReceipt}
                  canCreatePayments={canCreatePayments}
                  canUpdatePayments={canUpdatePayments}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {footer}
    </section>
  );
}
