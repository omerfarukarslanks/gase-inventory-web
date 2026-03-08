"use client";

import { useCallback, useState } from "react";
import {
  getReportSupplierSalesPerformance,
  type SupplierSalesPerformanceItem,
  type SupplierSalesPerformanceResponse,
} from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
  ReportTextInput,
} from "@/components/reports/ReportFilters";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import ReportPageHeader from "@/components/reports/ReportPageHeader";
import {
  ReportTable,
  ReportTableBody,
  ReportTableCell,
  ReportTableHead,
  ReportTableHeaderCell,
  ReportTableHeadRow,
  ReportTableRow,
  ReportTableScroll,
  ReportTableSurface,
} from "@/components/reports/ReportTable";
import { useAsyncReportData } from "@/hooks/useAsyncReportData";
import { formatPrice } from "@/lib/format";
import { getDefaultReportDateRange } from "@/lib/report-dates";

const defaultDateRange = getDefaultReportDateRange();

export default function SupplierPerformancePage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [searchInput, setSearchInput] = useState("");
  const [limitInput, setLimitInput] = useState("20");

  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const limitOptions = [
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ] as const;

  const loadData = useCallback(async (): Promise<{
    items: SupplierSalesPerformanceItem[];
    totals: SupplierSalesPerformanceResponse["totals"];
    meta: SupplierSalesPerformanceResponse["meta"];
  }> => {
    const res = await getReportSupplierSalesPerformance({
      startDate,
      endDate,
      search: search || undefined,
      page,
      limit,
    });

    return {
      items: res.data ?? [],
      totals: res.totals,
      meta: res.meta ?? {
        total: res.data?.length ?? 0,
        limit,
        page,
        totalPages: 1,
      },
    };
  }, [startDate, endDate, search, page, limit]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: SupplierSalesPerformanceItem[];
    totals: SupplierSalesPerformanceResponse["totals"];
    meta: SupplierSalesPerformanceResponse["meta"];
  }>({
    initialData: {
      items: [],
      totals: undefined,
      meta: undefined,
    },
    load: loadData,
  });

  const { items, totals, meta } = data;
  const hasCurrency = items.some((item) => Boolean(item.currency));
  const totalPages = meta?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const onFilter = () => {
    const nextSearch = searchInput.trim();
    const nextLimit = Number.parseInt(limitInput, 10) || 20;

    if (
      startDateInput === startDate &&
      endDateInput === endDate &&
      nextSearch === search &&
      nextLimit === limit &&
      page === 1
    ) {
      void refresh();
      return;
    }

    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setSearch(nextSearch);
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Tedarikci Performansi"
        description="Tedarikci bazli satis performansi ve ciro analizi"
      />

      <ReportFilters>
        <ReportFilterField label="Baslangic">
          <ReportDateInput
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
          />
        </ReportFilterField>
        <ReportFilterField label="Bitis">
          <ReportDateInput
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
          />
        </ReportFilterField>
        <ReportFilterField label="Search">
          <ReportTextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tedarikci ara..."
            className="w-56"
          />
        </ReportFilterField>
        <ReportFilterField label="Limit">
          <SearchableDropdown
            options={[...limitOptions]}
            value={limitInput}
            onChange={(value) => setLimitInput(value || "20")}
            placeholder="Limit"
            showEmptyOption={false}
            allowClear={false}
            showSearchInput={false}
            inputAriaLabel="Tedarikci performansi limit"
            toggleAriaLabel="Tedarikci performansi limit listesini ac"
            className="w-[100px]"
          />
        </ReportFilterField>
        <ReportFilterButton
          onClick={onFilter}
          loading={loading}
        />
      </ReportFilters>

      {!loading && !error && totals && (
        <ReportSummaryCards
          items={[
            { label: "Tedarikci", value: totals.totalSuppliers ?? 0, className: "p-4" },
            { label: "Satis", value: totals.totalSales ?? 0, className: "p-4" },
            { label: "Urun", value: totals.totalProducts ?? 0, className: "p-4" },
            { label: "Varyant", value: totals.totalVariants ?? 0, className: "p-4" },
            { label: "Miktar", value: totals.totalQuantity ?? 0, className: "p-4" },
            { label: "Toplam Birim", value: formatPrice(totals.totalUnitPrice), className: "p-4" },
            { label: "Toplam Indirim", value: formatPrice(totals.totalDiscount), className: "p-4" },
            { label: "Toplam Vergi", value: formatPrice(totals.totalTax), className: "p-4" },
            { label: "Toplam Ciro", value: formatPrice(totals.totalLineTotal), className: "p-4 sm:col-span-2" },
          ]}
          gridClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          valueClassName="mt-1 text-lg"
        />
      )}

      <ReportAsyncState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Secilen filtrelerde veri bulunamadi."
      >
        <ReportTableSurface>
          <ReportTableScroll>
            <ReportTable className="min-w-[1320px]">
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell>Tedarikci</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Telefon</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Email</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Satis</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Urun</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Varyant</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Miktar</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell align="right">Toplam</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Ort. Birim</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, idx) => (
                  <ReportTableRow
                    key={item.supplierId ?? idx}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell className="text-text">
                      {[item.supplierName, item.supplierSurname].filter(Boolean).join(" ") || "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">{item.supplierPhoneNumber ?? "-"}</ReportTableCell>
                    <ReportTableCell className="text-muted">{item.supplierEmail ?? "-"}</ReportTableCell>
                    <ReportTableCell align="right" className="text-text">{item.saleCount ?? 0}</ReportTableCell>
                    <ReportTableCell align="right" className="text-text">{item.productCount ?? 0}</ReportTableCell>
                    <ReportTableCell align="right" className="text-text">{item.variantCount ?? 0}</ReportTableCell>
                    <ReportTableCell align="right" className="text-text">{item.quantity ?? 0}</ReportTableCell>
                    {hasCurrency && <ReportTableCell align="right" className="text-text">{item.currency ?? "-"}</ReportTableCell>}
                    <ReportTableCell align="right" className="font-medium text-text">{formatPrice(item.lineTotal)}</ReportTableCell>
                    <ReportTableCell align="right" className="text-text">{formatPrice(item.avgUnitPrice)}</ReportTableCell>
                  </ReportTableRow>
                ))}
              </ReportTableBody>
            </ReportTable>
          </ReportTableScroll>
        </ReportTableSurface>
      </ReportAsyncState>

      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
          <div className="text-muted">
            Toplam: {meta?.total ?? 0} kayit | Sayfa: {page}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={!canPrev}
              className="h-9 rounded-lg border border-border px-3 text-sm text-text transition-colors hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Onceki
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!canNext}
              className="h-9 rounded-lg border border-border px-3 text-sm text-text transition-colors hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
