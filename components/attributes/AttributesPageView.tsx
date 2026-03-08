"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import AttributesFilters from "@/components/attributes/AttributesFilters";
import AttributesTable from "@/components/attributes/AttributesTable";
import AttributeDrawer from "@/components/attributes/AttributeDrawer";
import StatusBanner from "@/components/ui/StatusBanner";
import TableFooterPagination from "@/components/ui/TableFooterPagination";

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
        <StatusBanner tone="success" className="animate-fi">
          {success}
        </StatusBanner>
      )}
      {error && (
        <StatusBanner tone="error" className="animate-fi">
          {error}
        </StatusBanner>
      )}

      <AttributesTable
        {...tableProps}
        footer={<TableFooterPagination paginationProps={paginationProps} />}
      />

      <AttributeDrawer {...drawerProps} />
    </div>
  );
}
