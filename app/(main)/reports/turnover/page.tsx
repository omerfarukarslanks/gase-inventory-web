"use client";

import { useCallback, useState } from "react";
import { getReportTurnover, type TurnoverItem } from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
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
import ReportBadge from "@/components/reports/ReportBadge";
import {
  formatReportDays,
  formatReportDecimal,
} from "@/lib/report-format";

export default function TurnoverPage() {
  const [periodDaysInput, setPeriodDaysInput] = useState("30");
  const [periodDays, setPeriodDays] = useState(30);

  const loadItems = useCallback(async () => {
    const res = await getReportTurnover({ periodDays, limit: 50 });
    return res.data ?? [];
  }, [periodDays]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<TurnoverItem[]>({
    initialData: [],
    load: loadItems,
  });

  const handleFilter = () => {
    const parsed = Number.parseInt(periodDaysInput, 10);
    const nextPeriodDays = Number.isNaN(parsed) || parsed <= 0 ? periodDays : parsed;

    if (nextPeriodDays === periodDays) {
      void refresh();
      return;
    }

    setPeriodDays(nextPeriodDays);
  };

  const classificationTone = (classification?: string) => {
    switch (classification) {
      case "FAST":
        return "success";
      case "MEDIUM":
        return "warning";
      case "SLOW":
        return "warning";
      case "DEAD":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Stok Devir Hizi"
        description="Urun bazli devir hizi analizi"
      />

      <ReportFilters className="p-6 shadow-glow">
        <ReportFilterField label="Donem (gun)">
          <ReportNumberInput
            value={periodDaysInput}
            onChange={(e) => setPeriodDaysInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            min={1}
            className="w-32"
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
        isEmpty={data.length === 0}
        emptyMessage="Gosterilecek veri bulunamadi."
      >
        <ReportTableSurface padded>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell compact>Urun</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Varyant</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Kod</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Mevcut Stok</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Satilan</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Gunluk Ort.</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Devir Hizi</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Yeterlilik</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Sinif</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {data.map((item, i) => (
                  <ReportTableRow
                    key={`${item.productVariantId}-${i}`}
                    className="border-b border-border/50 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell compact className="font-medium text-text">{item.productName ?? "-"}</ReportTableCell>
                    <ReportTableCell compact className="text-text">{item.variantName ?? "-"}</ReportTableCell>
                    <ReportTableCell compact className="text-muted">{item.variantCode ?? "-"}</ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">{item.currentStock ?? 0}</ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">{item.soldQuantity ?? 0}</ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">{formatReportDecimal(item.dailyAvgSales)}</ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">{formatReportDecimal(item.turnoverRate)}</ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">{formatReportDays(item.supplyDays)}</ReportTableCell>
                    <ReportTableCell compact>
                      <ReportBadge tone={classificationTone(item.classification)}>
                        {item.classification ?? "-"}
                      </ReportBadge>
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
