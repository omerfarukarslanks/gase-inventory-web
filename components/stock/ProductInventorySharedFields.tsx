"use client";

import type { Currency } from "@/lib/products";
import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { CURRENCY_OPTIONS } from "@/components/products/types";
import ProductInventoryNumberInput from "@/components/stock/ProductInventoryNumberInput";

type TranslateFn = (key: string) => string;

type StoreOption = {
  value: string;
  label: string;
};

type ProductInventoryTransferFieldsProps = {
  storeOptions: StoreOption[];
  toStoreOptions: StoreOption[];
  fromStoreId: string;
  onFromStoreIdChange: (value: string) => void;
  toStoreId: string;
  onToStoreIdChange: (value: string) => void;
  t: TranslateFn;
};

type ProductInventoryStoreFieldProps = {
  label: string;
  storeOptions: StoreOption[];
  storeId: string;
  onStoreIdChange: (value: string) => void;
  showEmptyOption?: boolean;
  t: TranslateFn;
};

type ProductInventoryReceivePricingFieldsProps = {
  unitPrice: string;
  onUnitPriceChange: (value: string) => void;
  currency: Currency;
  onCurrencyChange: (value: Currency) => void;
  t: TranslateFn;
};

type ProductInventoryMetaFieldsProps = {
  reason: string;
  onReasonChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  t: TranslateFn;
};

export function ProductInventoryTransferFields({
  storeOptions,
  toStoreOptions,
  fromStoreId,
  onFromStoreIdChange,
  toStoreId,
  onToStoreIdChange,
  t,
}: ProductInventoryTransferFieldsProps) {
  return (
    <>
      <FormField label={`${t("stock.sourceStore")} *`}>
        <SearchableDropdown
          options={storeOptions}
          value={fromStoreId}
          onChange={onFromStoreIdChange}
          placeholder={t("stock.sourceStorePlaceholder")}
          showEmptyOption={false}
        />
      </FormField>
      <FormField label={`${t("stock.targetStore")} *`}>
        <SearchableDropdown
          options={toStoreOptions}
          value={toStoreId}
          onChange={onToStoreIdChange}
          placeholder={t("stock.targetStorePlaceholder")}
          showEmptyOption={false}
        />
      </FormField>
    </>
  );
}

export function ProductInventoryStoreField({
  label,
  storeOptions,
  storeId,
  onStoreIdChange,
  showEmptyOption = false,
  t,
}: ProductInventoryStoreFieldProps) {
  return (
    <FormField label={label}>
      <SearchableDropdown
        options={storeOptions}
        value={storeId}
        onChange={onStoreIdChange}
        placeholder={t("stock.storePlaceholder")}
        showEmptyOption={showEmptyOption}
      />
    </FormField>
  );
}

export function ProductInventoryReceivePricingFields({
  unitPrice,
  onUnitPriceChange,
  currency,
  onCurrencyChange,
  t,
}: ProductInventoryReceivePricingFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label={`${t("products.salePrice")} *`}>
        <ProductInventoryNumberInput
          value={unitPrice}
          onChange={onUnitPriceChange}
          placeholder="0.00"
        />
      </FormField>
      <FormField label={t("products.currencyLabel")}>
        <SearchableDropdown
          options={CURRENCY_OPTIONS}
          value={currency}
          onChange={(value) => onCurrencyChange((value || "TRY") as Currency)}
          showEmptyOption={false}
          allowClear={false}
        />
      </FormField>
    </div>
  );
}

export function ProductInventoryMetaFields({
  reason,
  onReasonChange,
  note,
  onNoteChange,
  t,
}: ProductInventoryMetaFieldsProps) {
  return (
    <>
      <FormField label={t("stock.reason")}>
        <input
          type="text"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder={t("stock.reasonPlaceholder")}
          className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </FormField>

      <TextareaField
        label={t("stock.note")}
        value={note}
        onChange={onNoteChange}
        placeholder={t("stock.notePlaceholder")}
        textareaClassName="min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </>
  );
}
