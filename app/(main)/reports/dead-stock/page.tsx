"use client";

import { useCallback, useState } from "react";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
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
import { formatDate, formatPrice } from "@/lib/format";
import { formatReportNumber } from "@/lib/report-format";
import { getReportDeadStock, type DeadStockItem } from "@/lib/reports";

export default function DeadStockPage() {
  const [noSaleDaysInput, setNoSaleDaysInput] = useState("90");
  const [noSaleDays, setNoSaleDays] = useState(90);

  const loadData = useCallback(async () => {
    const res = await getReportDeadStock({ noSaleDays, limit: 50 });
    return {
      items: res.data ?? [],
      itemCount: res.totals?.itemCount ?? 0,
      totalEstimatedValue: res.totals?.totalEstimatedValue ?? 0,
    };
  }, [noSaleDays]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: DeadStockItem[];
    itemCount: number;
    totalEstimatedValue: number;
  }>({
    initialData: {
      items: [],
      itemCount: 0,
      totalEstimatedValue: 0,
    },
    load: loadData,
  });

  const { items, itemCount, totalEstimatedValue } = data;
  const hasCurrency = items.some((item) => Boolean(item.currency));

  const handleFilter = () => {
    const parsed = Number.parseInt(noSaleDaysInput, 10);
    const nextNoSaleDays = Number.isNaN(parsed) || parsed <= 0 ? noSaleDays : parsed;

    if (nextNoSaleDays === noSaleDays) {
      void refresh();
      return;
    }

    setNoSaleDays(nextNoSaleDays);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Olu Stok"
        description="Uzun suredir satilmayan urunler"
      />

      <ReportFilters className="p-6 shadow-glow">
        <ReportFilterField label="Satilmayan Gun Sayisi">
          <ReportNumberInput
            value={noSaleDaysInput}
            onChange={(e) => setNoSaleDaysInput(e.target.value)}
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

      {!loading && !error && (
        <ReportSummaryCards
          items={[
            { label: "Urun Sayisi", value: formatReportNumber(itemCount, { fallback: "0" }), className: "p-6 shadow-glow" },
            { label: "Toplam Tahmini Deger", value: formatPrice(totalEstimatedValue), className: "p-6 shadow-glow" },
          ]}
          valueClassName="text-2xl"
        />
      )}

      <ReportAsyncState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
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
                  <ReportTableHeaderCell compact>Son Satis</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Satilmayan Gun</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell compact align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell compact align="right">Tahmini Deger</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, index) => (
                  <ReportTableRow
                    key={`${item.productVariantId}-${index}`}
                    className="border-b border-border/50 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell compact className="font-medium text-text">
                      {item.productName ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact className="text-text">
                      {item.variantName ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact className="text-muted">
                      {item.variantCode ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">
                      {item.currentStock ?? 0}
                    </ReportTableCell>
                    <ReportTableCell compact className="text-muted">
                      {formatDate(item.lastSaleDate)}
                    </ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">
                      {item.noSaleDays ?? 0}
                    </ReportTableCell>
                    {hasCurrency && (
                      <ReportTableCell compact align="right" className="text-text">
                        {item.currency ?? "-"}
                      </ReportTableCell>
                    )}
                    <ReportTableCell compact align="right" className="font-medium text-text">
                      {formatPrice(item.estimatedValue)}
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
