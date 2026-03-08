"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { getSales, type SaleListItem, type SalesListMeta } from "@/lib/sales";
import { normalizeSalesResponse } from "@/lib/sales-normalize";

type UseSalesListStateOptions = {
  canReadPage: boolean;
  scopeReady: boolean;
  canTenantOnly: boolean;
  loadErrorMessage: string;
};

export function useSalesListState({
  canReadPage,
  scopeReady,
  canTenantOnly,
  loadErrorMessage,
}: UseSalesListStateOptions) {
  const [salesReceipts, setSalesReceipts] = useState<SaleListItem[]>([]);
  const [salesMeta, setSalesMeta] = useState<SalesListMeta | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState("");
  const [salesStoreIds, setSalesStoreIds] = useState<string[]>([]);
  const [salesIncludeLines, setSalesIncludeLines] = useState(false);
  const [showSalesAdvancedFilters, setShowSalesAdvancedFilters] = useState(false);
  const [salesReceiptNoFilter, setSalesReceiptNoFilter] = useState("");
  const [salesNameFilter, setSalesNameFilter] = useState("");
  const [salesSurnameFilter, setSalesSurnameFilter] = useState("");
  const [salesStatusFilters, setSalesStatusFilters] = useState<string[]>([]);
  const [salesPaymentStatusFilter, setSalesPaymentStatusFilter] = useState("");
  const [salesMinUnitPriceFilter, setSalesMinUnitPriceFilter] = useState("");
  const [salesMaxUnitPriceFilter, setSalesMaxUnitPriceFilter] = useState("");
  const [salesMinLineTotalFilter, setSalesMinLineTotalFilter] = useState("");
  const [salesMaxLineTotalFilter, setSalesMaxLineTotalFilter] = useState("");
  const pagination = useTablePaginationState({
    totalPages: salesMeta?.totalPages ?? 1,
    loading: salesLoading,
  });

  const fetchSalesReceipts = useCallback(
    async (targetPage?: number) => {
      if (!canReadPage || !scopeReady) return;

      setSalesLoading(true);
      setSalesError("");

      try {
        const response = await getSales({
          page: targetPage ?? pagination.page,
          limit: pagination.pageSize,
          includeLines: salesIncludeLines,
          ...(canTenantOnly ? {} : { storeIds: salesStoreIds }),
          receiptNo: salesReceiptNoFilter || undefined,
          name: salesNameFilter || undefined,
          surname: salesSurnameFilter || undefined,
          status: salesStatusFilters.length > 0 ? salesStatusFilters : undefined,
          paymentStatus: salesPaymentStatusFilter || undefined,
          minUnitPrice: salesMinUnitPriceFilter ? Number(salesMinUnitPriceFilter) : undefined,
          maxUnitPrice: salesMaxUnitPriceFilter ? Number(salesMaxUnitPriceFilter) : undefined,
          minLineTotal: salesMinLineTotalFilter ? Number(salesMinLineTotalFilter) : undefined,
          maxLineTotal: salesMaxLineTotalFilter ? Number(salesMaxLineTotalFilter) : undefined,
        });
        const normalized = normalizeSalesResponse(response);
        setSalesReceipts(normalized.data);
        setSalesMeta(normalized.meta);
      } catch {
        setSalesReceipts([]);
        setSalesMeta(null);
        setSalesError(loadErrorMessage);
      } finally {
        setSalesLoading(false);
      }
    },
    [
      canReadPage,
      scopeReady,
      pagination.page,
      pagination.pageSize,
      salesIncludeLines,
      canTenantOnly,
      salesStoreIds,
      salesReceiptNoFilter,
      salesNameFilter,
      salesSurnameFilter,
      salesStatusFilters,
      salesPaymentStatusFilter,
      salesMinUnitPriceFilter,
      salesMaxUnitPriceFilter,
      salesMinLineTotalFilter,
      salesMaxLineTotalFilter,
      loadErrorMessage,
    ],
  );

  useEffect(() => {
    if (!canReadPage || !scopeReady) return;
    void fetchSalesReceipts();
  }, [canReadPage, fetchSalesReceipts, scopeReady]);

  const salesTotal = useMemo(() => salesMeta?.total ?? 0, [salesMeta]);

  return {
    salesReceipts,
    salesMeta,
    salesLoading,
    salesError,
    setSalesError,
    salesPage: pagination.page,
    setSalesPage: pagination.setPage,
    salesLimit: pagination.pageSize,
    setSalesLimit: pagination.setPageSize,
    salesStoreIds,
    setSalesStoreIds,
    salesIncludeLines,
    setSalesIncludeLines,
    showSalesAdvancedFilters,
    setShowSalesAdvancedFilters,
    salesReceiptNoFilter,
    setSalesReceiptNoFilter,
    salesNameFilter,
    setSalesNameFilter,
    salesSurnameFilter,
    setSalesSurnameFilter,
    salesStatusFilters,
    setSalesStatusFilters,
    salesPaymentStatusFilter,
    setSalesPaymentStatusFilter,
    salesMinUnitPriceFilter,
    setSalesMinUnitPriceFilter,
    salesMaxUnitPriceFilter,
    setSalesMaxUnitPriceFilter,
    salesMinLineTotalFilter,
    setSalesMinLineTotalFilter,
    salesMaxLineTotalFilter,
    setSalesMaxLineTotalFilter,
    fetchSalesReceipts,
    salesTotalPages: pagination.totalPages,
    salesTotal,
    resetSalesPage: pagination.resetPage,
    onSalesPageChange: pagination.onPageChange,
    onSalesLimitChange: pagination.onPageSizeChange,
  };
}
