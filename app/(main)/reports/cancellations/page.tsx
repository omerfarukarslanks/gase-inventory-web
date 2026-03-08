"use client";

import { useCallback, useState } from "react";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
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
import { formatPrice, formatDate } from "@/lib/format";
import { getDefaultReportDateRange } from "@/lib/report-dates";
import { getReportCancellations, type CancellationItem } from "@/lib/reports";

const defaultDateRange = getDefaultReportDateRange();

export default function CancellationsPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  const loadItems = useCallback(async () => {
    const res = await getReportCancellations({ startDate, endDate, limit: 50 });
    return res.data ?? [];
  }, [startDate, endDate]);

  const {
    data: items,
    loading,
    error,
    refresh,
  } = useAsyncReportData<CancellationItem[]>({
    initialData: [],
    load: loadItems,
  });

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
        title="Iptal Raporlari"
        description="Secilen tarih araligindaki iptal edilen satis fisleri"
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

      <ReportAsyncState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Secilen tarih araliginda iptal kaydi bulunamadi."
      >
        <ReportTableSurface shadow={false}>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell>Fis No</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Musteri</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Magaza</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell align="right">Tutar</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Tarih</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, idx) => (
                  <ReportTableRow
                    key={item.id ?? idx}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell className="font-medium text-text">
                      {item.receiptNo ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {[item.name, item.surname].filter(Boolean).join(" ") || "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {item.store?.name ?? "-"}
                    </ReportTableCell>
                    {hasCurrency && (
                      <ReportTableCell align="right" className="text-text">
                        {item.currency ?? "-"}
                      </ReportTableCell>
                    )}
                    <ReportTableCell align="right" className="font-medium text-text">
                      {formatPrice(item.lineTotal)}
                    </ReportTableCell>
                    <ReportTableCell className="text-muted">
                      {formatDate(item.cancelledAt)}
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
