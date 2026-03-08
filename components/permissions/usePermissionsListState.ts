"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import {
  getPermissions,
  updatePermission,
  type Permission,
  type PermissionListMeta,
} from "@/lib/permissions";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";

type UsePermissionsListStateOptions = {
  canReadPage: boolean;
  active: boolean;
};

export function usePermissionsListState({ canReadPage, active }: UsePermissionsListStateOptions) {
  const { t } = useLang();
  const [togglingPermIds, setTogglingPermIds] = useState<string[]>([]);

  const listState = useStatusPaginatedList<Permission, PermissionListMeta, boolean | "all">({
    canReadPage,
    loadErrorMessage: t("permissions.loadError"),
    initialStatusFilter: "all",
    queryEnabled: active,
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const response = await getPermissions({
        page,
        limit: pageSize,
        search,
        isActive: statusFilter,
      });

      return {
        items: response.data,
        meta: response.meta,
      };
    }, []),
  });
  const {
    items: permissions,
    meta: permMeta,
    searchTerm: permSearch,
    statusFilter: permStatusFilter,
    showAdvancedFilters: showPermFilters,
    loading: permLoading,
    error: permError,
    pagination,
    setSearchTerm: setPermSearch,
    setStatusFilter: setPermStatusFilter,
    setShowAdvancedFilters: setShowPermFilters,
    setError: setPermError,
    refresh: fetchPermissions,
  } = listState;

  const onTogglePermActive = useCallback(async (perm: Permission, next: boolean) => {
    setTogglingPermIds((prev) => [...prev, perm.id]);
    try {
      await updatePermission(perm.id, { isActive: next });
      await fetchPermissions();
    } catch {
      setPermError(t("permissions.toggleError"));
    } finally {
      setTogglingPermIds((prev) => prev.filter((id) => id !== perm.id));
    }
  }, [fetchPermissions, t]);

  return {
    permissions,
    permMeta,
    permPage: pagination.page,
    permPageSize: pagination.pageSize,
    permSearch,
    permStatusFilter,
    showPermFilters,
    permLoading,
    permError,
    togglingPermIds,
    permTotalPages: pagination.totalPages,
    setPermPage: pagination.setPage,
    setPermSearch,
    setPermStatusFilter,
    setShowPermFilters,
    onPermPageSizeChange: pagination.onPageSizeChange,
    onTogglePermActive,
    fetchPermissions,
  };
}
