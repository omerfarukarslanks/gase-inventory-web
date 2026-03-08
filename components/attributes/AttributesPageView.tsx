"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import AttributesFilters from "@/components/attributes/AttributesFilters";
import AttributesTable from "@/components/attributes/AttributesTable";
import AttributeDrawer from "@/components/attributes/AttributeDrawer";

type AttributesPageViewProps = {
  success: string;
  error: string;
  filtersProps: ComponentProps<typeof AttributesFilters>;
  tableProps: Omit<ComponentProps<typeof AttributesTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  drawerProps: ComponentProps<typeof AttributeDrawer>;
};

export default function AttributesPageView({
  success,
  error,
  filtersProps,
  tableProps,
  paginationProps,
  drawerProps,
}: AttributesPageViewProps) {
  return (
    <div className="space-y-4">
      <AttributesFilters {...filtersProps} />

      {success && (
        <div className="animate-fi rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {success}
        </div>
      )}
      {error && (
        <div className="animate-fi rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <AttributesTable
        {...tableProps}
        footer={paginationProps ? <TablePagination {...paginationProps} /> : null}
      />

      <AttributeDrawer {...drawerProps} />
    </div>
  );
}
