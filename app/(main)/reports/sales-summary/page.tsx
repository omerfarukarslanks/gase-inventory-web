"use client";

import { useCallback, useState } from "react";
import { getReportSalesSummary, type SalesSummaryResponse } from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
} from "@/components/reports/ReportFilters";
import ReportPageHeader from "@/components/reports/ReportPageHeader";
import { useAsyncReportData } from "@/hooks/useAsyncReportData";
import { formatPrice } from "@/lib/format";
import { formatReportNumber, formatReportPercent } from "@/lib/report-format";
import { getDefaultReportDateRange } from "@/lib/report-dates";

const defaultDateRange = getDefaultReportDateRange();

export default function SalesSummaryPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  const loadData = useCallback(async () => {
    return getReportSalesSummary({ startDate, endDate });
  }, [startDate, endDate]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<SalesSummaryResponse | null>({
    initialData: null,
    load: loadData,
  });

  const totals = data?.totals;

  const cards: { label: string; value: string }[] = [
    { label: "Satis Adedi", value: formatReportNumber(totals?.saleCount, { fallback: "0" }) },
    { label: "Onaylanan", value: formatReportNumber(totals?.confirmedCount, { fallback: "0" }) },
    { label: "Iptal Edilen", value: formatReportNumber(totals?.cancelledCount, { fallback: "0" }) },
    { label: "Toplam Birim Fiyat", value: formatPrice(totals?.totalUnitPrice) },
    { label: "Toplam Ciro", value: formatPrice(totals?.totalLineTotal) },
    { label: "Ortalama Sepet", value: formatPrice(totals?.averageBasket) },
    {
      label: "Iptal Orani",
      value: formatReportPercent(totals?.cancelRate, { multiplyBy100: true }),
    },
  ];

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
        title="Satis Ozeti"
        description="Secilen tarih araligindaki genel satis istatistikleri"
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
        isEmpty={!totals}
        emptyMessage="Secilen tarih araliginda veri bulunamadi."
      >
        <ReportSummaryCards
          items={cards}
          gridClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      </ReportAsyncState>
    </div>
  );
}
