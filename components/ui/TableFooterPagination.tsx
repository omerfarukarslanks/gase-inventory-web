"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";

type TableFooterPaginationProps = {
  paginationProps?: ComponentProps<typeof TablePagination> | null;
};

export default function TableFooterPagination({
  paginationProps,
}: TableFooterPaginationProps) {
  if (!paginationProps) return null;
  return <TablePagination {...paginationProps} />;
}
