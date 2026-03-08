"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import ProductPackageFilters from "@/components/product-packages/ProductPackageFilters";
import ProductPackageTable from "@/components/product-packages/ProductPackageTable";
import ProductPackageDrawer from "@/components/product-packages/ProductPackageDrawer";

type ProductPackagesPageViewProps = {
  filtersProps: ComponentProps<typeof ProductPackageFilters>;
  tableProps: Omit<ComponentProps<typeof ProductPackageTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof ProductPackageDrawer>;
};

export default function ProductPackagesPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
}: ProductPackagesPageViewProps) {
  return (
    <div className="space-y-4">
      <ProductPackageFilters {...filtersProps} />
      <ProductPackageTable
        {...tableProps}
        footer={paginationProps ? <TablePagination {...paginationProps} /> : null}
      />
      <ProductPackageDrawer {...drawerProps} />
    </div>
  );
}
