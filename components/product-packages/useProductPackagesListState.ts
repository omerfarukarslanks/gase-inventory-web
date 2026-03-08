"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getProductPackages,
  updateProductPackage,
  type ProductPackage,
  type ProductPackagesListMeta,
} from "@/lib/product-packages";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";

export function useProductPackagesListState(canReadPage: boolean) {
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [meta, setMeta] = useState<ProductPackagesListMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandedPackageIds, setExpandedPackageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });

  const fetchPackages = useCallback(async () => {
    if (!canReadPage) return;

    setLoading(true);
    setError("");
    try {
      const response = await getProductPackages({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        isActive: statusFilter,
      });
      setPackages(response.data);
      setMeta(response.meta);
    } catch {
      setError("Paketler yuklenemedi. Lutfen tekrar deneyin.");
      setPackages([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [canReadPage, debouncedSearch, pagination.page, pagination.pageSize, statusFilter]);

  useEffect(() => {
    if (debouncedSearch !== "") pagination.resetPage();
  }, [debouncedSearch, pagination.resetPage]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.resetPage, statusFilter]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchPackages();
  }, [canReadPage, fetchPackages]);

  const totalPages = pagination.totalPages;

  const clearAdvancedFilters = useCallback(() => {
    setStatusFilter("all");
  }, []);

  const onToggleExpand = useCallback((packageId: string) => {
    setExpandedPackageIds((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId],
    );
  }, []);

  const onToggleActive = useCallback(async (pkg: ProductPackage, next: boolean) => {
    setTogglingIds((prev) => [...prev, pkg.id]);
    try {
      await updateProductPackage(pkg.id, {
        name: pkg.name,
        code: pkg.code,
        isActive: next,
        items: (pkg.items ?? []).map((item) => ({
          productVariantId: item.productVariant.id,
          quantity: item.quantity,
        })),
      });
      await fetchPackages();
    } catch {
      setError("Paket durumu guncellenemedi. Lutfen tekrar deneyin.");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== pkg.id));
    }
  }, [fetchPackages]);

  return {
    packages,
    meta,
    currentPage: pagination.page,
    pageSize: pagination.pageSize,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
    expandedPackageIds,
    loading,
    error,
    togglingIds,
    totalPages,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    fetchPackages,
    onChangePageSize: pagination.onPageSizeChange,
    goToPage: pagination.onPageChange,
    clearAdvancedFilters,
    onToggleExpand,
    onToggleActive,
  };
}
