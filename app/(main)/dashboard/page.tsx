"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import Button from "@/components/ui/Button";
import CollapsiblePanel from "@/components/ui/CollapsiblePanel";
import SearchableMultiSelectDropdown from "@/components/ui/SearchableMultiSelectDropdown";
import {
  CompareBarChart,
  RingStatusChart,
  TrendAreaChart,
  type CompareBarChartPoint,
  type RingStatusChartDatum,
  type TrendAreaChartPoint,
} from "@/components/dashboard/Chart";
import { useStores } from "@/hooks/useStores";
import { formatDate, formatPrice } from "@/lib/format";
import { getSessionUserRole, isStoreScopedRole } from "@/lib/authz";
import { getSaleById, type SaleDetail } from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
import {
  getReportInventoryMovementsSummary,
  getReportOrdersConfirmedTotal,
  getReportOrdersReturnsTotal,
  getReportSalesByProduct,
  getReportSalesCancellations,
  getReportSalesSummary,
  getReportStockLow,
  getReportStockTotalQuantity,
  getReportStoresPerformance,
} from "@/lib/reports";
import {
  normalizeReportInventoryMovementsSummary,
  normalizeReportOrdersTotal,
  normalizeReportSalesByProduct,
  normalizeReportSalesCancellations,
  normalizeReportSalesSummary,
  normalizeReportStockLow,
  normalizeReportStockTotalQuantity,
  normalizeReportStoresPerformance,
  type DashboardCancellationItem,
  type DashboardMovementItem,
  type DashboardMovementTypeSummary,
  type DashboardOrdersTotal,
  type DashboardProductPerformanceItem,
  type DashboardSalesSummary,
  type DashboardStockLowItem,
  type DashboardStockTotalQuantity,
  type DashboardStorePerformanceItem,
} from "@/lib/reports-normalize";
import SaleDetailModal from "@/components/sales/SaleDetailModal";

type DashboardFilters = {
  storeIds: string[];
  startDate: string;
  endDate: string;
  compareDate: string;
  search: string;
  threshold: number;
};

function toInputDate(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultDateFilters() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  const compare = new Date(start);
  compare.setDate(start.getDate() - 7);

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
    compareDate: toInputDate(compare),
  };
}

function formatCount(value: number) {
  return value.toLocaleString("tr-TR");
}

function formatCurrency(value: number) {
  return `₺${formatPrice(value)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return `%${value.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
}

function toDelta(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return 0;
  return value;
}

function toChartLabel(raw: string) {
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

function sortByDate<T extends { date: string }>(rows: T[]) {
  return [...rows].sort((left, right) => {
    const leftTime = Date.parse(left.date);
    const rightTime = Date.parse(right.date);
    if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) return leftTime - rightTime;
    return left.date.localeCompare(right.date);
  });
}

function shortText(value: string, max = 16) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

const EMPTY_STOCK_TOTAL: DashboardStockTotalQuantity = {
  todayTotalQuantity: 0,
  daily: [],
  comparisonPercent: null,
};
const EMPTY_ORDERS_TOTAL: DashboardOrdersTotal = {
  orderCount: 0,
  totalUnitPrice: 0,
  totalLinePrice: 0,
  daily: [],
  comparisonPercent: null,
};
const EMPTY_SUMMARY: DashboardSalesSummary = {
  saleCount: 0,
  confirmedCount: 0,
  cancelledCount: 0,
  totalUnitPrice: 0,
  totalLineTotal: 0,
  averageBasket: 0,
  cancelRate: 0,
};
export default function DashboardPage() {
  const stores = useStores();

  const [scopeReady, setScopeReady] = useState(false);
  const [isStoreScopedUser, setIsStoreScopedUser] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [compareDate, setCompareDate] = useState("");
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState("10");
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [saleDetailOpen, setSaleDetailOpen] = useState(false);
  const [saleDetailLoading, setSaleDetailLoading] = useState(false);
  const [saleDetailError, setSaleDetailError] = useState("");
  const [saleDetail, setSaleDetail] = useState<SaleDetail | null>(null);

  const [stockTotal, setStockTotal] = useState<DashboardStockTotalQuantity>(EMPTY_STOCK_TOTAL);
  const [confirmedTotals, setConfirmedTotals] = useState<DashboardOrdersTotal>(EMPTY_ORDERS_TOTAL);
  const [returnsTotals, setReturnsTotals] = useState<DashboardOrdersTotal>(EMPTY_ORDERS_TOTAL);
  const [salesSummary, setSalesSummary] = useState<DashboardSalesSummary>(EMPTY_SUMMARY);
  const [salesByProduct, setSalesByProduct] = useState<DashboardProductPerformanceItem[]>([]);
  const [storesPerformance, setStoresPerformance] = useState<DashboardStorePerformanceItem[]>([]);
  const [stockLow, setStockLow] = useState<DashboardStockLowItem[]>([]);
  const [movementSummary, setMovementSummary] = useState<DashboardMovementTypeSummary[]>([]);
  const [movementItems, setMovementItems] = useState<DashboardMovementItem[]>([]);
  const [cancellations, setCancellations] = useState<DashboardCancellationItem[]>([]);

  useEffect(() => {
    const role = getSessionUserRole();
    const scoped = isStoreScopedRole(role);
    const defaults = getDefaultDateFilters();

    setIsStoreScopedUser(scoped);
    setStoreIds([]);
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
    setCompareDate(defaults.compareDate);
    setSearch("");
    setThreshold("10");
    setAppliedFilters({
      storeIds: [],
      startDate: defaults.startDate,
      endDate: defaults.endDate,
      compareDate: defaults.compareDate,
      search: "",
      threshold: 10,
    });
    setScopeReady(true);
  }, []);

  const storeOptions = useMemo(
    () =>
      stores
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.id, label: item.name })),
    [stores],
  );

  const applyFilters = useCallback(() => {
    setAppliedFilters({
      storeIds,
      startDate,
      endDate,
      compareDate,
      search: search.trim(),
      threshold: Number.isFinite(Number(threshold)) && Number(threshold) >= 0 ? Number(threshold) : 0,
    });
  }, [storeIds, startDate, endDate, compareDate, search, threshold]);

  const resetFilters = useCallback(() => {
    const defaults = getDefaultDateFilters();
    setStoreIds([]);
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
    setCompareDate(defaults.compareDate);
    setSearch("");
    setThreshold("10");
    setAppliedFilters({
      storeIds: [],
      startDate: defaults.startDate,
      endDate: defaults.endDate,
      compareDate: defaults.compareDate,
      search: "",
      threshold: 10,
    });
  }, []);

  useEffect(() => {
    if (!scopeReady || !appliedFilters) return;

    let active = true;

    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const scopedStoreIds =
          !isStoreScopedUser && appliedFilters.storeIds.length > 0
            ? appliedFilters.storeIds
            : undefined;
        const rangeParams = {
          ...(scopedStoreIds ? { storeIds: scopedStoreIds } : {}),
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
        };
        const storeOnlyParams = {
          ...(scopedStoreIds ? { storeIds: scopedStoreIds } : {}),
          search: appliedFilters.search || undefined,
        };

        const [
          stockTotalPayload,
          confirmedPayload,
          returnsPayload,
          salesSummaryPayload,
          byProductPayload,
          storePerformancePayload,
          stockLowPayload,
          movementsPayload,
          cancellationsPayload,
        ] = await Promise.all([
          getReportStockTotalQuantity({
            ...rangeParams,
            search: appliedFilters.search || undefined,
            compareDate: appliedFilters.compareDate || undefined,
          }),
          getReportOrdersConfirmedTotal({
            ...rangeParams,
            compareDate: appliedFilters.compareDate || undefined,
          }),
          getReportOrdersReturnsTotal({
            ...rangeParams,
            compareDate: appliedFilters.compareDate || undefined,
          }),
          getReportSalesSummary(rangeParams),
          getReportSalesByProduct({
            ...rangeParams,
            search: appliedFilters.search || undefined,
            page: 1,
            limit: 8,
          }),
          getReportStoresPerformance({
            ...rangeParams,
            search: appliedFilters.search || undefined,
            page: 1,
            limit: 8,
          }),
          getReportStockLow({
            ...storeOnlyParams,
            threshold: appliedFilters.threshold,
            page: 1,
            limit: 8,
          }),
          getReportInventoryMovementsSummary({
            ...rangeParams,
            search: appliedFilters.search || undefined,
            page: 1,
            limit: 8,
          }),
          getReportSalesCancellations({
            ...rangeParams,
            search: appliedFilters.search || undefined,
            page: 1,
            limit: 8,
          }),
        ]);

        if (!active) return;

        const normalizedMovements = normalizeReportInventoryMovementsSummary(movementsPayload);

        setStockTotal(normalizeReportStockTotalQuantity(stockTotalPayload));
        setConfirmedTotals(normalizeReportOrdersTotal(confirmedPayload));
        setReturnsTotals(normalizeReportOrdersTotal(returnsPayload));
        setSalesSummary(normalizeReportSalesSummary(salesSummaryPayload));
        setSalesByProduct(normalizeReportSalesByProduct(byProductPayload));
        setStoresPerformance(normalizeReportStoresPerformance(storePerformancePayload));
        setStockLow(normalizeReportStockLow(stockLowPayload));
        setMovementSummary(normalizedMovements.summaryByType);
        setMovementItems(normalizedMovements.data);
        setCancellations(normalizeReportSalesCancellations(cancellationsPayload));
        setLastUpdatedAt(new Date().toISOString());
      } catch {
        if (!active) return;
        setError("Dashboard raporlari yuklenemedi. Filtreleri kontrol edip tekrar deneyin.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void fetchReports();

    return () => {
      active = false;
    };
  }, [scopeReady, isStoreScopedUser, appliedFilters]);

  const orderTrendData = useMemo<TrendAreaChartPoint[]>(() => {
    const map = new Map<string, { confirmed: number; returns: number }>();
    confirmedTotals.daily.forEach((item) => {
      const key = item.date || "-";
      const current = map.get(key) ?? { confirmed: 0, returns: 0 };
      current.confirmed = item.totalLinePrice;
      map.set(key, current);
    });
    returnsTotals.daily.forEach((item) => {
      const key = item.date || "-";
      const current = map.get(key) ?? { confirmed: 0, returns: 0 };
      current.returns = item.totalLinePrice;
      map.set(key, current);
    });

    return sortByDate(
      Array.from(map.entries()).map(([date, value]) => ({
        date,
        confirmed: value.confirmed,
        returns: value.returns,
      })),
    ).map((item) => ({
      label: toChartLabel(item.date),
      primary: item.confirmed,
      secondary: item.returns,
    }));
  }, [confirmedTotals.daily, returnsTotals.daily]);

  const stockTrendData = useMemo<TrendAreaChartPoint[]>(
    () =>
      sortByDate(stockTotal.daily).map((item) => ({
        label: toChartLabel(item.date),
        primary: item.totalQuantity,
      })),
    [stockTotal.daily],
  );

  const storePerformanceChartData = useMemo<CompareBarChartPoint[]>(
    () =>
      storesPerformance.slice(0, 8).map((item) => ({
        label: shortText(item.storeName, 14),
        primary: item.confirmedCount,
        secondary: item.cancelledCount,
      })),
    [storesPerformance],
  );

  const statusChartData = useMemo<RingStatusChartDatum[]>(
    () => [
      {
        name: "Confirmed",
        value: salesSummary.confirmedCount,
        color: "rgb(var(--primary))",
      },
      {
        name: "Cancelled",
        value: salesSummary.cancelledCount,
        color: "rgb(var(--error))",
      },
      {
        name: "Draft",
        value: Math.max(0, salesSummary.saleCount - salesSummary.confirmedCount - salesSummary.cancelledCount),
        color: "rgb(var(--warning))",
      },
    ],
    [salesSummary],
  );

  const summaryComparisonHint = appliedFilters?.compareDate
    ? `Karsilastirma tarihi: ${formatDate(appliedFilters.compareDate)}`
    : "Karsilastirma tarihi secilmedi";

  const openSaleDetailDialog = async (saleId: string) => {
    setSaleDetailOpen(true);
    setSaleDetailLoading(true);
    setSaleDetailError("");
    try {
      const response = await getSaleById(saleId);
      const normalized = normalizeSaleDetail(response);
      if (!normalized) {
        setSaleDetail(null);
        setSaleDetailError("Satis fis detayi alinamadi.");
        return;
      }
      setSaleDetail(normalized);
    } catch {
      setSaleDetail(null);
      setSaleDetailError("Satis fis detayi yuklenemedi. Lutfen tekrar deneyin.");
    } finally {
      setSaleDetailLoading(false);
    }
  };

  const closeSaleDetailDialog = () => {
    setSaleDetailOpen(false);
    setSaleDetailError("");
    setSaleDetail(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
          <p className="text-sm text-muted">Satis, stok ve hareket raporlarini tek ekranda izleyin.</p>
          {lastUpdatedAt && (
            <p className="mt-1 text-xs text-muted">Son guncelleme: {formatDate(lastUpdatedAt)}</p>
          )}
        </div>
        <Link
          href="/dashboard-1"
          className="rounded-xl2 border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:bg-surface2"
        >
          Eski Dashboard (dashboard-1)
        </Link>
      </header>

      <CollapsiblePanel
        title="Filtreler"
        open={filtersOpen}
        onToggle={() => setFiltersOpen((prev) => !prev)}
        className="bg-surface"
        rightSlot={
          <span className="text-[11px] text-muted">
            {filtersOpen ? "Acik" : "Kapali"}
          </span>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {!isStoreScopedUser && (
            <div className="xl:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-muted">Magazalar</label>
              <SearchableMultiSelectDropdown
                options={storeOptions}
                values={storeIds}
                onChange={setStoreIds}
                placeholder="Tum magazalar"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Baslangic Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Bitis Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Karsilastirma Tarihi</label>
            <input
              type="date"
              value={compareDate}
              onChange={(event) => setCompareDate(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Low Stock Esigi</label>
            <input
              type="number"
              min={0}
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="xl:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-muted">Arama</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Urun, varyant, fis no..."
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="xl:col-span-6 flex flex-wrap justify-end gap-2 pt-1">
            <Button
              label="Filtreleri Sifirla"
              onClick={resetFilters}
              variant="secondary"
              className="px-3 py-1.5"
              disabled={loading}
            />
            <Button
              label={loading ? "Raporlar Yukleniyor..." : "Filtreyi Uygula"}
              onClick={applyFilters}
              variant="primarySolid"
              className="px-3 py-1.5"
              loading={loading}
            />
          </div>
        </div>
      </CollapsiblePanel>

      {error && (
        <div className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Toplam Stok Miktari"
          value={formatCount(stockTotal.todayTotalQuantity)}
          hint={summaryComparisonHint}
          delta={toDelta(stockTotal.comparisonPercent)}
          variant="accent"
        />
        <KpiCard
          title="Onayli Siparis Tutari"
          value={formatCurrency(confirmedTotals.totalLinePrice)}
          hint={`Siparis adedi: ${formatCount(confirmedTotals.orderCount)}`}
          delta={toDelta(confirmedTotals.comparisonPercent)}
          variant="primary"
        />
        <KpiCard
          title="Iade / Iptal Tutari"
          value={formatCurrency(returnsTotals.totalLinePrice)}
          hint={`Iade adedi: ${formatCount(returnsTotals.orderCount)}`}
          delta={toDelta(
            returnsTotals.comparisonPercent != null ? -returnsTotals.comparisonPercent : null,
          )}
          variant="error"
        />
        <KpiCard
          title="Toplam Ciro"
          value={formatCurrency(salesSummary.totalLineTotal)}
          hint={`Ortalama sepet: ${formatCurrency(salesSummary.averageBasket)}`}
          delta={toDelta(confirmedTotals.comparisonPercent)}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl2 border border-border bg-surface p-5 xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text">Gunluk Satis Trendi</h2>
            <p className="text-xs text-muted">Onayli siparis ve iade/iptal tutarlarini karsilastirir.</p>
          </div>
          {orderTrendData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Grafik icin veri bulunamadi.</p>
          ) : (
            <TrendAreaChart
              data={orderTrendData}
              primaryLabel="Onayli Tutar"
              secondaryLabel="Iade / Iptal Tutar"
              valueType="currency"
              height={280}
            />
          )}
        </section>

        <section className="rounded-xl2 border border-border bg-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text">Satis Durum Dagilimi</h2>
            <p className="text-xs text-muted">Confirmed / Cancelled / Draft dagilimi</p>
          </div>
          <RingStatusChart
            data={statusChartData}
            centerLabel="Iptal Orani"
            centerValue={formatPercent(salesSummary.cancelRate)}
          />
          <div className="mt-4 space-y-2">
            {statusChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-text2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-text">{formatCount(item.value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isStoreScopedUser ? "" : "xl:grid-cols-2"}`}>
        <section className="rounded-xl2 border border-border bg-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text">Gunluk Stok Trendi</h2>
            <p className="text-xs text-muted">Toplam stok miktarinin tarih bazli degisimi</p>
          </div>
          {stockTrendData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Grafik icin veri bulunamadi.</p>
          ) : (
            <TrendAreaChart
              data={stockTrendData}
              primaryLabel="Toplam Stok"
              valueType="number"
              height={260}
            />
          )}
        </section>

        {!isStoreScopedUser && (
          <section className="rounded-xl2 border border-border bg-surface p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-text">Magaza Performansi</h2>
              <p className="text-xs text-muted">Magaza bazli confirmed ve cancelled adetleri</p>
            </div>
            {storePerformanceChartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">Grafik icin veri bulunamadi.</p>
            ) : (
              <CompareBarChart
                data={storePerformanceChartData}
                primaryLabel="Confirmed"
                secondaryLabel="Cancelled"
                valueType="number"
                height={260}
              />
            )}
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl2 border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Urun Bazli Satis Performansi</h2>
            <span className="text-xs text-muted">Ilk {salesByProduct.length} kayit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2">Urun</th>
                  <th className="px-2 py-2">Varyant</th>
                  <th className="px-2 py-2 text-right">Adet</th>
                  <th className="px-2 py-2 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {salesByProduct.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-4 text-sm text-muted">
                      Gosterilecek urun verisi bulunamadi.
                    </td>
                  </tr>
                ) : (
                  salesByProduct.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 text-sm text-text2">
                      <td className="px-2 py-2">{item.productName}</td>
                      <td className="px-2 py-2">{item.variantName}</td>
                      <td className="px-2 py-2 text-right">{formatCount(item.quantity)}</td>
                      <td className="px-2 py-2 text-right font-medium text-text">
                        {formatCurrency(item.totalLinePrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl2 border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Low Stock Alarmi</h2>
            <span className="text-xs text-muted">Esik: {threshold || "0"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2">Urun</th>
                  <th className="px-2 py-2">Varyant</th>
                  {!isStoreScopedUser && <th className="px-2 py-2">Magaza</th>}
                  <th className="px-2 py-2 text-right">Miktar</th>
                </tr>
              </thead>
              <tbody>
                {stockLow.length === 0 ? (
                  <tr>
                    <td colSpan={isStoreScopedUser ? 3 : 4} className="px-2 py-4 text-sm text-muted">
                      Low stock kaydi bulunamadi.
                    </td>
                  </tr>
                ) : (
                  stockLow.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 text-sm text-text2">
                      <td className="px-2 py-2">{item.productName}</td>
                      <td className="px-2 py-2">{item.variantName}</td>
                      {!isStoreScopedUser && <td className="px-2 py-2">{item.storeName}</td>}
                      <td className="px-2 py-2 text-right font-semibold text-error">
                        {formatCount(item.quantity)} / {formatCount(item.threshold)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl2 border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Stok Hareket Ozetleri</h2>
            <span className="text-xs text-muted">{movementSummary.length} hareket tipi</span>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {movementSummary.length === 0 ? (
              <div className="col-span-full rounded-lg border border-border bg-surface2/40 p-3 text-sm text-muted">
                Ozet bulunamadi.
              </div>
            ) : (
              movementSummary.map((item) => (
                <div key={item.movementType} className="rounded-lg border border-border bg-surface2/40 p-3">
                  <p className="text-[11px] font-semibold text-muted">{item.movementType}</p>
                  <p className="mt-1 text-sm font-semibold text-text">{formatCount(item.movementCount)}</p>
                  <p className="text-[11px] text-text2">Miktar: {formatCount(item.totalQuantity)}</p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            {movementItems.length === 0 ? (
              <p className="text-sm text-muted">Hareket detay kaydi bulunamadi.</p>
            ) : (
              movementItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface2/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{item.variantName}</p>
                    <p className="truncate text-xs text-muted">
                      {isStoreScopedUser ? item.movementType : `${item.storeName} • ${item.movementType}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text">{formatCount(item.quantity)}</p>
                    <p className="text-[11px] text-muted">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl2 border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Iptal Edilen Fisler</h2>
            <span className="text-xs text-muted">Son {cancellations.length} kayit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2">Fis No</th>
                  <th className="px-2 py-2">Musteri</th>
                  {!isStoreScopedUser && <th className="px-2 py-2">Magaza</th>}
                  <th className="px-2 py-2 text-right">Tutar</th>
                  <th className="px-2 py-2">Iptal Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {cancellations.length === 0 ? (
                  <tr>
                    <td colSpan={isStoreScopedUser ? 4 : 5} className="px-2 py-4 text-sm text-muted">
                      Iptal fis verisi bulunamadi.
                    </td>
                  </tr>
                ) : (
                  cancellations.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 text-sm text-text2">
                      <td className="px-2 py-2 font-medium text-text">
                        <button
                          type="button"
                          onClick={() => void openSaleDetailDialog(item.id)}
                          className="cursor-pointer text-left text-primary underline-offset-2 transition-colors hover:text-primary/80 hover:underline"
                        >
                          {item.receiptNo}
                        </button>
                      </td>
                      <td className="px-2 py-2">{`${item.name} ${item.surname}`}</td>
                      {!isStoreScopedUser && <td className="px-2 py-2">{shortText(item.storeName, 22)}</td>}
                      <td className="px-2 py-2 text-right">{formatCurrency(item.lineTotal)}</td>
                      <td className="px-2 py-2">{formatDate(item.cancelledAt || item.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <SaleDetailModal
        open={saleDetailOpen}
        loading={saleDetailLoading}
        error={saleDetailError}
        detail={saleDetail}
        onClose={closeSaleDetailDialog}
      />

    </div>
  );
}
