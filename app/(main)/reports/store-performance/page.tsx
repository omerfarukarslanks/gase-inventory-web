"use client";

import { useCallback, useState } from "react";
import {
  getReportStorePerformance,
  type StorePerformanceItem,
} from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
} from "@/components/reports/ReportFilters";
import ReportPageHeader from "@/components/reports/ReportPageHeader";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
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

type StorePerformanceTotals = {
  totalSales?: number;
  totalConfirmed?: number;
  totalCancelled?: number;
  totalLineTotal?: number;
};

export default function StorePerformancePage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  const loadData = useCallback(async (): Promise<{
    items: StorePerformanceItem[];
    totals: StorePerformanceTotals;
  }> => {
    const res = await getReportStorePerformance({ startDate, endDate });
    return {
      items: res.data ?? [],
      totals: res.totals ?? {},
    };
  }, [startDate, endDate]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: StorePerformanceItem[];
    totals: StorePerformanceTotals;
  }>({
    initialData: {
      items: [],
      totals: {},
    },
    load: loadData,
  });

  const { items, totals } = data;
  const hasCurrency = items.some((item) => Boolean(item.currency));

  const handleFilter = () => {
    if (startDateInput === startDate && endDateInput === endDate) {
      void refresh();
      return;
    }

    setStartDate(startDateInput);
    setEndDate(endDateInput);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Magaza Performansi"
        description="Secilen tarih araliginda magazalarin satis performansi"
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
        <ReportFilterButton
          onClick={handleFilter}
          loading={loading}
        />
      </ReportFilters>

      {!loading && !error && items.length > 0 && (
        <ReportSummaryCards
          items={[
            { label: "Toplam Satis", value: totals.totalSales ?? 0 },
            { label: "Onayli", value: totals.totalConfirmed ?? 0 },
            { label: "Iptal", value: totals.totalCancelled ?? 0 },
            { label: "Toplam Gelir", value: formatPrice(totals.totalLineTotal) },
          ]}
          gridClassName="grid-cols-2 sm:grid-cols-4"
          cardClassName="p-6 shadow-glow"
          valueClassName="mt-1"
        />
      )}

      <ReportAsyncState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Secilen tarih araliginda magaza performans verisi bulunamadi."
      >
        <ReportTableSurface>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell>Magaza</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Kod</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Satis</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Onayli</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Iptal</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell align="right">Toplam Gelir</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Ort. Sepet</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Iptal Orani</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, idx) => (
                  <ReportTableRow
                    key={item.storeId ?? idx}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell className="font-medium text-text">
                      {item.storeName ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {item.storeCode ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.saleCount ?? 0}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.confirmedCount ?? 0}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.cancelledCount ?? 0}
                    </ReportTableCell>
                    {hasCurrency && (
                      <ReportTableCell align="right" className="text-text">
                        {item.currency ?? "-"}
                      </ReportTableCell>
                    )}
                    <ReportTableCell align="right" className="font-medium text-text">
                      {formatPrice(item.totalLineTotal)}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {formatPrice(item.averageBasket)}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {formatReportPercent(item.cancelRate)}
                    </ReportTableCell>
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
