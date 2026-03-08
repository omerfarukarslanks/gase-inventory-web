"use client";

import { useCallback, useState } from "react";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportDateInput,
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
import { formatDate, formatPrice } from "@/lib/format";
import { getDefaultReportDateRange } from "@/lib/report-dates";
import { getReportTopCustomers, type TopCustomerItem } from "@/lib/reports";

const defaultDateRange = getDefaultReportDateRange();

export default function CustomersPage() {
  const [startDateInput, setStartDateInput] = useState(defaultDateRange.startDate);
  const [endDateInput, setEndDateInput] = useState(defaultDateRange.endDate);
  const [limitInput, setLimitInput] = useState("50");
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [limit, setLimit] = useState(50);

  const loadItems = useCallback(async () => {
    const res = await getReportTopCustomers({
      startDate,
      endDate,
      limit,
    });

    return res.data ?? [];
  }, [startDate, endDate, limit]);

  const {
    data: items,
    loading,
    error,
    refresh,
  } = useAsyncReportData<TopCustomerItem[]>({
    initialData: [],
    load: loadItems,
  });

  const hasCurrency = items.some((item) => Boolean(item.currency));

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
        title="Musteri Analizi"
        description="Secilen tarih araliginda en cok alisveris yapan musteriler"
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
            max={200}
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="w-20"
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
        emptyMessage="Secilen tarih araliginda musteri verisi bulunamadi."
      >
        <ReportTableSurface>
          <ReportTableScroll>
            <ReportTable>
              <ReportTableHead>
                <ReportTableHeadRow>
                  <ReportTableHeaderCell>Sira</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Musteri</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Telefon</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Email</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Siparis</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Onayli</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Iptal</ReportTableHeaderCell>
                  {hasCurrency && <ReportTableHeaderCell align="right">PB</ReportTableHeaderCell>}
                  <ReportTableHeaderCell align="right">Toplam Harcama</ReportTableHeaderCell>
                  <ReportTableHeaderCell align="right">Ort. Sepet</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Ilk Alis</ReportTableHeaderCell>
                  <ReportTableHeaderCell>Son Alis</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <ReportTableBody>
                {items.map((item, idx) => (
                  <ReportTableRow
                    key={item.phoneNumber ?? idx}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-primary/5"
                  >
                    <ReportTableCell className="font-medium text-text">
                      {item.rank ?? idx + 1}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {[item.name, item.surname].filter(Boolean).join(" ") || "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-text">
                      {item.phoneNumber ?? "-"}
                    </ReportTableCell>
                    <ReportTableCell className="text-muted">{item.email ?? "-"}</ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.totalOrders ?? 0}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.confirmedCount ?? 0}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {item.cancelledCount ?? 0}
                    </ReportTableCell>
                    {hasCurrency && (
                      <ReportTableCell align="right" className="text-text">
                        {item.currency ?? "-"}
                      </ReportTableCell>
                    )}
                    <ReportTableCell align="right" className="font-medium text-text">
                      {formatPrice(item.totalSpent)}
                    </ReportTableCell>
                    <ReportTableCell align="right" className="text-text">
                      {formatPrice(item.averageBasket)}
                    </ReportTableCell>
                    <ReportTableCell className="text-muted">
                      {formatDate(item.firstPurchase)}
                    </ReportTableCell>
                    <ReportTableCell className="text-muted">
                      {formatDate(item.lastPurchase)}
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
