"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import ProductFilters from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import ProductDrawer from "@/components/products/ProductDrawer";
import PriceDrawer from "@/components/stock/PriceDrawer";

type ProductsPageViewProps = {
  filtersProps: ComponentProps<typeof ProductFilters>;
  tableProps: Omit<ComponentProps<typeof ProductTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof ProductDrawer>;
  priceDrawerProps: ComponentProps<typeof PriceDrawer>;
};

export default function ProductsPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
  priceDrawerProps,
}: ProductsPageViewProps) {
  return (
    <div className="space-y-4">
      <ProductFilters {...filtersProps} />
      <ProductTable
        {...tableProps}
        footer={paginationProps ? <TablePagination {...paginationProps} /> : null}
      />
      <ProductDrawer {...drawerProps} />
      <PriceDrawer {...priceDrawerProps} />
    </div>
  );
}
