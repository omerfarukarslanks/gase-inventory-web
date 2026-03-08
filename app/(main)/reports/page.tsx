"use client";

import ReportPageHeader from "@/components/reports/ReportPageHeader";
import { ReportCatalogSection } from "@/components/reports/ReportCatalog";
import { useLang } from "@/context/LangContext";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";

export default function ReportsPage() {
  const { t } = useLang();
  const canReadPage = usePermissionGuard(
    [
      "REPORT_SALES_READ",
      "REPORT_STOCK_READ",
      "REPORT_FINANCIAL_READ",
      "REPORT_EMPLOYEE_READ",
      "REPORT_CUSTOMER_READ",
      "REPORT_INVENTORY_READ",
    ],
    { mode: "any" },
  );

  if (!canReadPage) return null;

  const reportCategories = [
    {
      title: t("reports.salesTitle"),
      items: [
        { href: "/reports/sales-summary", label: t("reports.salesSummary"), desc: t("reports.salesSummaryDesc") },
        { href: "/reports/cancellations", label: t("reports.cancellations"), desc: t("reports.cancellationsDesc") },
        { href: "/reports/product-performance", label: t("reports.productPerformance"), desc: t("reports.productPerformanceDesc") },
        { href: "/reports/supplier-performance", label: t("reports.supplierPerformance"), desc: t("reports.supplierPerformanceDesc") },
      ],
    },
    {
      title: t("reports.stockTitle"),
      items: [
        { href: "/reports/stock-summary", label: t("reports.stockSummary"), desc: t("reports.stockSummaryDesc") },
        { href: "/reports/low-stock", label: t("reports.lowStock"), desc: t("reports.lowStockDesc") },
        { href: "/reports/dead-stock", label: t("reports.deadStock"), desc: t("reports.deadStockDesc") },
        { href: "/reports/inventory-movements", label: t("reports.inventoryMovements"), desc: t("reports.inventoryMovementsDesc") },
        { href: "/reports/turnover", label: t("reports.turnover"), desc: t("reports.turnoverDesc") },
      ],
    },
    {
      title: t("reports.financialTitle"),
      items: [
        { href: "/reports/revenue-trend", label: t("reports.revenueTrend"), desc: t("reports.revenueTrendDesc") },
        { href: "/reports/profit-margin", label: t("reports.profitMargin"), desc: t("reports.profitMarginDesc") },
        { href: "/reports/discount-summary", label: t("reports.discountSummary"), desc: t("reports.discountSummaryDesc") },
        { href: "/reports/vat-summary", label: t("reports.vatSummary"), desc: t("reports.vatSummaryDesc") },
      ],
    },
    {
      title: t("reports.storeAndEmployee"),
      items: [
        { href: "/reports/store-performance", label: t("reports.storePerformance"), desc: t("reports.storePerformanceDesc") },
        { href: "/reports/employee-performance", label: t("reports.employeePerformance"), desc: t("reports.employeePerformanceDesc") },
      ],
    },
    {
      title: t("reports.customerTitle"),
      items: [{ href: "/reports/customers", label: t("reports.customerAnalysis"), desc: t("reports.customerAnalysisDesc") }],
    },
  ];

  return (
    <div className="space-y-6">
      <ReportPageHeader
        title={t("reports.title")}
        description={t("reports.subtitle")}
      />

      {reportCategories.map((category) => (
        <ReportCatalogSection
          key={category.title}
          title={category.title}
          items={category.items.map((item) => ({
            href: item.href,
            label: item.label,
            description: item.desc,
          }))}
        />
      ))}
    </div>
  );
}
