"use client";

import type { Currency } from "@/lib/products";
import {
  CURRENCY_FILTER_OPTIONS,
  getStatusFilterOptions,
  type IsActiveFilter,
  parseIsActiveFilter,
} from "@/components/products/types";
import Button from "@/components/ui/Button";
import FilterField from "@/components/ui/FilterField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import SearchInput from "@/components/ui/SearchInput";
import { AdvancedFiltersPanel, FilterActionsRow, PageToolbar } from "@/components/ui/PageToolbar";
import { useLang } from "@/context/LangContext";

type ProductFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  onNewProduct: () => void;
  canCreate?: boolean;
  currencyFilter: Currency | "";
  onCurrencyFilterChange: (value: Currency | "") => void;
  productStatusFilter: IsActiveFilter;
  onProductStatusFilterChange: (value: IsActiveFilter) => void;
  variantStatusFilter: IsActiveFilter;
  onVariantStatusFilterChange: (value: IsActiveFilter) => void;
  salePriceMin: string;
  onSalePriceMinChange: (value: string) => void;
  salePriceMax: string;
  onSalePriceMaxChange: (value: string) => void;
  purchasePriceMin: string;
  onPurchasePriceMinChange: (value: string) => void;
  purchasePriceMax: string;
  onPurchasePriceMaxChange: (value: string) => void;
  onClearAdvancedFilters: () => void;
};

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  onNewProduct,
  canCreate = true,
  currencyFilter,
  onCurrencyFilterChange,
  productStatusFilter,
  onProductStatusFilterChange,
  variantStatusFilter,
  onVariantStatusFilterChange,
  salePriceMin,
  onSalePriceMinChange,
  salePriceMax,
  onSalePriceMaxChange,
  purchasePriceMin,
  onPurchasePriceMinChange,
  purchasePriceMax,
  onPurchasePriceMaxChange,
  onClearAdvancedFilters,
}: ProductFiltersProps) {
  const { t } = useLang();
  const statusOptions = getStatusFilterOptions(t);

  return (
    <>
      <PageToolbar
        title={t("products.title")}
        description={t("products.subtitle")}
        actions={
          <FilterActionsRow className="w-full lg:w-auto">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={t("common.search")}
              containerClassName="w-full lg:w-64"
            />
            <Button
              label={showAdvancedFilters ? t("common.hideFilter") : t("common.filter")}
              onClick={onToggleAdvancedFilters}
              variant="secondary"
              className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
            />
            {canCreate && (
              <Button
                label={t("products.new")}
                onClick={onNewProduct}
                variant="primarySoft"
                className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
              />
            )}
          </FilterActionsRow>
        }
      />

      {showAdvancedFilters && (
        <AdvancedFiltersPanel className="md:grid-cols-2 lg:grid-cols-4">
          <FilterField label={t("products.currencyLabel")}>
            <SearchableDropdown
              options={CURRENCY_FILTER_OPTIONS}
              value={currencyFilter}
              onChange={(value) => onCurrencyFilterChange(value as Currency | "")}
              placeholder={t("products.allCurrencies")}
              emptyOptionLabel={t("products.allCurrencies")}
              inputAriaLabel={t("products.currencyFilterAriaLabel")}
              clearAriaLabel={t("products.currencyFilterClearAriaLabel")}
              toggleAriaLabel={t("products.currencyFilterToggleAriaLabel")}
            />
          </FilterField>
          <FilterField label={t("products.productStatus")}>
            <SearchableDropdown
              options={statusOptions}
              value={productStatusFilter === "all" ? "all" : String(productStatusFilter)}
              onChange={(value) => onProductStatusFilterChange(parseIsActiveFilter(value))}
              placeholder={t("products.productStatus")}
              showEmptyOption={false}
              allowClear={false}
              inputAriaLabel={t("products.productStatusFilterAriaLabel")}
              toggleAriaLabel={t("products.productStatusFilterToggleAriaLabel")}
            />
          </FilterField>
          <FilterField label={t("products.variantStatus")}>
            <SearchableDropdown
              options={statusOptions}
              value={variantStatusFilter === "all" ? "all" : String(variantStatusFilter)}
              onChange={(value) => onVariantStatusFilterChange(parseIsActiveFilter(value))}
              placeholder={t("products.variantStatus")}
              showEmptyOption={false}
              allowClear={false}
              inputAriaLabel={t("products.variantStatusFilterAriaLabel")}
              toggleAriaLabel={t("products.variantStatusFilterToggleAriaLabel")}
            />
          </FilterField>
          <FilterField label={t("products.salePriceMin")}>
            <input
              type="number"
              value={salePriceMin}
              onChange={(e) => onSalePriceMinChange(e.target.value)}
              placeholder="0"
              className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("products.salePriceMax")}>
            <input
              type="number"
              value={salePriceMax}
              onChange={(e) => onSalePriceMaxChange(e.target.value)}
              placeholder="1000"
              className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("products.purchasePriceMin")}>
            <input
              type="number"
              value={purchasePriceMin}
              onChange={(e) => onPurchasePriceMinChange(e.target.value)}
              placeholder="0"
              className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <FilterField label={t("products.purchasePriceMax")}>
            <input
              type="number"
              value={purchasePriceMax}
              onChange={(e) => onPurchasePriceMaxChange(e.target.value)}
              placeholder="1000"
              className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </FilterField>
          <div className="md:col-span-2 lg:col-span-4">
            <Button
              label={t("products.clearAdvancedFilters")}
              onClick={onClearAdvancedFilters}
              variant="secondary"
              className="w-full sm:w-auto"
            />
          </div>
        </AdvancedFiltersPanel>
      )}
    </>
  );
}
