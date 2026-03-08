"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import StoresFilters from "@/components/stores/StoresFilters";
import StoresTable from "@/components/stores/StoresTable";
import StoreDrawer from "@/components/stores/StoreDrawer";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

type StoresPageViewProps = {
  filtersProps: ComponentProps<typeof StoresFilters>;
  tableProps: Omit<ComponentProps<typeof StoresTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof StoreDrawer>;
};

export default function StoresPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
}: StoresPageViewProps) {
  return (
    <div className="space-y-4">
      <StoresFilters {...filtersProps} />
      <StoresTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />
      <StoreDrawer {...drawerProps} />
    </div>
  );
}
