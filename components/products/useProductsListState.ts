"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getProducts,
  getProductVariants,
  updateProduct,
  updateProductVariant,
  type Currency,
  type Product,
  type ProductVariant,
  type ProductsListMeta,
} from "@/lib/products";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { normalizeVariantsResponse, type IsActiveFilter } from "@/components/products/types";
import type { PriceTarget } from "@/components/stock/PriceDrawer";

type UseProductsListStateOptions = {
  canReadPage: boolean;
  scopeReady: boolean;
  loadErrorMessage: string;
};

export function useProductsListState({
  canReadPage,
  scopeReady,
  loadErrorMessage,
}: UseProductsListStateOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductsListMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<Currency | "">("");
  const [defaultPurchasePriceMinFilter, setDefaultPurchasePriceMinFilter] = useState("");
  const [defaultPurchasePriceMaxFilter, setDefaultPurchasePriceMaxFilter] = useState("");
  const [defaultSalePriceMinFilter, setDefaultSalePriceMinFilter] = useState("");
  const [defaultSalePriceMaxFilter, setDefaultSalePriceMaxFilter] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<IsActiveFilter>("all");
  const [variantStatusFilter, setVariantStatusFilter] = useState<IsActiveFilter>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  const [productVariantsById, setProductVariantsById] = useState<Record<string, ProductVariant[]>>({});
  const [productVariantsLoadingById, setProductVariantsLoadingById] = useState<Record<string, boolean>>({});
  const [productVariantsErrorById, setProductVariantsErrorById] = useState<Record<string, string>>({});
  const [togglingProductIds, setTogglingProductIds] = useState<string[]>([]);
  const [togglingVariantIds, setTogglingVariantIds] = useState<string[]>([]);
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceTarget, setPriceTarget] = useState<PriceTarget | null>(null);
  const [priceProductId, setPriceProductId] = useState<string | null>(null);

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });

  const fetchProducts = useCallback(async () => {
    if (!canReadPage || !scopeReady) return;

    setLoading(true);
    setError("");

    try {
      const response = await getProducts({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        defaultCurrency: currencyFilter || undefined,
        defaultPurchasePriceMin: defaultPurchasePriceMinFilter ? Number(defaultPurchasePriceMinFilter) : undefined,
        defaultPurchasePriceMax: defaultPurchasePriceMaxFilter ? Number(defaultPurchasePriceMaxFilter) : undefined,
        defaultSalePriceMin: defaultSalePriceMinFilter ? Number(defaultSalePriceMinFilter) : undefined,
        defaultSalePriceMax: defaultSalePriceMaxFilter ? Number(defaultSalePriceMaxFilter) : undefined,
        isActive: productStatusFilter,
        variantIsActive: variantStatusFilter,
      });
      setProducts(response.data);
      setMeta(response.meta);
    } catch {
      setError(loadErrorMessage);
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [
    canReadPage,
    scopeReady,
    pagination.page,
    pagination.pageSize,
    debouncedSearch,
    currencyFilter,
    defaultPurchasePriceMinFilter,
    defaultPurchasePriceMaxFilter,
    defaultSalePriceMinFilter,
    defaultSalePriceMaxFilter,
    productStatusFilter,
    variantStatusFilter,
    loadErrorMessage,
  ]);

  useEffect(() => {
    if (debouncedSearch !== "") pagination.resetPage();
  }, [debouncedSearch, pagination.resetPage]);

  useEffect(() => {
    pagination.resetPage();
  }, [
    currencyFilter,
    defaultPurchasePriceMinFilter,
    defaultPurchasePriceMaxFilter,
    defaultSalePriceMinFilter,
    defaultSalePriceMaxFilter,
    productStatusFilter,
    variantStatusFilter,
    pagination.resetPage,
  ]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchProducts();
  }, [canReadPage, fetchProducts]);

  const totalPages = useMemo(() => pagination.totalPages, [pagination.totalPages]);

  const clearAdvancedFilters = useCallback(() => {
    setDefaultPurchasePriceMinFilter("");
    setDefaultPurchasePriceMaxFilter("");
    setDefaultSalePriceMinFilter("");
    setDefaultSalePriceMaxFilter("");
  }, []);

  const onToggleProductActive = useCallback(
    async (product: Product, next: boolean) => {
      setTogglingProductIds((prev) => [...prev, product.id]);
      try {
        await updateProduct(product.id, {
          currency: product.currency,
          unitPrice: Number(product.unitPrice) || 0,
          purchasePrice: Number(product.purchasePrice) || 0,
          ...(product.taxPercent != null
            ? { taxPercent: Number(product.taxPercent) || 0 }
            : product.taxAmount != null
              ? { taxAmount: Number(product.taxAmount) || 0 }
              : {}),
          ...(product.discountPercent != null
            ? { discountPercent: Number(product.discountPercent) || 0 }
            : product.discountAmount != null
              ? { discountAmount: Number(product.discountAmount) || 0 }
              : {}),
          name: product.name,
          sku: product.sku,
          description: product.description ?? undefined,
          image: product.image ?? undefined,
          categoryId: product.categoryId ?? product.category?.id ?? undefined,
          supplierId: product.supplierId ?? product.supplier?.id ?? undefined,
          isActive: next,
        });
        await fetchProducts();
      } catch {
        setError("Urun durumu guncellenemedi. Lutfen tekrar deneyin.");
      } finally {
        setTogglingProductIds((prev) => prev.filter((id) => id !== product.id));
      }
    },
    [fetchProducts],
  );

  const fetchTableVariants = useCallback(
    async (productId: string, status: IsActiveFilter = variantStatusFilter) => {
      if (productVariantsLoadingById[productId]) return;

      setProductVariantsLoadingById((prev) => ({ ...prev, [productId]: true }));
      setProductVariantsErrorById((prev) => ({ ...prev, [productId]: "" }));

      try {
        const payload = await getProductVariants(productId, { isActive: status });
        const data = normalizeVariantsResponse(payload);
        setProductVariantsById((prev) => ({ ...prev, [productId]: data }));
      } catch {
        setProductVariantsErrorById((prev) => ({
          ...prev,
          [productId]: "Varyantlar yüklenemedi. Lütfen tekrar deneyin.",
        }));
      } finally {
        setProductVariantsLoadingById((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [productVariantsLoadingById, variantStatusFilter],
  );

  const toggleExpandedProduct = useCallback(
    (productId: string) => {
      const isExpanded = expandedProductIds.includes(productId);
      if (isExpanded) {
        setExpandedProductIds((prev) => prev.filter((id) => id !== productId));
        return;
      }

      setExpandedProductIds((prev) => [...prev, productId]);
      if (!productVariantsById[productId]) {
        void fetchTableVariants(productId, variantStatusFilter);
      }
    },
    [expandedProductIds, fetchTableVariants, productVariantsById, variantStatusFilter],
  );

  const onToggleVariantActive = useCallback(
    async (productId: string, variant: ProductVariant, next: boolean) => {
      setTogglingVariantIds((prev) => [...prev, variant.id]);
      try {
        await updateProductVariant(productId, variant.id, {
          attributes: variant.attributes ?? [],
          isActive: next,
        });
        await fetchTableVariants(productId, variantStatusFilter);
      } catch {
        setProductVariantsErrorById((prev) => ({
          ...prev,
          [productId]: "Varyant durumu guncellenemedi. Lutfen tekrar deneyin.",
        }));
      } finally {
        setTogglingVariantIds((prev) => prev.filter((id) => id !== variant.id));
      }
    },
    [fetchTableVariants, variantStatusFilter],
  );

  useEffect(() => {
    if (expandedProductIds.length === 0) return;
    expandedProductIds.forEach((productId) => {
      void fetchTableVariants(productId, variantStatusFilter);
    });
  }, [expandedProductIds, fetchTableVariants, variantStatusFilter]);

  const openProductPriceDrawer = useCallback((product: Product) => {
    setPriceTarget({
      mode: "product",
      productId: product.id,
      productName: product.name,
      stores: [],
      initial: {
        unitPrice: product.unitPrice ?? null,
        currency: product.currency ?? "TRY",
        discountPercent: product.discountPercent ?? null,
        discountAmount: product.discountAmount ?? null,
        taxPercent: product.taxPercent ?? null,
        taxAmount: product.taxAmount ?? null,
        lineTotal: product.lineTotal ?? null,
      },
    });
    setPriceProductId(product.id);
    setPriceOpen(true);
  }, []);

  const closePriceDrawer = useCallback(() => {
    setPriceOpen(false);
    setPriceTarget(null);
    setPriceProductId(null);
  }, []);

  return {
    products,
    meta,
    currentPage: pagination.page,
    pageSize: pagination.pageSize,
    searchTerm,
    currencyFilter,
    defaultPurchasePriceMinFilter,
    defaultPurchasePriceMaxFilter,
    defaultSalePriceMinFilter,
    defaultSalePriceMaxFilter,
    productStatusFilter,
    variantStatusFilter,
    showAdvancedFilters,
    loading,
    error,
    expandedProductIds,
    productVariantsById,
    productVariantsLoadingById,
    productVariantsErrorById,
    togglingProductIds,
    togglingVariantIds,
    priceOpen,
    priceTarget,
    priceProductId,
    totalPages,
    setSearchTerm,
    setCurrencyFilter,
    setDefaultPurchasePriceMinFilter,
    setDefaultPurchasePriceMaxFilter,
    setDefaultSalePriceMinFilter,
    setDefaultSalePriceMaxFilter,
    setProductStatusFilter,
    setVariantStatusFilter,
    setShowAdvancedFilters,
    fetchProducts,
    onChangePageSize: pagination.onPageSizeChange,
    onPageChange: pagination.onPageChange,
    clearAdvancedFilters,
    onToggleProductActive,
    fetchTableVariants,
    toggleExpandedProduct,
    onToggleVariantActive,
    openProductPriceDrawer,
    closePriceDrawer,
  };
}
