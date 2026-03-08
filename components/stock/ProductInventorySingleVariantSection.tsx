"use client";

import type { Currency } from "@/lib/products";
import FormField from "@/components/ui/FormField";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ProductInventoryNumberInput from "@/components/stock/ProductInventoryNumberInput";
import {
  ProductInventoryMetaFields,
  ProductInventoryReceivePricingFields,
  ProductInventoryStoreField,
  ProductInventoryTransferFields,
} from "@/components/stock/ProductInventorySharedFields";

export type ProductInventorySingleVariantSectionProps = {
  operation: "receive" | "adjust" | "transfer";
  canTenantOnly: boolean;
  submitting: boolean;
  storeOptions: Array<{ value: string; label: string }>;
  toStoreOptions: Array<{ value: string; label: string }>;
  storeId: string;
  onStoreIdChange: (value: string) => void;
  fromStoreId: string;
  onFromStoreIdChange: (value: string) => void;
  toStoreId: string;
  onToStoreIdChange: (value: string) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  newQuantity: string;
  onNewQuantityChange: (value: string) => void;
  unitPrice: string;
  onUnitPriceChange: (value: string) => void;
  currency: Currency;
  onCurrencyChange: (value: Currency) => void;
  applyToAllStores: boolean;
  onApplyToAllStoresChange: (checked: boolean) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  t: (key: string) => string;
};

export default function ProductInventorySingleVariantSection({
  operation,
  canTenantOnly,
  submitting,
  storeOptions,
  toStoreOptions,
  storeId,
  onStoreIdChange,
  fromStoreId,
  onFromStoreIdChange,
  toStoreId,
  onToStoreIdChange,
  quantity,
  onQuantityChange,
  newQuantity,
  onNewQuantityChange,
  unitPrice,
  onUnitPriceChange,
  currency,
  onCurrencyChange,
  applyToAllStores,
  onApplyToAllStoresChange,
  reason,
  onReasonChange,
  note,
  onNoteChange,
  t,
}: ProductInventorySingleVariantSectionProps) {
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

      {operation !== "transfer" && canTenantOnly && (
        <>
          {operation === "adjust" && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface2/40 px-3 py-2.5">
              <span className="text-xs font-semibold text-muted">{t("stock.applyToAllStores")}</span>
              <ToggleSwitch
                checked={applyToAllStores}
                onChange={onApplyToAllStoresChange}
                disabled={submitting}
              />
            </div>
          )}
          {!applyToAllStores && (
            <ProductInventoryStoreField
              label={operation === "receive" ? `${t("common.storeFilter")} *` : t("common.storeFilter")}
              storeOptions={storeOptions}
              storeId={storeId}
              onStoreIdChange={onStoreIdChange}
              showEmptyOption={operation === "adjust"}
              t={t}
            />
          )}
        </>
      )}

      {operation !== "adjust" && (
        <FormField label={`${t("stock.quantity")} *`}>
          <ProductInventoryNumberInput value={quantity} onChange={onQuantityChange} placeholder="0" />
        </FormField>
      )}

      {operation === "adjust" && (
        <FormField label={`${t("stock.newQuantity")} *`}>
          <ProductInventoryNumberInput
            value={newQuantity}
            onChange={onNewQuantityChange}
            placeholder="0"
            min={0}
          />
        </FormField>
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
