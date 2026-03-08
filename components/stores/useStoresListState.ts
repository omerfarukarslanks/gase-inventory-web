"use client";

import { useCallback, useState } from "react";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";
import {
  getStores,
  updateStore,
  type Store,
  type StoresListMeta,
} from "@/lib/stores";
import { buildToggleStorePayload } from "@/components/stores/payload";
import type { StoresPageMessages } from "@/components/stores/types";

type UseStoresListStateOptions = {
  canReadPage: boolean;
  token: string | null;
  isHydrated: boolean;
  messages: StoresPageMessages;
};

export function useStoresListState({
  canReadPage,
  token,
  isHydrated,
  messages,
}: UseStoresListStateOptions) {
  const [togglingStoreIds, setTogglingStoreIds] = useState<string[]>([]);

  const listState = useStatusPaginatedList<Store, StoresListMeta, boolean | "all">({
    canReadPage,
    loadErrorMessage: messages.loadError,
    initialStatusFilter: "all",
    queryEnabled: Boolean(token),
    disabledState: isHydrated ? "idle" : "loading",
    disabledErrorMessage: isHydrated ? messages.sessionNotFound : undefined,
    clearOnDisabled: true,
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const res = await getStores({
        page,
        limit: pageSize,
        search,
        isActive: statusFilter,
        token: token ?? "",
      });
      return {
        items: res.data,
        meta: res.meta,
      };
    }, [token]),
  });
  const {
    items: stores,
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

  const onToggleStoreActive = useCallback(async (store: Store, next: boolean) => {
    setTogglingStoreIds((prev) => [...prev, store.id]);

    try {
      if (!token) {
        setError(messages.sessionNotFound);
        return;
      }

      await updateStore(
        store.id,
        buildToggleStorePayload(store, next),
        token,
      );
      await refresh();
    } catch {
      setError(messages.toggleError);
    } finally {
      setTogglingStoreIds((prev) => prev.filter((id) => id !== store.id));
    }
  }, [messages.sessionNotFound, messages.toggleError, refresh, setError, token]);

  return {
    stores,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    togglingStoreIds,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    clearAdvancedFilters,
    onToggleStoreActive,
    refresh,
  };
}
