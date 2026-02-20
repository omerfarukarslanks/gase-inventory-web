import { apiFetch } from "@/lib/api";

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];

type ReportScopeParams = {
  storeIds?: string[];
  startDate?: string;
  endDate?: string;
};

type PaginationParams = {
  page?: number;
  limit?: number;
};

function appendQueryParam(query: URLSearchParams, key: string, value: QueryPrimitive) {
  if (value == null) return;
  if (typeof value === "string" && !value.trim()) return;
  query.append(key, String(value));
}

function buildQuery(params: Record<string, QueryValue>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => appendQueryParam(query, key, item));
      return;
    }
    appendQueryParam(query, key, value);
  });
  return query.toString();
}

async function getReport(path: string, params: Record<string, QueryValue>): Promise<unknown> {
  const query = buildQuery(params);
  const endpoint = query ? `${path}?${query}` : path;
  return apiFetch<unknown>(endpoint);
}

export type ReportStockTotalQuantityParams = ReportScopeParams & {
  search?: string;
  compareDate?: string;
};

export async function getReportStockTotalQuantity(
  params: ReportStockTotalQuantityParams,
): Promise<unknown> {
  return getReport("/reports/stock/total-quantity", params);
}

export type ReportOrdersTotalsParams = ReportScopeParams & {
  receiptNo?: string;
  name?: string;
  surname?: string;
  minLinePrice?: number;
  maxLinePrice?: number;
  compareDate?: string;
};

export async function getReportOrdersConfirmedTotal(
  params: ReportOrdersTotalsParams,
): Promise<unknown> {
  return getReport("/reports/orders/confirmed/total", params);
}

export async function getReportOrdersReturnsTotal(
  params: ReportOrdersTotalsParams,
): Promise<unknown> {
  return getReport("/reports/orders/returns/total", params);
}

export type ReportSalesSummaryParams = ReportScopeParams;

export async function getReportSalesSummary(
  params: ReportSalesSummaryParams,
): Promise<unknown> {
  return getReport("/reports/sales/summary", params);
}

export type ReportSalesByProductParams = ReportScopeParams &
  PaginationParams & {
    search?: string;
  };

export async function getReportSalesByProduct(
  params: ReportSalesByProductParams,
): Promise<unknown> {
  return getReport("/reports/sales/by-product", params);
}

export type ReportStoresPerformanceParams = ReportScopeParams &
  PaginationParams & {
    search?: string;
  };

export async function getReportStoresPerformance(
  params: ReportStoresPerformanceParams,
): Promise<unknown> {
  return getReport("/reports/stores/performance", params);
}

export type ReportStockSummaryParams = PaginationParams & {
  storeIds?: string[];
  search?: string;
};

export async function getReportStockSummary(
  params: ReportStockSummaryParams,
): Promise<unknown> {
  return getReport("/reports/stock/summary", params);
}

export type ReportStockLowParams = PaginationParams & {
  storeIds?: string[];
  threshold?: number;
  search?: string;
};

export async function getReportStockLow(
  params: ReportStockLowParams,
): Promise<unknown> {
  return getReport("/reports/stock/low", params);
}

export type ReportInventoryMovementsSummaryParams = ReportScopeParams &
  PaginationParams & {
    search?: string;
    movementType?: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
    productVariantId?: string;
  };

export async function getReportInventoryMovementsSummary(
  params: ReportInventoryMovementsSummaryParams,
): Promise<unknown> {
  return getReport("/reports/inventory/movements/summary", params);
}

export type ReportSalesCancellationsParams = ReportScopeParams &
  PaginationParams & {
    search?: string;
    receiptNo?: string;
    name?: string;
    surname?: string;
  };

export async function getReportSalesCancellations(
  params: ReportSalesCancellationsParams,
): Promise<unknown> {
  return getReport("/reports/sales/cancellations", params);
}
