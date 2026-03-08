"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import ProductCategoryFilters from "@/components/product-categories/ProductCategoryFilters";
import ProductCategoryTable from "@/components/product-categories/ProductCategoryTable";
import ProductCategoryDrawer from "@/components/product-categories/ProductCategoryDrawer";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

type ProductCategoriesPageViewProps = {
  filtersProps: ComponentProps<typeof ProductCategoryFilters>;
  tableProps: Omit<ComponentProps<typeof ProductCategoryTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof ProductCategoryDrawer>;
};

export default function ProductCategoriesPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
}: ProductCategoriesPageViewProps) {
  return (
    <div className="space-y-4">
      <ProductCategoryFilters {...filtersProps} />
      <ProductCategoryTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />
      <ProductCategoryDrawer {...drawerProps} />
    </div>
  );
}
