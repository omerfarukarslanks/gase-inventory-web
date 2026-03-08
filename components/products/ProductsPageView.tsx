"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import ProductFilters from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import ProductDrawer from "@/components/products/ProductDrawer";
import PriceDrawer from "@/components/stock/PriceDrawer";
import TableFooterPagination from "@/components/ui/TableFooterPagination";
import StatusBanner from "@/components/ui/StatusBanner";

type ProductsPageViewProps = {
  success?: string;
  actionError?: string;
  filtersProps: ComponentProps<typeof ProductFilters>;
  tableProps: Omit<ComponentProps<typeof ProductTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof ProductDrawer>;
  priceDrawerProps: ComponentProps<typeof PriceDrawer>;
};

export default function ProductsPageView({
  success,
  actionError,
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
  priceDrawerProps,
}: ProductsPageViewProps) {
  return (
    <div className="space-y-4">
      <ProductFilters {...filtersProps} />
      {actionError && (
        <StatusBanner tone="error">
          {actionError}
        </StatusBanner>
      )}
      {success && (
        <StatusBanner tone="success">
          {success}
        </StatusBanner>
      )}
      <ProductTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />
      <ProductDrawer {...drawerProps} />
      <PriceDrawer {...priceDrawerProps} />
    </div>
  );
}
