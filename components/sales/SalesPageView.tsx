"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import SalesFilters from "@/components/sales/SalesFilters";
import SalesTable from "@/components/sales/SalesTable";
import SaleDrawer from "@/components/sales/SaleDrawer";
import SalePaymentDrawer from "@/components/sales/SalePaymentDrawer";
import SaleCancelDialog from "@/components/sales/SaleCancelDialog";
import SaleDeletePaymentDialog from "@/components/sales/SaleDeletePaymentDialog";
import SaleDetailModal from "@/components/sales/SaleDetailModal";
import SaleReturnDrawer from "@/components/sales/SaleReturnDrawer";
import SaleLinesDrawer from "@/components/sales/SaleLinesDrawer";
import SaleDeleteLineDialog from "@/components/sales/SaleDeleteLineDialog";

type SalesPageViewProps = {
  title: string;
  description: string;
  success: string;
  filtersProps: ComponentProps<typeof SalesFilters>;
  tableProps: Omit<ComponentProps<typeof SalesTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  saleDrawerProps: ComponentProps<typeof SaleDrawer>;
  salePaymentDrawerProps: ComponentProps<typeof SalePaymentDrawer>;
  saleCancelDialogProps: ComponentProps<typeof SaleCancelDialog>;
  saleDeletePaymentDialogProps: ComponentProps<typeof SaleDeletePaymentDialog>;
  saleDetailModalProps: ComponentProps<typeof SaleDetailModal>;
  saleReturnDrawerProps: ComponentProps<typeof SaleReturnDrawer>;
  saleLinesDrawerProps: ComponentProps<typeof SaleLinesDrawer>;
  saleDeleteLineDialogProps: ComponentProps<typeof SaleDeleteLineDialog>;
};

export default function SalesPageView({
  title,
  description,
  success,
  filtersProps,
  tableProps,
  paginationProps,
  saleDrawerProps,
  salePaymentDrawerProps,
  saleCancelDialogProps,
  saleDeletePaymentDialogProps,
  saleDetailModalProps,
  saleReturnDrawerProps,
  saleLinesDrawerProps,
  saleDeleteLineDialogProps,
}: SalesPageViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        <p className="text-sm text-muted">{description}</p>
      </div>

      <SalesFilters {...filtersProps} />

      <SalesTable
        {...tableProps}
        footer={paginationProps ? <TablePagination {...paginationProps} /> : null}
      />

      {success && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {success}
        </div>
      )}

      <SaleDrawer {...saleDrawerProps} />
      <SalePaymentDrawer {...salePaymentDrawerProps} />
      <SaleCancelDialog {...saleCancelDialogProps} />
      <SaleDeletePaymentDialog {...saleDeletePaymentDialogProps} />
      <SaleDetailModal {...saleDetailModalProps} />
      <SaleReturnDrawer {...saleReturnDrawerProps} />
      <SaleLinesDrawer {...saleLinesDrawerProps} />
      <SaleDeleteLineDialog {...saleDeleteLineDialogProps} />
    </div>
  );
}
