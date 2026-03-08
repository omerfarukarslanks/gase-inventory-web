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
import PageHeader from "@/components/ui/PageHeader";
import StatusBanner from "@/components/ui/StatusBanner";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

type SalesPageViewProps = {
  title: string;
  description: string;
  success: string;
  actionError?: string;
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
  actionError,
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
      <PageHeader title={title} description={description} />

      <SalesFilters {...filtersProps} />

      {actionError && (
        <StatusBanner tone="error">
          {actionError}
        </StatusBanner>
      )}

      {success && (
        <StatusBanner tone="success" className="bg-primary/10 p-3">
          {success}
        </StatusBanner>
      )}

      <SalesTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />

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
