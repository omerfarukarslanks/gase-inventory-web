"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import SuppliersFilters from "@/components/suppliers/SuppliersFilters";
import SuppliersTable from "@/components/suppliers/SuppliersTable";
import SupplierDrawer from "@/components/suppliers/SupplierDrawer";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

type SuppliersPageViewProps = {
  filtersProps: ComponentProps<typeof SuppliersFilters>;
  tableProps: Omit<ComponentProps<typeof SuppliersTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof SupplierDrawer>;
};

export default function SuppliersPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
}: SuppliersPageViewProps) {
  return (
    <div className="space-y-4">
      <SuppliersFilters {...filtersProps} />
      <SuppliersTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />
      <SupplierDrawer {...drawerProps} />
    </div>
  );
}
