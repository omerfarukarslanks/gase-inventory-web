"use client";

import { useCallback, useState } from "react";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
  ReportNumberInput,
} from "@/components/reports/ReportFilters";
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
import {
  getReportEmployeePerformance,
  type EmployeePerformanceItem,
} from "@/lib/reports";

const defaultDateRange = getDefaultReportDateRange();

export default function EmployeePerformancePage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [limitInput, setLimitInput] = useState("50");
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [limit, setLimit] = useState(50);

  const loadItems = useCallback(async () => {
    const res = await getReportEmployeePerformance({
      startDate,
      endDate,
      limit,
    });

    return res.data ?? [];
  }, [startDate, endDate, limit]);

  const {
    data: items,
    loading,
    error,
    refresh,
  } = useAsyncReportData<EmployeePerformanceItem[]>({
    initialData: [],
    load: loadItems,
  });

  const hasCurrency = items.some((item) => Boolean(item.currency));

  const handleFilter = () => {
    const parsedLimit = Number.parseInt(limitInput, 10);
    const nextLimit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 50 : parsedLimit;

    if (
      startDateInput === startDate &&
      endDateInput === endDate &&
      nextLimit === limit
    ) {
      void refresh();
      return;
    }

    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setLimit(nextLimit);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Calisan Performansi"
        description="Secilen tarih araliginda calisan satis performansi"
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
        <ReportFilterField label="Limit">
          <ReportNumberInput
            min={1}
            max={200}
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="w-20"
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
        emptyMessage="Secilen tarih araliginda calisan performans verisi bulunamadi."
      >
        <ReportTableSurface>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell>Sira</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Ad Soyad</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Email</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Satis</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Onayli</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Iptal</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Iptal Orani</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell align="right">Toplam Gelir</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Ort. Sepet</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, idx) => (
                  <ReportTableRow
                    key={item.userId ?? idx}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell className="font-medium text-text">
                      {item.rank ?? idx + 1}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {[item.userName, item.userSurname].filter(Boolean).join(" ") || "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-muted">
                      {item.userEmail ?? "-"}
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
                    <ReportTableCell align="right" className="text-text">
                      {formatReportPercent(item.cancelRate)}
                    </ReportTableCell>
                    {hasCurrency && (
                      <ReportTableCell align="right" className="text-text">
                        {item.currency ?? "-"}
                      </ReportTableCell>
                    )}
                    <ReportTableCell align="right" className="font-medium text-text">
                      {formatPrice(item.totalRevenue)}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {formatPrice(item.averageBasket)}
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
