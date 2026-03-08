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
import { getDefaultReportDateRange } from "@/lib/report-dates";
import {
  getReportDiscountSummary,
  type DiscountByCampaign,
  type DiscountByStore,
} from "@/lib/reports";

const defaultDateRange = getDefaultReportDateRange();

export default function DiscountSummaryPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  const loadData = useCallback(async () => {
    const res = await getReportDiscountSummary({ startDate, endDate });
    return {
      totalDiscount: res.totalDiscount,
      byCampaign: res.byCampaign ?? [],
      byStore: res.byStore ?? [],
    };
  }, [startDate, endDate]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    totalDiscount?: number;
    byCampaign: DiscountByCampaign[];
    byStore: DiscountByStore[];
  }>({
    initialData: {
      totalDiscount: undefined,
      byCampaign: [],
      byStore: [],
    },
    load: loadData,
  });

  const { totalDiscount, byCampaign, byStore } = data;
  const hasData = byCampaign.length > 0 || byStore.length > 0;
  const campaignHasCurrency = byCampaign.some((item) => Boolean(item.currency));
  const storeHasCurrency = byStore.some((item) => Boolean(item.currency));

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
        title="Indirim Ozeti"
        description="Kampanya ve magaza bazli indirim analizi"
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
        isEmpty={!hasData}
        emptyMessage="Secilen tarih araliginda veri bulunamadi."
      >
        <>
          <ReportSummaryCards
            items={[{ label: "Toplam Indirim", value: formatPrice(totalDiscount) }]}
            gridClassName="sm:grid-cols-1"
          />

          {byCampaign.length > 0 && (
            <ReportTableSurface padded>
              <h2 className="mb-4 text-base font-semibold text-text">
                Kampanya Bazli
              </h2>
              <ReportTableScroll>
                <ReportTable>
                  <ReportTableHead>
                    <ReportTableHeadRow>
                      <ReportTableHeaderCell compact>Kampanya Kodu</ReportTableHeaderCell>
                      {campaignHasCurrency && <ReportTableHeaderCell compact>PB</ReportTableHeaderCell>}
                      <ReportTableHeaderCell compact>Toplam Indirim</ReportTableHeaderCell>
                      <ReportTableHeaderCell compact className="pr-0">Satis Adedi</ReportTableHeaderCell>
                    </ReportTableHeadRow>
                  </ReportTableHead>
                  <ReportTableBody divided>
                    {byCampaign.map((item, index) => (
                      <ReportTableRow key={index} className="text-text">
                        <ReportTableCell compact className="font-medium">
                          {item.campaignCode ?? "Kampanyasiz"}
                        </ReportTableCell>
                        {campaignHasCurrency && <ReportTableCell compact>{item.currency ?? "-"}</ReportTableCell>}
                        <ReportTableCell compact>{formatPrice(item.totalDiscount)}</ReportTableCell>
                        <ReportTableCell compact className="pr-0">{item.saleCount ?? 0}</ReportTableCell>
                      </ReportTableRow>
                    ))}
                  </ReportTableBody>
                </ReportTable>
              </ReportTableScroll>
            </ReportTableSurface>
          )}

          {byStore.length > 0 && (
            <ReportTableSurface padded>
              <h2 className="mb-4 text-base font-semibold text-text">
                Magaza Bazli
              </h2>
              <ReportTableScroll>
                <ReportTable>
                  <ReportTableHead>
                    <ReportTableHeadRow>
                      <ReportTableHeaderCell compact>Magaza</ReportTableHeaderCell>
                      {storeHasCurrency && <ReportTableHeaderCell compact>PB</ReportTableHeaderCell>}
                      <ReportTableHeaderCell compact>Toplam Indirim</ReportTableHeaderCell>
                      <ReportTableHeaderCell compact className="pr-0">Satis Adedi</ReportTableHeaderCell>
                    </ReportTableHeadRow>
                  </ReportTableHead>
                  <ReportTableBody divided>
                    {byStore.map((item, index) => (
                      <ReportTableRow key={index} className="text-text">
                        <ReportTableCell compact className="font-medium">
                          {item.storeName ?? "-"}
                        </ReportTableCell>
                        {storeHasCurrency && <ReportTableCell compact>{item.currency ?? "-"}</ReportTableCell>}
                        <ReportTableCell compact>{formatPrice(item.totalDiscount)}</ReportTableCell>
                        <ReportTableCell compact className="pr-0">{item.saleCount ?? 0}</ReportTableCell>
                      </ReportTableRow>
                    ))}
                  </ReportTableBody>
                </ReportTable>
              </ReportTableScroll>
            </ReportTableSurface>
          )}
        </>
      </ReportAsyncState>
    </div>
  );
}
