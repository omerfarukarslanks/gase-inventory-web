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
import { getReportLowStock, type LowStockItem } from "@/lib/reports";

export default function LowStockPage() {
  const [thresholdInput, setThresholdInput] = useState("50");
  const [threshold, setThreshold] = useState(50);

  const loadItems = useCallback(async () => {
    const res = await getReportLowStock({ threshold, limit: 50 });
    return res.data ?? [];
  }, [threshold]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<LowStockItem[]>({
    initialData: [],
    load: loadItems,
  });

  const handleFilter = () => {
    const parsed = Number.parseInt(thresholdInput, 10);
    const nextThreshold = Number.isNaN(parsed) || parsed <= 0 ? threshold : parsed;

    if (nextThreshold === threshold) {
      void refresh();
      return;
    }

    setThreshold(nextThreshold);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Dusuk Stok"
        description="Esik degerinin altindaki stoklar"
      />

      <ReportFilters className="p-6 shadow-glow">
        <ReportFilterField label="Esik Degeri">
          <ReportNumberInput
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.target.value)}
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
                  <ReportTableHeaderCell compact>Magaza</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Miktar</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Durum</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {data.map((item, index) => (
                  <ReportTableRow
                    key={`${item.productVariantId}-${item.storeId}-${index}`}
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
                    <ReportTableCell compact className="text-text">
                      {item.storeName ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact align="right" className="font-medium text-text">
                      {item.quantity ?? 0}
                    </ReportTableCell>
                    <ReportTableCell compact>
                      <ReportBadge tone={item.isActive ? "success" : "danger"}>
                        {item.isActive ? "Aktif" : "Pasif"}
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
