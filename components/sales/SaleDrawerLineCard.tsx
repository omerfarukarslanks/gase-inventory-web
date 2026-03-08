"use client";

import FormField from "@/components/ui/FormField";
import ModeToggle from "@/components/ui/ModeToggle";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import VariantInfiniteDropdown from "@/components/sales/VariantInfiniteDropdown";
import { CURRENCY_OPTIONS } from "@/components/products/types";
import { calcLineTotal, type SaleLineForm, type VariantOption } from "@/components/sales/types";
import { useLang } from "@/context/LangContext";
import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/products";

type SaleDrawerLineCardProps = {
  index: number;
  line: SaleLineForm;
  canRemove: boolean;
  variantFieldLabel: string;
  variantPlaceholder: string;
  variantOptions: VariantOption[];
  loadingVariants: boolean;
  loadingMoreVariants: boolean;
  variantHasMore: boolean;
  onLoadMoreVariants: () => void;
  onChangeLine: (rowId: string, patch: Partial<SaleLineForm>) => void;
  onApplyVariantPreset: (rowId: string, variantId: string) => void;
  onRemoveLine: (rowId: string) => void;
};

const inputClassName =
  "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export default function SaleDrawerLineCard({
  index,
  line,
  canRemove,
  variantFieldLabel,
  variantPlaceholder,
  variantOptions,
  loadingVariants,
  loadingMoreVariants,
  variantHasMore,
  onLoadMoreVariants,
  onChangeLine,
  onApplyVariantPreset,
  onRemoveLine,
}: SaleDrawerLineCardProps) {
  const { t } = useLang();

  const patchLine = (patch: Partial<SaleLineForm>) => onChangeLine(line.rowId, patch);

  return (
    <div className="rounded-xl border border-border bg-surface2/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          {t("sales.lineLabel")} #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemoveLine(line.rowId)}
          disabled={!canRemove}
          className="cursor-pointer text-xs text-error transition-colors hover:text-error/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("sales.removeLine")}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <FormField label={variantFieldLabel} className="lg:col-span-2">
          <VariantInfiniteDropdown
            options={variantOptions}
            value={line.productVariantId}
            onChange={(value) => onApplyVariantPreset(line.rowId, value)}
            placeholder={variantPlaceholder}
            loading={loadingVariants}
            loadingMore={loadingMoreVariants}
            hasMore={variantHasMore}
            onLoadMore={onLoadMoreVariants}
          />
        </FormField>

        <FormField label={`${t("stock.quantity")} *`}>
          <input
            type="number"
            min={1}
            value={line.quantity}
            onChange={(event) => patchLine({ quantity: event.target.value })}
            className={inputClassName}
          />
        </FormField>

        <FormField label={`${t("sales.currency")} *`}>
          <SearchableDropdown
            options={CURRENCY_OPTIONS}
            value={line.currency}
            onChange={(value) => patchLine({ currency: (value || "TRY") as Currency })}
            showEmptyOption={false}
            allowClear={false}
          />
        </FormField>

        <FormField label={`${t("products.salePrice")} *`}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={line.unitPrice}
            onChange={(event) => patchLine({ unitPrice: event.target.value })}
            className={inputClassName}
          />
        </FormField>

        <FormField label={t("products.discount")}>
          <div className="flex items-center gap-2">
            <ModeToggle
              mode={line.discountMode}
              onToggle={(mode) =>
                patchLine({
                  discountMode: mode,
                  discountPercent: "",
                  discountAmount: "",
                })
              }
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={line.discountMode === "percent" ? line.discountPercent : line.discountAmount}
              onChange={(event) =>
                patchLine(
                  line.discountMode === "percent"
                    ? { discountPercent: event.target.value }
                    : { discountAmount: event.target.value },
                )
              }
              className={inputClassName}
            />
          </div>
        </FormField>

        <FormField label={t("products.tax")}>
          <div className="flex items-center gap-2">
            <ModeToggle
              mode={line.taxMode}
              onToggle={(mode) =>
                patchLine({
                  taxMode: mode,
                  taxPercent: "",
                  taxAmount: "",
                })
              }
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={line.taxMode === "percent" ? line.taxPercent : line.taxAmount}
              onChange={(event) =>
                patchLine(
                  line.taxMode === "percent"
                    ? { taxPercent: event.target.value }
                    : { taxAmount: event.target.value },
                )
              }
              className={inputClassName}
            />
          </div>
        </FormField>

        <FormField label={t("stock.lineTotal")}>
          <div className="flex h-10 items-center rounded-xl border border-border bg-surface px-3 text-sm text-text2">
            {formatPrice(calcLineTotal(line))}
          </div>
        </FormField>
      </div>
    </div>
  );
}
