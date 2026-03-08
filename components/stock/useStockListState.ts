"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTenantStockSummary,
  getVariantStockByStore,
  type InventoryProductStockItem,
  type InventoryStoreStockItem,
  type InventoryVariantStockItem,
} from "@/lib/inventory";
import { getAllSuppliers, type Supplier } from "@/lib/suppliers";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { getPaginationValue, normalizeProducts, normalizeStoreItems } from "@/lib/normalize";

type UseStockListStateOptions = {
  canReadPage: boolean;
  scopeReady: boolean;
  scopedStoreId: string;
  loadErrorMessage: string;
};

export function useStockListState({
  canReadPage,
  scopeReady,
  scopedStoreId,
  loadErrorMessage,
}: UseStockListStateOptions) {
  const [products, setProducts] = useState<InventoryProductStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilterIds, setStoreFilterIds] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variantStoresById, setVariantStoresById] = useState<Record<string, InventoryStoreStockItem[]>>({});
  const [variantStoresLoadingById, setVariantStoresLoadingById] = useState<Record<string, boolean>>({});

  const debouncedSearch = useDebounceStr(searchTerm, 400);
  const isStoreScopedUser = false;
  const pagination = useTablePaginationState({
    totalPages,
    loading,
  });

  const applyStoreScope = useCallback(
    (items: InventoryStoreStockItem[]) => {
      if (!isStoreScopedUser) return items;
      return items.filter((item) => item.storeId === scopedStoreId);
    },
    [isStoreScopedUser, scopedStoreId],
  );

  useEffect(() => {
    if (!canReadPage) {
      setSuppliers([]);
      return;
    }

    getAllSuppliers({ isActive: true })
      .then(setSuppliers)
      .catch(() => setSuppliers([]));
  }, [canReadPage]);

  const fetchTenantSummary = useCallback(async () => {
    if (!canReadPage || !scopeReady) return;

    setLoading(true);
    setError("");

    try {
      const effectiveStoreIds = !isStoreScopedUser && storeFilterIds.length > 0 ? storeFilterIds : undefined;
      const response = await getTenantStockSummary({
        page: pagination.page,
        limit: pagination.pageSize,
        storeIds: effectiveStoreIds,
        search: debouncedSearch || undefined,
      });
      setProducts(normalizeProducts(response));
      setTotal(getPaginationValue(response, "total"));

      const nextTotalPages = getPaginationValue(response, "totalPages");
      if (nextTotalPages > 0) {
        setTotalPages(nextTotalPages);
      } else {
        const nextTotal = getPaginationValue(response, "total");
        setTotalPages(nextTotal > 0 ? Math.max(1, Math.ceil(nextTotal / pagination.pageSize)) : 1);
      }
    } catch {
      setProducts([]);
      setTotal(0);
      setError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    canReadPage,
    debouncedSearch,
    isStoreScopedUser,
    loadErrorMessage,
    pagination.page,
    pagination.pageSize,
    scopeReady,
    storeFilterIds,
  ]);

  const fetchVariantStores = useCallback(
    async (variantId: string) => {
      if (!canReadPage || !variantId || variantStoresLoadingById[variantId]) return;

      setVariantStoresLoadingById((prev) => ({ ...prev, [variantId]: true }));
      try {
        const response = await getVariantStockByStore(variantId);
        const scopedItems = applyStoreScope(normalizeStoreItems(response));
        setVariantStoresById((prev) => ({ ...prev, [variantId]: scopedItems }));
      } catch {
        setVariantStoresById((prev) => ({ ...prev, [variantId]: [] }));
      } finally {
        setVariantStoresLoadingById((prev) => ({ ...prev, [variantId]: false }));
      }
    },
    [applyStoreScope, canReadPage, variantStoresLoadingById],
  );

  useEffect(() => {
    if (!canReadPage) return;
    void fetchTenantSummary();
  }, [canReadPage, fetchTenantSummary]);

  useEffect(() => {
    pagination.resetPage();
  }, [debouncedSearch, pagination.resetPage, storeFilterIds]);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      if (product.productName.toLowerCase().includes(query)) return true;
      return (product.variants ?? []).some((variant) => {
        if (variant.variantName.toLowerCase().includes(query)) return true;
        if ((variant.variantCode ?? "").toLowerCase().includes(query)) return true;
        return (variantStoresById[variant.productVariantId] ?? variant.stores ?? []).some((store) =>
          store.storeName.toLowerCase().includes(query),
        );
      });
    });
  }, [debouncedSearch, products, variantStoresById]);

  const getVariantStores = useCallback(
    (variant: InventoryVariantStockItem) => {
      const cached = variantStoresById[variant.productVariantId];
      if (cached && cached.length > 0) return cached;
      return variant.stores ?? [];
    },
    [variantStoresById],
  );

  const resolveVariantStores = useCallback(
    async (variantId: string, fallback: InventoryStoreStockItem[]): Promise<InventoryStoreStockItem[]> => {
      if (fallback.length > 0) return fallback;
      try {
        const response = await getVariantStockByStore(variantId);
        const normalized = applyStoreScope(normalizeStoreItems(response));
        setVariantStoresById((prev) => ({ ...prev, [variantId]: normalized }));
        return normalized;
      } catch {
        return [];
      }
    },
    [applyStoreScope],
  );

  return {
    products,
    filteredProducts,
    loading,
    error,
    page: pagination.page,
    setPage: pagination.setPage,
    limit: pagination.pageSize,
    setLimit: pagination.setPageSize,
    totalPages: pagination.totalPages,
    total,
    searchTerm,
    setSearchTerm,
    storeFilterIds,
    setStoreFilterIds,
    suppliers,
    isStoreScopedUser,
    fetchTenantSummary,
    resetPage: pagination.resetPage,
    onPageChange: pagination.onPageChange,
    onPageSizeChange: pagination.onPageSizeChange,
    fetchVariantStores,
    getVariantStores,
    resolveVariantStores,
  };
}
