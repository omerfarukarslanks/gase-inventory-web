"use client";

import Button from "@/components/ui/Button";
import {
  type FieldErrors,
  type SaleLineForm,
  type VariantOption,
} from "@/components/sales/types";
import SaleDrawerLineCard from "@/components/sales/SaleDrawerLineCard";
import { useLang } from "@/context/LangContext";

type SaleDrawerLinesSectionProps = {
  loadingVariants: boolean;
  variantOptions: VariantOption[];
  variantFieldLabel: string;
  variantPlaceholder: string;
  loadingMoreVariants: boolean;
  variantHasMore: boolean;
  onLoadMoreVariants: () => void;
  lines: SaleLineForm[];
  onChangeLine: (rowId: string, patch: Partial<SaleLineForm>) => void;
  onApplyVariantPreset: (rowId: string, variantId: string) => void;
  onAddLine: () => void;
  onRemoveLine: (rowId: string) => void;
  errors: FieldErrors;
};

export default function SaleDrawerLinesSection({
  loadingVariants,
  variantOptions,
  variantFieldLabel,
  variantPlaceholder,
  loadingMoreVariants,
  variantHasMore,
  onLoadMoreVariants,
  lines,
  onChangeLine,
  onApplyVariantPreset,
  onAddLine,
  onRemoveLine,
  errors,
}: SaleDrawerLinesSectionProps) {
  const { t } = useLang();

  return (
    <section className="rounded-xl2 border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">{t("sales.linesSectionTitle")}</h2>
        <Button
          label={`+ ${t("sales.addLine")}`}
          onClick={onAddLine}
          variant="secondary"
          className="px-3 py-1.5"
        />
      </div>

      {loadingVariants ? (
        <p className="text-sm text-muted">{t("products.variantsLoading")}</p>
      ) : (
        <div className="space-y-3">
          {lines.map((line, index) => (
            <SaleDrawerLineCard
              key={line.rowId}
              index={index}
              line={line}
              canRemove={lines.length > 1}
              variantFieldLabel={variantFieldLabel}
              variantPlaceholder={variantPlaceholder}
              variantOptions={variantOptions}
              loadingVariants={loadingVariants}
              loadingMoreVariants={loadingMoreVariants}
              variantHasMore={variantHasMore}
              onLoadMoreVariants={onLoadMoreVariants}
              onChangeLine={onChangeLine}
              onApplyVariantPreset={onApplyVariantPreset}
              onRemoveLine={onRemoveLine}
            />
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-muted">{t("stock.lineTotalHint")}</p>
      {errors.lines && <p className="mt-2 text-xs text-error">{errors.lines}</p>}
    </section>
  );
}
