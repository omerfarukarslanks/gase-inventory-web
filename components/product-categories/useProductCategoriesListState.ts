"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStatusPaginatedList } from "@/hooks/useStatusPaginatedList";
import {
  getAllProductCategories,
  getProductCategoriesPaginated,
  updateProductCategory,
  type ProductCategory,
  type ProductCategoriesListMeta,
} from "@/lib/product-categories";
import { buildToggleProductCategoryPayload } from "@/components/product-categories/payload";
import type { ProductCategoriesPageMessages } from "@/components/product-categories/types";

type UseProductCategoriesListStateOptions = {
  canReadPage: boolean;
  messages: ProductCategoriesPageMessages;
};

export function useProductCategoriesListState({
  canReadPage,
  messages,
}: UseProductCategoriesListStateOptions) {
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([]);
  const [togglingCategoryIds, setTogglingCategoryIds] = useState<string[]>([]);

  const listState = useStatusPaginatedList<ProductCategory, ProductCategoriesListMeta, boolean | "all">({
    canReadPage,
    loadErrorMessage: messages.loadErrorMessage,
    initialStatusFilter: "all",
    queryFn: useCallback(async ({ page, pageSize, search, statusFilter }) => {
      const res = await getProductCategoriesPaginated({
        page,
        limit: pageSize,
        search,
        isActive: statusFilter,
      });
      return {
        items: res.data ?? [],
        meta: res.meta ?? null,
      };
    }, []),
  });
  const {
    items: categories,
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

  const fetchAllCategories = useCallback(async () => {
    if (!canReadPage) return;
    try {
      const res = await getAllProductCategories({ isActive: "all" });
      setAllCategories(res);
    } catch {
      setAllCategories([]);
    }
  }, [canReadPage]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchAllCategories();
  }, [canReadPage, fetchAllCategories]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), fetchAllCategories()]);
  }, [fetchAllCategories, refresh]);

  const onToggleCategoryActive = useCallback(async (category: ProductCategory, next: boolean) => {
    setTogglingCategoryIds((prev) => [...prev, category.id]);
    try {
      await updateProductCategory(category.id, buildToggleProductCategoryPayload(category, next));
      await refreshAll();
    } catch {
      setError(messages.loadErrorMessage);
    } finally {
      setTogglingCategoryIds((prev) => prev.filter((id) => id !== category.id));
    }
  }, [messages.loadErrorMessage, refreshAll, setError]);

  const parentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    allCategories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [allCategories]);

  return {
    categories,
    allCategories,
    parentNameMap,
    meta,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    loading,
    error,
    togglingCategoryIds,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    clearAdvancedFilters,
    onToggleCategoryActive,
    refresh,
    refreshAll,
  };
}
