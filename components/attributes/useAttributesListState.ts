"use client";

import { useCallback, useState } from "react";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";
import {
  getAttributesPaginated,
  updateAttribute,
  updateAttributeValue,
  type Attribute,
  type AttributesPaginatedMeta,
  type AttributeValue,
} from "@/lib/attributes";

type UseAttributesListStateOptions = {
  canReadPage: boolean;
  loadErrorMessage: string;
  onSuccess: (message: string) => void;
};

export function useAttributesListState({
  canReadPage,
  loadErrorMessage,
  onSuccess,
}: UseAttributesListStateOptions) {
  const [expandedAttributeIds, setExpandedAttributeIds] = useState<string[]>([]);
  const [togglingAttributeIds, setTogglingAttributeIds] = useState<string[]>([]);
  const [togglingValueIds, setTogglingValueIds] = useState<string[]>([]);

  const listState = useStatusPaginatedList<Attribute, AttributesPaginatedMeta, boolean | "all">({
    canReadPage,
    loadErrorMessage,
    initialStatusFilter: "all",
    debounceMs: 300,
    onSuccess: useCallback(() => {
      setExpandedAttributeIds([]);
    }, []),
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const res = await getAttributesPaginated({
        page,
        limit: pageSize,
        search,
        sortOrder: "DESC",
        sortBy: "createdAt",
        isActive: statusFilter,
      });
      return {
        items: res.data,
        meta: res.meta,
      };
    }, []),
  });
  const {
    items: attributes,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    pagination,
    setItems: setAttributes,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    setError,
    refresh,
    clearAdvancedFilters,
  } = listState;

  const toggleExpand = useCallback((id: string) => {
    setExpandedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }, []);

  const toggleAttributeStatus = useCallback(async (attribute: Attribute, next: boolean) => {
    setTogglingAttributeIds((prev) => [...prev, attribute.id]);
    setAttributes((prev) =>
      prev.map((item) => (item.id === attribute.id ? { ...item, isActive: next } : item)),
    );
    try {
      await updateAttribute(attribute.id, { isActive: next });
      onSuccess("Ozellik durumu guncellendi.");
      await refresh();
    } catch {
      setError("Ozellik durumu guncellenemedi.");
      setAttributes((prev) =>
        prev.map((item) =>
          item.id === attribute.id ? { ...item, isActive: attribute.isActive } : item,
        ),
      );
    } finally {
      setTogglingAttributeIds((prev) => prev.filter((id) => id !== attribute.id));
    }
  }, [onSuccess, refresh, setAttributes, setError]);

  const toggleAttributeValueStatus = useCallback(async (value: AttributeValue, next: boolean) => {
    setTogglingValueIds((prev) => [...prev, value.id]);
    try {
      await updateAttributeValue(value.id, { isActive: next });
      onSuccess("Deger durumu guncellendi.");
      await refresh();
    } catch {
      setError("Deger durumu guncellenemedi.");
    } finally {
      setTogglingValueIds((prev) => prev.filter((id) => id !== value.id));
    }
  }, [onSuccess, refresh, setError]);

  return {
    attributes,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    expandedAttributeIds,
    togglingAttributeIds,
    togglingValueIds,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    setError,
    refresh,
    clearAdvancedFilters,
    toggleExpand,
    toggleAttributeStatus,
    toggleAttributeValueStatus,
  };
}
