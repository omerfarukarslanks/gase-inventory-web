"use client";

import type { Currency } from "@/lib/products";
import type { InventoryVariantStockItem } from "@/lib/inventory";
import FormField from "@/components/ui/FormField";
import ProductInventoryNumberInput from "@/components/stock/ProductInventoryNumberInput";
import {
  ProductInventoryMetaFields,
  ProductInventoryReceivePricingFields,
  ProductInventoryStoreField,
  ProductInventoryTransferFields,
} from "@/components/stock/ProductInventorySharedFields";

export type ProductInventoryMultiVariantSectionProps = {
  operation: "receive" | "adjust" | "transfer";
  variants: InventoryVariantStockItem[];
  storeOptions: Array<{ value: string; label: string }>;
  toStoreOptions: Array<{ value: string; label: string }>;
  storeId: string;
  onStoreIdChange: (value: string) => void;
  fromStoreId: string;
  onFromStoreIdChange: (value: string) => void;
  toStoreId: string;
  onToStoreIdChange: (value: string) => void;
  unitPrice: string;
  onUnitPriceChange: (value: string) => void;
  currency: Currency;
  onCurrencyChange: (value: Currency) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  variantQtys: Record<string, string>;
  onVariantQtyChange: (variantId: string, value: string) => void;
  variantNewQtys: Record<string, string>;
  onVariantNewQtyChange: (variantId: string, value: string) => void;
  t: (key: string) => string;
};

export default function ProductInventoryMultiVariantSection({
  operation,
  variants,
  storeOptions,
  toStoreOptions,
  storeId,
  onStoreIdChange,
  fromStoreId,
  onFromStoreIdChange,
  toStoreId,
  onToStoreIdChange,
  unitPrice,
  onUnitPriceChange,
  currency,
  onCurrencyChange,
  reason,
  onReasonChange,
  note,
  onNoteChange,
  variantQtys,
  onVariantQtyChange,
  variantNewQtys,
  onVariantNewQtyChange,
  t,
}: ProductInventoryMultiVariantSectionProps) {
  return (
    <div className="space-y-3">
      {operation === "transfer" && (
        <ProductInventoryTransferFields
          storeOptions={storeOptions}
          toStoreOptions={toStoreOptions}
          fromStoreId={fromStoreId}
          onFromStoreIdChange={onFromStoreIdChange}
          toStoreId={toStoreId}
          onToStoreIdChange={onToStoreIdChange}
          t={t}
        />
      )}

      {operation === "receive" && (
        <ProductInventoryReceivePricingFields
          unitPrice={unitPrice}
          onUnitPriceChange={onUnitPriceChange}
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          t={t}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-[1fr_auto] border-b border-border bg-surface2/70 px-3 py-2 text-[11px] uppercase tracking-wide text-muted">
          <div>{t("stock.variant")}</div>
          <div className="text-right">{operation === "adjust" ? t("stock.newQuantity") : t("stock.quantity")}</div>
        </div>
        <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
          {variants.map((variant) => (
            <div key={variant.productVariantId} className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2">
              <div>
                <div className="text-xs font-medium text-text">{variant.variantName}</div>
                {variant.variantCode && <div className="text-[11px] text-muted">{variant.variantCode}</div>}
              </div>
              <div className="w-28">
                {operation === "adjust" ? (
                  <ProductInventoryNumberInput
                    value={variantNewQtys[variant.productVariantId] ?? ""}
                    onChange={(value) => onVariantNewQtyChange(variant.productVariantId, value)}
                    placeholder="0"
                    min={0}
                  />
                ) : (
                  <ProductInventoryNumberInput
                    value={variantQtys[variant.productVariantId] ?? ""}
                    onChange={(value) => onVariantQtyChange(variant.productVariantId, value)}
                    placeholder="0"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {operation !== "transfer" && (
        <ProductInventoryStoreField
          label={t("common.storeFilter")}
          storeOptions={storeOptions}
          storeId={storeId}
          onStoreIdChange={onStoreIdChange}
          showEmptyOption
          t={t}
        />
      )}

      <ProductInventoryMetaFields
        reason={reason}
        onReasonChange={onReasonChange}
        note={note}
        onNoteChange={onNoteChange}
        t={t}
      />
    </div>
  );
}
