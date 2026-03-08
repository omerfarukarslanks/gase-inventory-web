"use client";

import { formatPrice } from "@/lib/format";
import type { SaleDetailLine } from "@/lib/sales";
import {
  formatSaleLinePercentOrAmount,
  getSaleDetailLineCode,
  getSaleDetailLineProductLabel,
  getSaleDetailLineVariantLabel,
} from "@/components/sales/display";

type TranslateFn = (key: string) => string;

type SaleDetailLinesTableProps = {
  lines: SaleDetailLine[];
  t: TranslateFn;
};

export default function SaleDetailLinesTable({ lines, t }: SaleDetailLinesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[960px]">
        <thead className="border-b border-border bg-surface2/70">
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3">{t("stock.product")}</th>
            <th className="px-4 py-3">{t("stock.variant")}</th>
            <th className="px-4 py-3">{t("sales.codeLabel")}</th>
            <th className="px-4 py-3 text-right">{t("stock.quantity")}</th>
            <th className="px-4 py-3">{t("sales.currency")}</th>
            <th className="px-4 py-3 text-right">{t("products.salePrice")}</th>
            <th className="px-4 py-3 text-right">{t("products.tax")}</th>
            <th className="px-4 py-3 text-right">{t("products.discount")}</th>
            <th className="px-4 py-3 text-right">{t("stock.lineTotal")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-sm text-muted" colSpan={9}>
                {t("sales.noProductLines")}
              </td>
            </tr>
          ) : (
            lines.map((line) => (
              <tr key={line.id} className="border-b border-border text-sm text-text2">
                <td className="px-4 py-3">{getSaleDetailLineProductLabel(line)}</td>
                <td className="px-4 py-3">{getSaleDetailLineVariantLabel(line)}</td>
                <td className="px-4 py-3">{getSaleDetailLineCode(line)}</td>
                <td className="px-4 py-3 text-right">{line.quantity ?? "-"}</td>
                <td className="px-4 py-3">{line.currency ?? "-"}</td>
                <td className="px-4 py-3 text-right">{formatPrice(line.unitPrice)}</td>
                <td className="px-4 py-3 text-right">
                  {formatSaleLinePercentOrAmount(line.taxPercent, line.taxAmount)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatSaleLinePercentOrAmount(line.discountPercent, line.discountAmount)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-text">
                  {formatPrice(line.lineTotal)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
