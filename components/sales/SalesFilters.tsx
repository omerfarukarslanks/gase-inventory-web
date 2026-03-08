"use client";

import Button from "@/components/ui/Button";
import FilterField from "@/components/ui/FilterField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import SearchableMultiSelectDropdown from "@/components/ui/SearchableMultiSelectDropdown";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { getPaymentStatusOptions, getSalesStatusOptions } from "@/components/sales/types";
import { AdvancedFiltersPanel, FilterActionsRow } from "@/components/ui/PageToolbar";
import { useLang } from "@/context/LangContext";

type SalesFiltersProps = {
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  onNewSale: () => void;
  canCreate?: boolean;
  canTenantOnly: boolean;
  storeOptions: Array<{ value: string; label: string }>;
  salesStoreIds: string[];
  onSalesStoreIdsChange: (values: string[]) => void;
  receiptNoFilter: string;
  onReceiptNoFilterChange: (value: string) => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  surnameFilter: string;
  onSurnameFilterChange: (value: string) => void;
  statusFilters: string[];
  onStatusFiltersChange: (values: string[]) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  minUnitPriceFilter: string;
  onMinUnitPriceFilterChange: (value: string) => void;
  maxUnitPriceFilter: string;
  onMaxUnitPriceFilterChange: (value: string) => void;
  minLineTotalFilter: string;
  onMinLineTotalFilterChange: (value: string) => void;
  maxLineTotalFilter: string;
  onMaxLineTotalFilterChange: (value: string) => void;
  includeLines: boolean;
  onIncludeLinesChange: (checked: boolean) => void;
  onResetPage: () => void;
};

export default function SalesFilters({
  showAdvancedFilters,
  onToggleAdvancedFilters,
  onNewSale,
  canCreate = true,
  canTenantOnly,
  storeOptions,
  salesStoreIds,
  onSalesStoreIdsChange,
  receiptNoFilter,
  onReceiptNoFilterChange,
  nameFilter,
  onNameFilterChange,
  surnameFilter,
  onSurnameFilterChange,
  statusFilters,
  onStatusFiltersChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  minUnitPriceFilter,
  onMinUnitPriceFilterChange,
  maxUnitPriceFilter,
  onMaxUnitPriceFilterChange,
  minLineTotalFilter,
  onMinLineTotalFilterChange,
  maxLineTotalFilter,
  onMaxLineTotalFilterChange,
  includeLines,
  onIncludeLinesChange,
  onResetPage,
}: SalesFiltersProps) {
  const { t } = useLang();
  const salesStatusOptions = getSalesStatusOptions(t);
  const paymentStatusOptions = getPaymentStatusOptions(t);

  return (
    <div className="space-y-3">
      <FilterActionsRow>
        <Button
          label={showAdvancedFilters ? t("common.hideFilter") : t("common.filter")}
          onClick={onToggleAdvancedFilters}
          variant="secondary"
          className="px-3 py-1.5"
        />
        {canCreate && (
          <Button
            label={t("sales.new")}
            onClick={onNewSale}
            variant="primarySoft"
            className="px-3 py-1.5"
          />
        )}
      </FilterActionsRow>

      {showAdvancedFilters && (
        <AdvancedFiltersPanel className="md:grid-cols-2 xl:grid-cols-4">
          {canTenantOnly && (
            <FilterField label={t("sales.filterByStore")} className="xl:col-span-2">
              <SearchableMultiSelectDropdown
                options={storeOptions}
                values={salesStoreIds}
                onChange={(values) => {
                  onSalesStoreIdsChange(values);
                  onResetPage();
                }}
                placeholder={t("sales.allStores")}
              />
            </FilterField>
          )}
          <FilterField label={t("sales.receiptNo")}>
            <input
              type="text"
              value={receiptNoFilter}
              onChange={(event) => {
                onReceiptNoFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("sales.firstName")}>
            <input
              type="text"
              value={nameFilter}
              onChange={(event) => {
                onNameFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("sales.surname")}>
            <input
              type="text"
              value={surnameFilter}
              onChange={(event) => {
                onSurnameFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("common.status")}>
            <SearchableMultiSelectDropdown
              options={salesStatusOptions}
              values={statusFilters}
              onChange={(values) => {
                onStatusFiltersChange(values);
                onResetPage();
              }}
              placeholder={t("sales.statusSelect")}
            />
          </FilterField>
          <FilterField label={t("sales.paymentStatus")}>
            <SearchableDropdown
              options={paymentStatusOptions}
              value={paymentStatusFilter}
              onChange={(value) => {
                onPaymentStatusFilterChange(value);
                onResetPage();
              }}
              placeholder={t("sales.paymentStatusSelect")}
              emptyOptionLabel={t("sales.allPaymentStatuses")}
            />
          </FilterField>
          <FilterField label={t("sales.minUnitPrice")}>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minUnitPriceFilter}
              onChange={(event) => {
                onMinUnitPriceFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("sales.maxUnitPrice")}>
            <input
              type="number"
              min={0}
              step="0.01"
              value={maxUnitPriceFilter}
              onChange={(event) => {
                onMaxUnitPriceFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("sales.minLineTotal")}>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minLineTotalFilter}
              onChange={(event) => {
                onMinLineTotalFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("sales.maxLineTotal")}>
            <input
              type="number"
              min={0}
              step="0.01"
              value={maxLineTotalFilter}
              onChange={(event) => {
                onMaxLineTotalFilterChange(event.target.value);
                onResetPage();
              }}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <div className="flex items-end">
            <div className="flex w-full items-center justify-between rounded-xl border border-border bg-surface2/40 px-3 py-2">
              <span className="text-xs font-semibold text-muted">{t("sales.includeLines")}</span>
              <ToggleSwitch
                checked={includeLines}
                onChange={(checked) => {
                  onIncludeLinesChange(checked);
                  onResetPage();
                }}
              />
            </div>
          </div>
        </AdvancedFiltersPanel>
      )}
    </div>
  );
}
