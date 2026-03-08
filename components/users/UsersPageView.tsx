"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import UsersFilters from "@/components/users/UsersFilters";
import UsersTable from "@/components/users/UsersTable";
import UserDrawer from "@/components/users/UserDrawer";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

type UsersPageViewProps = {
  filtersProps: ComponentProps<typeof UsersFilters>;
  tableProps: Omit<ComponentProps<typeof UsersTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof UserDrawer>;
};

export default function UsersPageView({
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
}: UsersPageViewProps) {
  return (
    <div className="space-y-6">
      <UsersFilters {...filtersProps} />
      <UsersTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />
      <UserDrawer {...drawerProps} />
    </div>
  );
}
