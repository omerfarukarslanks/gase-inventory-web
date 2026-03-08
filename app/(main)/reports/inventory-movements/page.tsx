"use client";

import { useCallback, useState } from "react";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import ReportBadge from "@/components/reports/ReportBadge";
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
import { formatDate, formatPrice } from "@/lib/format";
import { getDefaultReportDateRange } from "@/lib/report-dates";
import { formatReportNumber } from "@/lib/report-format";
import {
  getReportMovements,
  type MovementItem,
  type MovementSummaryByType,
} from "@/lib/reports";

function getMovementTypeLabel(type?: string | null) {
  if (type === "ADJUSTMENT") return "Duzeltme";
  if (type === "TRANSFER_OUT") return "Transfer Cikis";
  if (type === "TRANSFER_IN") return "Transfer Giris";
  if (type === "OUT") return "Cikis";
  if (type === "IN") return "Giris";
  return type ?? "-";
}

const defaultDateRange = getDefaultReportDateRange();

export default function InventoryMovementsPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  const loadData = useCallback(async () => {
    const res = await getReportMovements({ startDate, endDate, limit: 50 });
    return {
      items: res.data ?? [],
      summaryByType: res.summaryByType ?? [],
      totals: res.totals ?? {},
    };
  }, [startDate, endDate]);

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: MovementItem[];
    summaryByType: MovementSummaryByType[];
    totals: { movementCount?: number; netQuantity?: number };
  }>({
    initialData: {
      items: [],
      summaryByType: [],
      totals: {},
    },
    load: loadData,
  });

  const { items, summaryByType, totals } = data;
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
        title="Stok Hareketleri"
        description="Giris/cikis hareket ozeti"
      />

      <ReportFilters className="p-6 shadow-glow">
        <ReportFilterField label="Baslangic Tarihi">
          <ReportDateInput
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
          />
        </ReportFilterField>
        <ReportFilterField label="Bitis Tarihi">
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

      {!loading && !error && (
        <div className="space-y-4">
          <ReportSummaryCards
            items={[
              { label: "Toplam Hareket", value: formatReportNumber(totals.movementCount, { fallback: "0" }), className: "p-6 shadow-glow" },
              { label: "Net Miktar", value: formatReportNumber(totals.netQuantity, { fallback: "0" }), className: "p-6 shadow-glow" },
            ]}
          />
          {summaryByType.length > 0 && (
            <ReportSummaryCards
              items={summaryByType.map((item) => ({
                label: getMovementTypeLabel(item.type),
                value: `${formatReportNumber(item.movementCount, { fallback: "0" })} hareket`,
                description: `Toplam: ${formatReportNumber(item.totalQuantity, { fallback: "0" })} adet`,
                className: "p-4 shadow-glow",
              }))}
              gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              valueClassName="mt-1 text-lg"
            />
          )}
        </div>
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
                  <ReportTableHeaderCell compact>Tarih</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Tip</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Urun</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Varyant</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact>Magaza</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Miktar</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell compact align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell compact align="right">Birim Fiyat</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Toplam</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, index) => (
                  <ReportTableRow
                    key={item.id ?? index}
                    className="border-b border-border/50 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell compact className="text-muted">
                      {formatDate(item.createdAt)}
                    </ReportTableCell>
                    <ReportTableCell compact>
                      <ReportBadge>
                        {getMovementTypeLabel(item.type)}
                      </ReportBadge>
                    </ReportTableCell>
                    <ReportTableCell compact className="font-medium text-text">
                      {item.product?.name ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact className="text-text">
                      {item.productVariant?.name ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact className="text-text">
                      {item.store?.name ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell compact align="right" className="text-text">
                      {item.quantity ?? 0}
                    </ReportTableCell>
                    {hasCurrency && (
                      <ReportTableCell compact align="right" className="text-text">
                        {item.currency ?? "-"}
                      </ReportTableCell>
                    )}
                    <ReportTableCell compact align="right" className="text-text">
                      {formatPrice(item.unitPrice)}
                    </ReportTableCell>
                    <ReportTableCell compact align="right" className="font-medium text-text">
                      {formatPrice(item.lineTotal)}
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
