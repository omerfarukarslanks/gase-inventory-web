"use client";

import { Fragment, useCallback, useState } from "react";
import { getReportStockSummary, type StockSummaryProduct } from "@/lib/reports";
import ReportAsyncState from "@/components/reports/ReportAsyncState";
import {
  ReportFilterButton,
  ReportFilterField,
  ReportFilters,
  ReportTextInput,
} from "@/components/reports/ReportFilters";
import ReportPageHeader from "@/components/reports/ReportPageHeader";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import {
  ReportTable,
  ReportTableHead,
  ReportTableHeaderCell,
  ReportTableHeadRow,
  ReportTableScroll,
  ReportTableSurface,
} from "@/components/reports/ReportTable";
import { useAsyncReportData } from "@/hooks/useAsyncReportData";
import { formatReportNumber } from "@/lib/report-format";

export default function StockSummaryPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    const res = await getReportStockSummary({ limit: 50, search: search || undefined });
    return {
      items: res.data ?? [],
      totalQuantity: res.totalQuantity ?? 0,
    };
  }, [search]);

  const {
    data: reportData,
    loading,
    error,
    refresh,
  } = useAsyncReportData<{
    items: StockSummaryProduct[];
    totalQuantity: number;
  }>({
    initialData: {
      items: [],
      totalQuantity: 0,
    },
    load: loadData,
  });

  const { items: data, totalQuantity } = reportData;

  const toggleProduct = (id: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVariant = (id: string) => {
    setExpandedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFilter = () => {
    if (searchInput === search) {
      void refresh();
      return;
    }

    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Stok Ozeti"
        description="Urun-varyant-magaza bazli stok durumu"
      />

      <ReportFilters className="p-6 shadow-glow">
        <ReportFilterField label="Arama" className="flex-1">
          <ReportTextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            placeholder="Urun adi ile ara..."
            className="w-full"
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
            { label: "Toplam Stok Miktari", value: formatReportNumber(totalQuantity, { fallback: "0" }), className: "p-6 shadow-glow" },
          ]}
          gridClassName="sm:grid-cols-1"
          labelClassName="text-sm normal-case tracking-normal"
        />
      )}

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
                  <ReportTableHeaderCell compact />
                  <ReportTableHeaderCell compact>Urun Adi</ReportTableHeaderCell>
                  <ReportTableHeaderCell compact align="right">Toplam Miktar</ReportTableHeaderCell>
                </ReportTableHeadRow>
              </ReportTableHead>
              <tbody>
                {data.map((product) => {
                  const productKey = product.productId ?? product.productName ?? "";
                  const isProductExpanded = expandedProducts.has(productKey);
                  return (
                    <Fragment key={productKey}>
                      <tr
                        className="cursor-pointer border-b border-border/50 transition-colors hover:bg-primary/5"
                        onClick={() => toggleProduct(productKey)}
                      >
                        <td className="py-3 pr-4 text-muted">{isProductExpanded ? "▼" : "▶"}</td>
                        <td className="py-3 pr-4 font-medium text-text">{product.productName ?? "-"}</td>
                        <td className="py-3 pr-4 text-right text-text">{product.totalQuantity ?? 0}</td>
                      </tr>
                      {isProductExpanded &&
                        (product.variants ?? []).map((variant) => {
                          const variantKey = variant.productVariantId ?? variant.variantCode ?? "";
                          const isVariantExpanded = expandedVariants.has(variantKey);
                          return (
                            <Fragment key={variantKey}>
                              <tr
                                className="cursor-pointer border-b border-border/30 bg-surface2/50 transition-colors hover:bg-primary/5"
                                onClick={() => toggleVariant(variantKey)}
                              >
                                <td className="py-2 pl-6 pr-4 text-muted">{isVariantExpanded ? "▽" : "▷"}</td>
                                <td className="py-2 pr-4">
                                  <span className="text-text">{variant.variantName ?? "-"}</span>
                                  {variant.variantCode && (
                                    <span className="ml-2 text-xs text-muted">({variant.variantCode})</span>
                                  )}
                                </td>
                                <td className="py-2 pr-4 text-right text-text">{variant.totalQuantity ?? 0}</td>
                              </tr>
                              {isVariantExpanded &&
                                (variant.stores ?? []).map((store) => (
                                  <tr
                                    key={store.storeId ?? store.storeName}
                                    className="border-b border-border/20 bg-surface2/80"
                                  >
                                    <td className="py-2 pl-12 pr-4" />
                                    <td className="py-2 pr-4 text-muted">{store.storeName ?? "-"}</td>
                                    <td className="py-2 pr-4 text-right text-text">{store.quantity ?? store.totalQuantity ?? 0}</td>
                                  </tr>
                                ))}
                            </Fragment>
                          );
                        })}
                    </Fragment>
                  );
                })}
              </tbody>
            </ReportTable>
          </ReportTableScroll>
        </ReportTableSurface>
      </ReportAsyncState>
    </div>
  );
}
