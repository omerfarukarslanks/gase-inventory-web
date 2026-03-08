"use client";

import { useCallback, useState } from "react";
import { getReportRevenueTrend, type RevenueTrendItem } from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
} from "@/components/reports/ReportFilters";
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
import { formatReportPercent } from "@/lib/report-format";
import { getDefaultReportDateRange } from "@/lib/report-dates";

const defaultDateRange = getDefaultReportDateRange();

export default function RevenueTrendPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [groupByInput, setGroupByInput] = useState<"day" | "week" | "month">("day");
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const groupByOptions = [
    { value: "day", label: "Gun" },
    { value: "week", label: "Hafta" },
    { value: "month", label: "Ay" },
  ] as const;

  const loadItems = useCallback(async () => {
    const res = await getReportRevenueTrend({ startDate, endDate, groupBy });
    return res.data ?? [];
  }, [startDate, endDate, groupBy]);

  const {
    data: items,
    loading,
    error,
    refresh,
  } = useAsyncReportData<RevenueTrendItem[]>({
    initialData: [],
    load: loadItems,
  });

  const hasCurrency = items.some((item) => Boolean(item.currency));

  const handleFilter = () => {
    if (
      startDateInput === startDate &&
      endDateInput === endDate &&
      groupByInput === groupBy
    ) {
      void refresh();
      return;
    }

    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setGroupBy(groupByInput);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Gelir Trendi"
        description="Secilen tarih araliginda donem bazli gelir degisimi"
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
        <ReportFilterField label="Gruplama">
          <SearchableDropdown
            options={[...groupByOptions]}
            value={groupByInput}
            onChange={(value) => setGroupByInput(value as "day" | "week" | "month")}
            placeholder="Gruplama"
            showEmptyOption={false}
            allowClear={false}
            showSearchInput={false}
            inputAriaLabel="Gelir trendi gruplama"
            toggleAriaLabel="Gelir trendi gruplama listesini ac"
            className="w-[130px]"
          />
        </ReportFilterField>
        <ReportFilterButton
          onClick={handleFilter}
          loading={loading}
        />
      </ReportFilters>

      <ReportAsyncState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Secilen tarih araliginda veri bulunamadi."
      >
        <ReportTableSurface padded>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell compact>Donem</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Satis Adedi</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell compact>PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell compact>Toplam Gelir</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Ort. Sepet</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Degisim</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact className="pr-0">Trend</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody divided>
                {items.map((item, idx) => (
                  <ReportTableRow key={idx} className="text-text">
                    <ReportTableCell compact className="font-medium">{item.period ?? "-"}</ReportTableCell>
                    <ReportTableCell compact>{item.saleCount ?? 0}</ReportTableCell>
                    {hasCurrency && <ReportTableCell compact>{item.currency ?? "-"}</ReportTableCell>}
                    <ReportTableCell compact>{formatPrice(item.totalRevenue)}</ReportTableCell>
                    <ReportTableCell compact>{formatPrice(item.averageBasket)}</ReportTableCell>
                    <ReportTableCell compact>{formatReportPercent(item.changePercent)}</ReportTableCell>
                    <ReportTableCell compact className="pr-0">{item.trend ?? "-"}</ReportTableCell>
                  </ReportTableRow>
                ))}
              </ReportTableBody>
            </ReportTable>
          </ReportTableScroll>
        </ReportTableSurface>
      </ReportAsyncState>
    </div>
  );
}
