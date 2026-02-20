import { asObject, pickNumberOrNull, pickString } from "@/lib/normalize";

type NumberLike = number | null;

export type DashboardStockTotalQuantity = {
  todayTotalQuantity: number;
  daily: Array<{ date: string; totalQuantity: number }>;
  comparisonPercent: NumberLike;
};

export type DashboardOrdersTotal = {
  orderCount: number;
  totalUnitPrice: number;
  totalLinePrice: number;
  daily: Array<{ date: string; orderCount: number; totalLinePrice: number }>;
  comparisonPercent: NumberLike;
};

export type DashboardSalesSummary = {
  saleCount: number;
  confirmedCount: number;
  cancelledCount: number;
  totalUnitPrice: number;
  totalLineTotal: number;
  averageBasket: number;
  cancelRate: number;
};

export type DashboardProductPerformanceItem = {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  totalLinePrice: number;
  totalTax: number;
  totalDiscount: number;
  currency: string;
};

export type DashboardStorePerformanceItem = {
  id: string;
  storeName: string;
  saleCount: number;
  confirmedCount: number;
  cancelledCount: number;
  totalLinePrice: number;
  cancelRate: number;
};

export type DashboardStockLowItem = {
  id: string;
  productName: string;
  variantName: string;
  storeName: string;
  quantity: number;
  threshold: number;
};

export type DashboardMovementTypeSummary = {
  movementType: string;
  movementCount: number;
  totalQuantity: number;
};

export type DashboardMovementItem = {
  id: string;
  movementType: string;
  quantity: number;
  storeName: string;
  variantName: string;
  createdAt?: string;
};

export type DashboardCancellationItem = {
  id: string;
  receiptNo: string;
  name: string;
  surname: string;
  storeName: string;
  status: string;
  lineTotal: number;
  createdAt?: string;
  cancelledAt?: string;
};

export type DashboardStockSummaryMetrics = {
  totalQuantity: number;
  productCount: number;
  variantCount: number;
  storeCount: number;
};

function toArray(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  return [];
}

function getDataArray(payload: unknown): unknown[] {
  const root = asObject(payload);
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.items)) return root.items;
  const dataNode = asObject(root?.data);
  if (Array.isArray(dataNode?.items)) return dataNode.items;
  if (Array.isArray(dataNode?.data)) return dataNode.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getComparisonPercent(root: Record<string, unknown> | null): NumberLike {
  const comparison = asObject(root?.comparison);
  return (
    pickNumberOrNull(
      comparison?.percent,
      comparison?.percentage,
      comparison?.percentageChange,
      comparison?.changePercent,
      comparison?.deltaPercent,
      comparison?.rate,
    ) ?? null
  );
}

function parseDaily(
  input: unknown,
  keyMap: { amount: string; count?: string },
): Array<{ date: string; amount: number; count: number }> {
  return toArray(input)
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      date: pickString(item.date, item.day, item.label, "-"),
      amount: pickNumberOrNull(
        item[keyMap.amount],
        item.value,
        item.total,
      ) ?? 0,
      count: pickNumberOrNull(
        keyMap.count ? item[keyMap.count] : undefined,
        item.orderCount,
        item.count,
        item.totalCount,
      ) ?? 0,
    }));
}

export function normalizeReportStockTotalQuantity(
  payload: unknown,
): DashboardStockTotalQuantity {
  const root = asObject(payload);
  const totals = asObject(root?.totals);
  const daily = parseDaily(root?.daily, { amount: "totalQuantity" }).map((item) => ({
    date: item.date,
    totalQuantity: item.amount,
  }));

  return {
    todayTotalQuantity:
      pickNumberOrNull(
        totals?.todayTotalQuantity,
        totals?.totalQuantity,
        totals?.quantity,
        root?.totalQuantity,
      ) ?? 0,
    daily,
    comparisonPercent: getComparisonPercent(root),
  };
}

export function normalizeReportOrdersTotal(payload: unknown): DashboardOrdersTotal {
  const root = asObject(payload);
  const totals = asObject(root?.totals);
  const daily = parseDaily(root?.daily, {
    amount: "totalLinePrice",
    count: "orderCount",
  }).map((item) => ({
    date: item.date,
    orderCount: item.count,
    totalLinePrice: item.amount,
  }));

  return {
    orderCount: pickNumberOrNull(totals?.orderCount, totals?.count, root?.orderCount) ?? 0,
    totalUnitPrice: pickNumberOrNull(
      totals?.totalUnitPrice,
      totals?.unitPrice,
      root?.totalUnitPrice,
    ) ?? 0,
    totalLinePrice: pickNumberOrNull(
      totals?.totalLinePrice,
      totals?.lineTotal,
      totals?.totalLineTotal,
      root?.totalLinePrice,
    ) ?? 0,
    daily,
    comparisonPercent: getComparisonPercent(root),
  };
}

export function normalizeReportSalesSummary(payload: unknown): DashboardSalesSummary {
  const root = asObject(payload);
  const totals = asObject(root?.totals);
  return {
    saleCount: pickNumberOrNull(totals?.saleCount, totals?.count) ?? 0,
    confirmedCount: pickNumberOrNull(totals?.confirmedCount, totals?.confirmed) ?? 0,
    cancelledCount: pickNumberOrNull(totals?.cancelledCount, totals?.cancelled) ?? 0,
    totalUnitPrice: pickNumberOrNull(totals?.totalUnitPrice, totals?.unitPrice) ?? 0,
    totalLineTotal: pickNumberOrNull(
      totals?.totalLineTotal,
      totals?.totalLinePrice,
      totals?.lineTotal,
    ) ?? 0,
    averageBasket: pickNumberOrNull(totals?.averageBasket) ?? 0,
    cancelRate: pickNumberOrNull(totals?.cancelRate) ?? 0,
  };
}

export function normalizeReportSalesByProduct(
  payload: unknown,
): DashboardProductPerformanceItem[] {
  const rawItems = getDataArray(payload);
  return rawItems
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => ({
      id: pickString(item.id, item.productVariantId, item.productId, `product-${index}`),
      productName: pickString(item.productName, asObject(item.product)?.name, "-"),
      variantName: pickString(item.variantName, asObject(item.productVariant)?.name, "-"),
      quantity: pickNumberOrNull(item.quantity, item.totalQuantity, item.soldQuantity) ?? 0,
      totalLinePrice: pickNumberOrNull(
        item.totalLinePrice,
        item.totalLineTotal,
        item.lineTotal,
        item.total,
      ) ?? 0,
      totalTax: pickNumberOrNull(item.totalTax, item.taxAmount, item.totalTaxAmount) ?? 0,
      totalDiscount:
        pickNumberOrNull(item.totalDiscount, item.discountAmount, item.totalDiscountAmount) ?? 0,
      currency: pickString(item.currency, "TRY"),
    }));
}

export function normalizeReportStoresPerformance(
  payload: unknown,
): DashboardStorePerformanceItem[] {
  const rawItems = getDataArray(payload);
  return rawItems
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => ({
      id: pickString(item.storeId, item.id, `store-${index}`),
      storeName: pickString(item.storeName, asObject(item.store)?.name, "-"),
      saleCount: pickNumberOrNull(item.saleCount, item.orderCount, item.totalSales) ?? 0,
      confirmedCount: pickNumberOrNull(item.confirmedCount, item.confirmedSales) ?? 0,
      cancelledCount: pickNumberOrNull(item.cancelledCount, item.cancelledSales) ?? 0,
      totalLinePrice: pickNumberOrNull(
        item.totalLinePrice,
        item.totalLineTotal,
        item.lineTotal,
        item.total,
      ) ?? 0,
      cancelRate: pickNumberOrNull(item.cancelRate, item.cancellationRate) ?? 0,
    }));
}

export function normalizeReportStockLow(payload: unknown): DashboardStockLowItem[] {
  const rawItems = getDataArray(payload);
  return rawItems
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => ({
      id: pickString(item.id, item.productVariantId, `low-${index}`),
      productName: pickString(item.productName, asObject(item.product)?.name, "-"),
      variantName: pickString(item.variantName, asObject(item.productVariant)?.name, "-"),
      storeName: pickString(item.storeName, asObject(item.store)?.name, "-"),
      quantity: pickNumberOrNull(item.quantity, item.totalQuantity, item.stock) ?? 0,
      threshold: pickNumberOrNull(item.threshold, item.minStock, item.minQuantity) ?? 0,
    }));
}

export function normalizeReportInventoryMovementsSummary(payload: unknown): {
  summaryByType: DashboardMovementTypeSummary[];
  data: DashboardMovementItem[];
} {
  const root = asObject(payload);
  const summaryNode = root?.summaryByType;
  const summaryByType: DashboardMovementTypeSummary[] = [];

  if (Array.isArray(summaryNode)) {
    summaryNode
      .map((item) => asObject(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .forEach((item) => {
        summaryByType.push({
          movementType: pickString(item.movementType, item.type, "-"),
          movementCount: pickNumberOrNull(item.movementCount, item.count) ?? 0,
          totalQuantity: pickNumberOrNull(item.totalQuantity, item.quantity) ?? 0,
        });
      });
  } else {
    const summaryMap = asObject(summaryNode);
    if (summaryMap) {
      Object.entries(summaryMap).forEach(([movementType, info]) => {
        const item = asObject(info);
        summaryByType.push({
          movementType,
          movementCount: pickNumberOrNull(item?.movementCount, item?.count, info) ?? 0,
          totalQuantity: pickNumberOrNull(item?.totalQuantity, item?.quantity) ?? 0,
        });
      });
    }
  }

  const rawItems = getDataArray(payload);
  const data = rawItems
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => ({
      id: pickString(item.id, `movement-${index}`),
      movementType: pickString(item.movementType, item.type, "-"),
      quantity: pickNumberOrNull(item.quantity, item.totalQuantity) ?? 0,
      storeName: pickString(item.storeName, asObject(item.store)?.name, "-"),
      variantName: pickString(item.variantName, asObject(item.productVariant)?.name, "-"),
      createdAt: pickString(item.createdAt) || undefined,
    }));

  return { summaryByType, data };
}

export function normalizeReportSalesCancellations(
  payload: unknown,
): DashboardCancellationItem[] {
  const rawItems = getDataArray(payload);
  return rawItems
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => ({
      id: pickString(item.id, `cancelled-${index}`),
      receiptNo: pickString(item.receiptNo, item.receiptNumber, "-"),
      name: pickString(item.name, "-"),
      surname: pickString(item.surname, "-"),
      storeName: pickString(item.storeName, asObject(item.store)?.name, "-"),
      status: pickString(item.status, "CANCELLED"),
      lineTotal: pickNumberOrNull(
        item.lineTotal,
        item.totalLinePrice,
        item.total,
      ) ?? 0,
      createdAt: pickString(item.createdAt) || undefined,
      cancelledAt: pickString(item.cancelledAt) || undefined,
    }));
}

export function normalizeReportStockSummaryMetrics(
  payload: unknown,
): DashboardStockSummaryMetrics {
  const root = asObject(payload);
  const products = getDataArray(payload)
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));

  let variantCount = 0;
  const storeIds = new Set<string>();
  products.forEach((product) => {
    const variants = toArray(product.variants)
      .map((variant) => asObject(variant))
      .filter((variant): variant is Record<string, unknown> => Boolean(variant));
    variantCount += variants.length;
    variants.forEach((variant) => {
      toArray(variant.stores)
        .map((store) => asObject(store))
        .filter((store): store is Record<string, unknown> => Boolean(store))
        .forEach((store) => {
          const storeId = pickString(store.storeId, asObject(store.store)?.id);
          if (storeId) storeIds.add(storeId);
        });
    });
  });

  return {
    totalQuantity: pickNumberOrNull(root?.totalQuantity) ?? 0,
    productCount: products.length,
    variantCount,
    storeCount: storeIds.size,
  };
}
