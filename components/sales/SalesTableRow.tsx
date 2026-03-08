"use client";

import type { SaleListItem, SalePayment } from "@/lib/sales";
import RowActionMenu, { type RowActionMenuItem } from "@/components/ui/RowActionMenu";
import { useLang } from "@/context/LangContext";
import { formatPrice } from "@/lib/format";
import VirtualSalePaymentsTable from "@/components/sales/VirtualSalePaymentsTable";
import {
  getPaymentStatusClass,
  getPaymentStatusLabel,
  getSaleStatusClass,
  getSaleStatusLabel,
  getSaleTotal,
  shouldShowAddPaymentButton,
} from "@/components/sales/display";

type SalesTableRowProps = {
  sale: SaleListItem;
  isExpanded: boolean;
  payments: SalePayment[];
  loadingPayments: boolean;
  paymentsError: string;
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
  canUpdate: boolean;
  canCancel: boolean;
  canCreateLines: boolean;
  canUpdateLines: boolean;
  canReturn: boolean;
  canDownloadReceipt: boolean;
  canCreatePayments: boolean;
  canUpdatePayments: boolean;
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function SalesTableRow({
  sale,
  isExpanded,
  payments,
  loadingPayments,
  paymentsError,
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
  canUpdate,
  canCancel,
  canCreateLines,
  canUpdateLines,
  canReturn,
  canDownloadReceipt,
  canCreatePayments,
  canUpdatePayments,
}: SalesTableRowProps) {
  const { t } = useLang();
  const showAddPaymentButton = shouldShowAddPaymentButton(sale.remainingAmount);
  const isCancelledSale = sale.status === "CANCELLED";
  const isConfirmedSale = sale.status === "CONFIRMED";
  const actionItems: RowActionMenuItem[] = [];

  if (isCancelledSale) {
    if (canDownloadReceipt) {
      actionItems.push({
        key: "print",
        label: t("sales.print"),
        onClick: () => onDownloadReceipt(sale.id),
      });
    }
  } else {
    if (showAddPaymentButton && canCreatePayments) {
      actionItems.push({
        key: "add-payment",
        label: t("sales.addPayment"),
        onClick: () => onAddPayment(sale.id),
      });
    }

    if (isConfirmedSale) {
      if (canUpdate) {
        actionItems.push({
          key: "edit",
          label: t("common.edit"),
          onClick: () => onEdit(sale),
        });
      }
      if (canUpdateLines || canCreateLines) {
        actionItems.push({
          key: "manage-lines",
          label: t("sales.manageLines"),
          onClick: () => onManageLines(sale),
        });
      }
      if (canReturn) {
        actionItems.push({
          key: "return",
          label: t("sales.createReturn"),
          onClick: () => onReturn(sale),
        });
      }
      if (canDownloadReceipt) {
        actionItems.push({
          key: "print",
          label: t("sales.print"),
          onClick: () => onDownloadReceipt(sale.id),
        });
      }
      if (canCancel) {
        actionItems.push({
          key: "cancel",
          label: t("sales.cancelSale"),
          tone: "danger",
          onClick: () => onOpenCancel(sale),
        });
      }
    }
  }

  const hasActionMenuItems = actionItems.length > 0;

  return (
    <>
      <tr className="group border-b border-border transition-colors hover:bg-surface2/30">
        <td className="px-4 py-3 text-sm text-text2">
          <button
            type="button"
            onClick={() => onTogglePayments(sale.id)}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface2 hover:text-text"
            aria-label={isExpanded ? t("sales.paymentCancelled") : t("sales.addPayment")}
            title={isExpanded ? t("sales.paymentCancelled") : t("sales.addPayment")}
          >
            <ChevronIcon expanded={isExpanded} />
          </button>
        </td>
        <td className="px-4 py-3 text-sm text-text2">
          <button
            type="button"
            onClick={() => onOpenDetail(sale.id)}
            className="cursor-pointer text-left text-primary underline-offset-2 transition-colors hover:text-primary/80 hover:underline"
          >
            {sale.receiptNo ?? sale.id}
          </button>
        </td>
        <td className="px-4 py-3 text-sm text-text2">{sale.name ?? "-"}</td>
        <td className="px-4 py-3 text-sm text-text2">{sale.surname ?? "-"}</td>
        <td className="px-4 py-3 text-sm">
          <span className={getPaymentStatusClass(sale.paymentStatus)}>
            {getPaymentStatusLabel(sale.paymentStatus, t)}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={getSaleStatusClass(sale.status)}>
            {getSaleStatusLabel(sale.status, t)}
          </span>
        </td>
        <td className="px-4 py-3 text-right text-sm text-text2">{sale.currency}</td>
        <td className="px-4 py-3 text-right text-sm font-medium text-text">
          {formatPrice(getSaleTotal(sale))}
        </td>
        <td className="px-4 py-3 text-right text-sm text-text2">
          {formatPrice(sale.remainingAmount)}
        </td>
        <td className="sticky right-0 z-10 w-39 bg-surface px-4 py-3 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.2)] group-hover:bg-surface2/50">
          {hasActionMenuItems ? <RowActionMenu items={actionItems} /> : <span className="text-sm text-muted">-</span>}
        </td>
      </tr>

      {isExpanded ? (
        <tr className="border-b border-border bg-surface2/20">
          <td colSpan={10} className="px-4 py-3">
            <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
              {loadingPayments ? (
                <p className="text-sm text-muted">{t("sales.paymentsLoading")}</p>
              ) : paymentsError ? (
                <p className="text-sm text-error">{paymentsError}</p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted">{t("sales.paymentsEmpty")}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <VirtualSalePaymentsTable
                    saleId={sale.id}
                    payments={payments}
                    onEditPayment={onEditPayment}
                    onDeletePayment={onDeletePayment}
                    canUpdatePayments={canUpdatePayments}
                  />
                </div>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
