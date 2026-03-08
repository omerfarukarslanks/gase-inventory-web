"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { trimToUndefined } from "@/lib/payload";

type QueryParams<TStatus> = {
  page: number;
  pageSize: number;
  search?: string;
  statusFilter: TStatus;
};

type QueryResult<TItem, TMeta> = {
  items: TItem[];
  meta: TMeta | null;
};

type UseStatusPaginatedListOptions<TItem, TMeta, TStatus> = {
  canReadPage: boolean;
  loadErrorMessage: string;
  queryFn: (params: QueryParams<TStatus>) => Promise<QueryResult<TItem, TMeta>>;
  initialStatusFilter: TStatus;
  debounceMs?: number;
  resetPageDeps?: readonly unknown[];
  queryEnabled?: boolean;
  disabledState?: "idle" | "loading";
  disabledErrorMessage?: string;
  clearOnDisabled?: boolean;
  onSuccess?: (result: QueryResult<TItem, TMeta>) => void;
};

export function useStatusPaginatedList<TItem, TMeta, TStatus>({
  canReadPage,
  loadErrorMessage,
  queryFn,
  initialStatusFilter,
  debounceMs = 500,
  resetPageDeps = [],
  queryEnabled = true,
  disabledState = "idle",
  disabledErrorMessage,
  clearOnDisabled = false,
  onSuccess,
}: UseStatusPaginatedListOptions<TItem, TMeta, TStatus>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [meta, setMeta] = useState<TMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TStatus>(initialStatusFilter);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounceStr(searchTerm, debounceMs);
  const pagination = useTablePaginationState({
    totalPages: (meta as { totalPages?: number } | null)?.totalPages ?? 1,
    loading,
  });

  const refresh = useCallback(async () => {
    if (!canReadPage) return;
    if (!queryEnabled) return;

    setLoading(true);
    setError("");

    try {
      const result = await queryFn({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: trimToUndefined(debouncedSearch),
        statusFilter,
      });
      setItems(result.items);
      setMeta(result.meta);
      onSuccess?.(result);
    } catch {
      setError(loadErrorMessage);
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [
    canReadPage,
    debouncedSearch,
    loadErrorMessage,
    onSuccess,
    pagination.page,
    pagination.pageSize,
    queryEnabled,
    queryFn,
    statusFilter,
  ]);

  useEffect(() => {
    if (!canReadPage) {
      setLoading(false);
      return;
    }

    if (queryEnabled) {
      return;
    }

    setLoading(disabledState === "loading");
    setError(disabledErrorMessage ?? "");

    if (clearOnDisabled) {
      setItems([]);
      setMeta(null);
    }
  }, [
    canReadPage,
    clearOnDisabled,
    disabledErrorMessage,
    disabledState,
    queryEnabled,
  ]);

  useEffect(() => {
    if (debouncedSearch !== "") {
      pagination.resetPage();
    }
  }, [debouncedSearch, pagination.resetPage]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.resetPage, statusFilter, ...resetPageDeps]);

  useEffect(() => {
    if (!canReadPage) return;
    void refresh();
  }, [canReadPage, queryEnabled, refresh]);

  const clearAdvancedFilters = useCallback(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  return {
    items,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    pagination,
    setItems,
    setMeta,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    setError,
    refresh,
    clearAdvancedFilters,
  };
}
