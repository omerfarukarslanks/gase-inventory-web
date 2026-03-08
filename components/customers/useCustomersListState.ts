"use client";

import { useCallback, useState } from "react";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";
import {
  getCustomers,
  updateCustomer,
  type Customer,
  type CustomersListMeta,
} from "@/lib/customers";
import { buildToggleCustomerPayload } from "@/components/customers/payload";
import type { CustomersPageMessages } from "@/components/customers/types";

type UseCustomersListStateOptions = {
  canReadPage: boolean;
  messages: CustomersPageMessages;
};

export function useCustomersListState({
  canReadPage,
  messages,
}: UseCustomersListStateOptions) {
  const [togglingCustomerIds, setTogglingCustomerIds] = useState<string[]>([]);

  const listState = useStatusPaginatedList<Customer, CustomersListMeta, boolean | "all">({
    canReadPage,
    loadErrorMessage: messages.loadErrorMessage,
    initialStatusFilter: "all",
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const res = await getCustomers({
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
    items: customers,
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

  const onToggleCustomerActive = useCallback(async (customer: Customer, next: boolean) => {
    setTogglingCustomerIds((prev) => [...prev, customer.id]);
    try {
      await updateCustomer(customer.id, buildToggleCustomerPayload(customer, next));
      await refresh();
    } catch {
      setError(messages.loadErrorMessage);
    } finally {
      setTogglingCustomerIds((prev) => prev.filter((id) => id !== customer.id));
    }
  }, [messages.loadErrorMessage, refresh, setError]);

  return {
    customers,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    togglingCustomerIds,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    clearAdvancedFilters,
    onToggleCustomerActive,
    refresh,
  };
}
