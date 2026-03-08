"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import CustomersFilters from "@/components/customers/CustomersFilters";
import CustomersTable from "@/components/customers/CustomersTable";
import CustomerDrawer from "@/components/customers/CustomerDrawer";
import CustomerBalanceDrawer from "@/components/customers/CustomerBalanceDrawer";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

type CustomersPageViewProps = {
  filtersProps: ComponentProps<typeof CustomersFilters>;
  tableProps: Omit<ComponentProps<typeof CustomersTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof CustomerDrawer>;
  balanceDrawerProps: ComponentProps<typeof CustomerBalanceDrawer>;
};

export default function CustomersPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
  balanceDrawerProps,
}: CustomersPageViewProps) {
  return (
    <div className="space-y-4">
      <CustomersFilters {...filtersProps} />
      <CustomersTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />
      <CustomerDrawer {...drawerProps} />
      <CustomerBalanceDrawer {...balanceDrawerProps} />
    </div>
  );
}
