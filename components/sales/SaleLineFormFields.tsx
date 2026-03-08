"use client";

import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { useLang } from "@/context/LangContext";
import type { ManagedLineEditForm, SaleLineForm } from "@/components/sales/types";

type LineFormValue = ManagedLineEditForm | SaleLineForm;

type SaleLineFormFieldsProps = {
  form: LineFormValue;
  onChange: (patch: Partial<LineFormValue>) => void;
  selectField?: {
    label: string;
    placeholder: string;
    value: string;
    options: Array<{ value: string; label: string; secondaryLabel?: string }>;
    onChange: (value: string) => void;
  };
};

type ToggleableLabelProps = {
  label: string;
  toggleLabel: string;
  onToggle: () => void;
};

function ToggleableLabel({ label, toggleLabel, onToggle }: ToggleableLabelProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-muted">
      <span>{label}</span>
      <button type="button" onClick={onToggle} className="text-primary hover:underline">
        ({toggleLabel})
      </button>
    </div>
  );
}

export default function SaleLineFormFields({
  form,
  onChange,
  selectField,
}: SaleLineFormFieldsProps) {
  const { t } = useLang();

  return (
    <div className="space-y-3">
      {selectField && (
        <FormField label={selectField.label}>
          <SearchableDropdown
            options={selectField.options}
            value={selectField.value}
            onChange={(value) => selectField.onChange(value ?? "")}
            placeholder={selectField.placeholder}
          />
        </FormField>
      )}

      <div className="grid grid-cols-2 gap-2">
        <FormField label={`${t("stock.quantity")} *`}>
          <input
            type="number"
            min={1}
            step={1}
            value={form.quantity}
            onChange={(event) => onChange({ quantity: event.target.value })}
            className="h-9 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>
        <FormField label={`${t("products.salePrice")} *`}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.unitPrice}
            onChange={(event) => onChange({ unitPrice: event.target.value })}
            className="h-9 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <ToggleableLabel
            label={
              form.discountMode === "percent"
                ? t("sales.discountPercent")
                : t("stock.discountAmount")
            }
            toggleLabel={
              form.discountMode === "percent"
                ? t("sales.switchToAmount")
                : t("sales.switchToPercent")
            }
            onToggle={() =>
              onChange({
                discountMode: form.discountMode === "percent" ? "amount" : "percent",
              })
            }
          />
          <input
            type="number"
            min={0}
            max={form.discountMode === "percent" ? 100 : undefined}
            step="0.01"
            value={form.discountMode === "percent" ? form.discountPercent : form.discountAmount}
            onChange={(event) =>
              onChange(
                form.discountMode === "percent"
                  ? { discountPercent: event.target.value }
                  : { discountAmount: event.target.value },
              )
            }
            className="h-9 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <ToggleableLabel
            label={form.taxMode === "percent" ? t("sales.taxPercent") : t("stock.taxAmount")}
            toggleLabel={
              form.taxMode === "percent"
                ? t("sales.switchToAmount")
                : t("sales.switchToPercent")
            }
            onToggle={() =>
              onChange({
                taxMode: form.taxMode === "percent" ? "amount" : "percent",
              })
            }
          />
          <input
            type="number"
            min={0}
            max={form.taxMode === "percent" ? 100 : undefined}
            step="0.01"
            value={form.taxMode === "percent" ? form.taxPercent : form.taxAmount}
            onChange={(event) =>
              onChange(
                form.taxMode === "percent"
                  ? { taxPercent: event.target.value }
                  : { taxAmount: event.target.value },
              )
            }
            className="h-9 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <FormField label={t("sales.campaignCode")}>
        <input
          type="text"
          value={form.campaignCode}
          onChange={(event) => onChange({ campaignCode: event.target.value })}
          className="h-9 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </FormField>
    </div>
  );
}
