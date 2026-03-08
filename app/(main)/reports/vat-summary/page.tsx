"use client";

import { useCallback, useMemo, useState } from "react";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
  ReportMonthInput,
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
import { getCurrentMonthValue } from "@/lib/report-dates";
import {
  getReportVatSummary,
  type VatSummaryItem,
  type VatSummaryResponse,
} from "@/lib/reports";

const currentMonth = getCurrentMonthValue();

export default function VatSummaryPage() {
  const [monthInput, setMonthInput] = useState(currentMonth);
  const [month, setMonth] = useState(currentMonth);

  const loadData = useCallback(async () => {
    const res = await getReportVatSummary({ month });
    return {
      items: res.data ?? [],
      totals: res.totals,
    };
  }, [month]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: VatSummaryItem[];
    totals: VatSummaryResponse["totals"];
  }>({
    initialData: {
      items: [],
      totals: undefined,
    },
    load: loadData,
  });

  const { items, totals } = data;
  const hasCurrency = items.some((item) => Boolean(item.currency));

  const summaryCards = useMemo(
    () => [
      { label: "Net Satis", value: formatPrice(totals?.netSales) },
      { label: "KDV Tutari", value: formatPrice(totals?.taxAmount) },
      { label: "Brut Toplam", value: formatPrice(totals?.grossTotal) },
    ],
    [totals],
  );

  const handleFilter = () => {
    if (monthInput === month) {
      void refresh();
      return;
    }

    setMonth(monthInput);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="KDV Ozeti"
        description="Aylik KDV orani bazli vergi ozeti"
      />

      <ReportFilters>
        <ReportFilterField label="Ay">
          <ReportMonthInput
            value={monthInput}
            onChange={(e) => setMonthInput(e.target.value)}
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
        emptyMessage="Secilen donemde veri bulunamadi."
      >
        <>
          <ReportSummaryCards
            items={summaryCards}
            gridClassName="sm:grid-cols-3"
          />

          <ReportTableSurface padded>
            <ReportTableScroll>
              <ReportTable>
                <ReportTableHead>
                  <ReportTableHeadRow>
                    <ReportTableHeaderCell compact>KDV Orani</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Islem Sayisi</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>Iptal Sayisi</ReportTableHeaderCell>
                    {hasCurrency && <ReportTableHeaderCell compact>PB</ReportTableHeaderCell>}
                    <ReportTableHeaderCell compact>Net Satis</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact>KDV Tutari</ReportTableHeaderCell>
                    <ReportTableHeaderCell compact className="pr-0">Brut Toplam</ReportTableHeaderCell>
                  </ReportTableHeadRow>
                </ReportTableHead>
                <ReportTableBody divided>
                  {items.map((item, idx) => (
                    <ReportTableRow key={idx} className="text-text">
                      <ReportTableCell compact className="font-medium">
                        {item.taxRate != null ? `%${item.taxRate}` : "-"}
                      </ReportTableCell>
                      <ReportTableCell compact>{item.transactionCount ?? 0}</ReportTableCell>
                      <ReportTableCell compact>{item.cancelledCount ?? 0}</ReportTableCell>
                      {hasCurrency && <ReportTableCell compact>{item.currency ?? "-"}</ReportTableCell>}
                      <ReportTableCell compact>{formatPrice(item.netSales)}</ReportTableCell>
                      <ReportTableCell compact>{formatPrice(item.taxAmount)}</ReportTableCell>
                      <ReportTableCell compact className="pr-0">{formatPrice(item.grossTotal)}</ReportTableCell>
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
