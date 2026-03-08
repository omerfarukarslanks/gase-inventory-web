"use client";

import { useCallback, useState } from "react";
import { trimToUndefined } from "@/lib/payload";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";
import { useTableSortState } from "@/hooks/useTableSortState";
import { getUsers, updateUser, type Meta, type User } from "@/lib/users";
import { buildToggleUserPayload } from "@/components/users/payload";

type UseUsersListStateOptions = {
  canReadPage: boolean;
};

export function useUsersListState({ canReadPage }: UseUsersListStateOptions) {
  const [storeFilter, setStoreFilter] = useState("");
  const [togglingUserIds, setTogglingUserIds] = useState<string[]>([]);

  const {
    sortBy,
    sortOrder,
    handleSort,
  } = useTableSortState();

  const listState = useStatusPaginatedList<User, Meta, boolean | "all">({
    canReadPage,
    loadErrorMessage: "",
    initialStatusFilter: "all",
    resetPageDeps: [storeFilter, sortBy, sortOrder],
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const res = await getUsers({
        page,
        limit: pageSize,
        search,
        storeId: trimToUndefined(storeFilter),
        isActive: statusFilter,
        sortBy,
        sortOrder,
      });
      return {
        items: res.data,
        meta: res.meta,
      };
    }, [sortBy, sortOrder, storeFilter]),
  });
  const {
    items: users,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    refresh,
    clearAdvancedFilters: clearStatusFilters,
  } = listState;

  const onToggleUserActive = useCallback(async (user: User, next: boolean) => {
    setTogglingUserIds((prev) => [...prev, user.id]);
    try {
      await updateUser(user.id, buildToggleUserPayload(user, next));
      await refresh();
    } catch {
      alert("Kullanıcı durumu güncellenemedi.");
    } finally {
      setTogglingUserIds((prev) => prev.filter((id) => id !== user.id));
    }
  }, [refresh]);

  const clearAdvancedFilters = useCallback(() => {
    setStoreFilter("");
    clearStatusFilters();
  }, [clearStatusFilters]);

  return {
    users,
    meta,
    loading,
    searchTerm,
    storeFilter,
    statusFilter,
    showAdvancedFilters,
    sortBy,
    sortOrder,
    togglingUserIds,
    pagination,
    setSearchTerm,
    setStoreFilter,
    setStatusFilter,
    setShowAdvancedFilters,
    clearAdvancedFilters,
    handleSort,
    onToggleUserActive,
    refresh,
  };
}
