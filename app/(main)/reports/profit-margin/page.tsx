"use client";

import { useCallback, useState } from "react";
import {
  getReportProfitMargin,
  type ProfitMarginItem,
  type ProfitMarginResponse,
} from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
  ReportNumberInput,
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

export default function ProfitMarginPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [limitInput, setLimitInput] = useState("50");
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [limit, setLimit] = useState(50);

  const loadData = useCallback(async (): Promise<{
    items: ProfitMarginItem[];
    totals: ProfitMarginResponse["totals"];
  }> => {
    const res = await getReportProfitMargin({ startDate, endDate, limit });
    return {
      items: res.data ?? [],
      totals: res.totals,
    };
  }, [startDate, endDate, limit]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: ProfitMarginItem[];
    totals: ProfitMarginResponse["totals"];
  }>({
    initialData: {
      items: [],
      totals: undefined,
    },
    load: loadData,
  });

  const { items, totals } = data;
  const hasCurrency = items.some((item) => Boolean(item.currency));

  const summaryCards = [
    { label: "Toplam Gelir", value: formatPrice(totals?.totalRevenue) },
    { label: "Toplam Maliyet", value: formatPrice(totals?.totalCost) },
    { label: "Brut Kar", value: formatPrice(totals?.grossProfit) },
    {
      label: "Kar Marji",
      value: formatReportPercent(totals?.profitMargin),
    },
  ];

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
        title="Kar Marji"
        description="Urun bazli kar marji analizi"
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
            max={500}
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="w-24"
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
        <>
          <ReportSummaryCards
            items={summaryCards}
            gridClassName="sm:grid-cols-2 lg:grid-cols-4"
          />

          <ReportTableSurface padded>
            <ReportTableScroll>
              <ReportTable>
                <ReportTableHead>
                  <ReportTableHeadRow>
                    <ReportTableHeaderCell compact>Urun</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Varyant</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Kod</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Satilan</ReportTableHeaderCell>
                    {hasCurrency && <ReportTableHeaderCell compact>PB</ReportTableHeaderCell>}
                    <ReportTableHeaderCell compact>Gelir</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Maliyet</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Brut Kar</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact className="pr-0">Marj</ReportTableHeaderCell>
                  </ReportTableHeadRow>
                </ReportTableHead>
                <ReportTableBody divided>
                  {items.map((item, idx) => (
                    <ReportTableRow key={idx} className="text-text">
                      <ReportTableCell compact className="font-medium">
                        {item.productName ?? "-"}
                      </ReportTableCell>
                      <ReportTableCell compact>{item.variantName ?? "-"}</ReportTableCell>
                      <ReportTableCell compact>{item.variantCode ?? "-"}</ReportTableCell>
                      <ReportTableCell compact>{item.soldQuantity ?? 0}</ReportTableCell>
                      {hasCurrency && <ReportTableCell compact>{item.currency ?? "-"}</ReportTableCell>}
                      <ReportTableCell compact>{formatPrice(item.totalRevenue)}</ReportTableCell>
                      <ReportTableCell compact>{formatPrice(item.totalCost)}</ReportTableCell>
                      <ReportTableCell compact>{formatPrice(item.grossProfit)}</ReportTableCell>
                      <ReportTableCell compact className="pr-0">
                        {formatReportPercent(item.profitMargin)}
                      </ReportTableCell>
                    </ReportTableRow>
                  ))}
                </ReportTableBody>
              </ReportTable>
            </ReportTableScroll>
          </ReportTableSurface>
        </>
      </ReportAsyncState>
    </div>
  );
}
