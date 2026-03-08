"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import StockFilters from "@/components/stock/StockFilters";
import StockTable from "@/components/stock/StockTable";
import AdjustDrawer from "@/components/stock/AdjustDrawer";
import TransferDrawer from "@/components/stock/TransferDrawer";
import ReceiveDrawer from "@/components/stock/ReceiveDrawer";
import ProductInventoryDrawer from "@/components/stock/ProductInventoryDrawer";

type StockPageViewProps = {
  success: string;
  filtersProps: ComponentProps<typeof StockFilters>;
  tableProps: Omit<ComponentProps<typeof StockTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  adjustDrawerProps: ComponentProps<typeof AdjustDrawer>;
  transferDrawerProps: ComponentProps<typeof TransferDrawer>;
  receiveDrawerProps: ComponentProps<typeof ReceiveDrawer>;
  productInventoryDrawerProps: ComponentProps<typeof ProductInventoryDrawer>;
};

export default function StockPageView({
  success,
  filtersProps,
  tableProps,
  paginationProps,
  adjustDrawerProps,
  transferDrawerProps,
  receiveDrawerProps,
  productInventoryDrawerProps,
}: StockPageViewProps) {
  return (
    <div className="space-y-4">
      <StockFilters {...filtersProps} />

      {success && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {success}
        </div>
      )}

      <StockTable
        {...tableProps}
        footer={paginationProps ? <TablePagination {...paginationProps} /> : null}
      />

      <AdjustDrawer {...adjustDrawerProps} />
      <TransferDrawer {...transferDrawerProps} />
      <ReceiveDrawer {...receiveDrawerProps} />
      <ProductInventoryDrawer {...productInventoryDrawerProps} />
    </div>
  );
}
