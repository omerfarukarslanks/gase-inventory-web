"use client";

import { useCallback, useState } from "react";
import { getReportProductRanking, type ProductRankingItem } from "@/lib/reports";
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
import { formatPrice } from "@/lib/format";
import { getDefaultReportDateRange } from "@/lib/report-dates";

const defaultDateRange = getDefaultReportDateRange();

export default function ProductPerformancePage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  const loadItems = useCallback(async () => {
    const res = await getReportProductRanking({ startDate, endDate, limit: 50 });
    return res.data ?? [];
  }, [startDate, endDate]);

  const {
    data: items,
    loading,
    error,
    refresh,
  } = useAsyncReportData<ProductRankingItem[]>({
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
        title="Urun Performansi"
        description="Secilen tarih araligindaki urun bazli satis siralamasi"
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
        emptyMessage="Secilen tarih araliginda urun performans verisi bulunamadi."
      >
        <ReportTableSurface shadow={false}>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell>Sira</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Urun</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Varyant</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Kod</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Satilan</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell align="right">Gelir</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Satis Adedi</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Mevcut Stok</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, idx) => (
                  <ReportTableRow
                    key={item.productVariantId ?? idx}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell className="font-medium text-text">
                      {item.rank ?? idx + 1}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {item.productName ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {item.variantName ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-muted">
                      {item.variantCode ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="font-medium text-text">
                      {item.soldQuantity ?? 0}
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
                      {item.saleCount ?? 0}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.currentStock ?? 0}
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
