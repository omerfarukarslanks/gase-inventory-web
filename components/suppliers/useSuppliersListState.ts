"use client";

import { useCallback, useState } from "react";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";
import {
  getSuppliers,
  updateSupplier,
  type Supplier,
  type SuppliersListMeta,
} from "@/lib/suppliers";
import { buildToggleSupplierPayload } from "@/components/suppliers/payload";
import type { SuppliersPageMessages } from "@/components/suppliers/types";

type UseSuppliersListStateOptions = {
  canReadPage: boolean;
  messages: SuppliersPageMessages;
};

export function useSuppliersListState({
  canReadPage,
  messages,
}: UseSuppliersListStateOptions) {
  const [togglingSupplierIds, setTogglingSupplierIds] = useState<string[]>([]);

  const listState = useStatusPaginatedList<Supplier, SuppliersListMeta, boolean | "all">({
    canReadPage,
    loadErrorMessage: messages.loadErrorMessage,
    initialStatusFilter: "all",
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const res = await getSuppliers({
        page,
        limit: pageSize,
        search,
        isActive: statusFilter,
      });
      return {
        items: res.data,
        meta: res.meta,
      };
    }, []),
  });
  const {
    items: suppliers,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    setError,
    refresh,
    clearAdvancedFilters,
  } = listState;

  const onToggleSupplierActive = useCallback(async (supplier: Supplier, next: boolean) => {
    setTogglingSupplierIds((prev) => [...prev, supplier.id]);

    try {
      await updateSupplier(supplier.id, buildToggleSupplierPayload(supplier, next));
      await refresh();
    } catch {
      setError(messages.loadErrorMessage);
    } finally {
      setTogglingSupplierIds((prev) => prev.filter((id) => id !== supplier.id));
    }
  }, [messages.loadErrorMessage, refresh, setError]);

  return {
    suppliers,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    togglingSupplierIds,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    clearAdvancedFilters,
    onToggleSupplierActive,
    refresh,
  };
}
