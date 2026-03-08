"use client";

import SearchableMultiSelectDropdown from "@/components/ui/SearchableMultiSelectDropdown";
import SearchInput from "@/components/ui/SearchInput";
import { FilterActionsRow, PageToolbar } from "@/components/ui/PageToolbar";
import { useLang } from "@/context/LangContext";

type StockFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  storeFilterIds: string[];
  onStoreFilterChange: (ids: string[]) => void;
  storeOptions: { value: string; label: string }[];
  canTenantOnly?: boolean;
};

export default function StockFilters({
  searchTerm,
  onSearchChange,
  storeFilterIds,
  onStoreFilterChange,
  storeOptions,
  canTenantOnly = true,
}: StockFiltersProps) {
  const { t } = useLang();
  return (
    <PageToolbar
      title={t("stock.title")}
      description={t("stock.subtitle")}
      actions={
        <FilterActionsRow className="w-full lg:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={t("stock.searchPlaceholder")}
            containerClassName="w-full lg:w-72"
          />
          {canTenantOnly && (
            <div className="w-full lg:w-72">
              <SearchableMultiSelectDropdown
                options={storeOptions}
                values={storeFilterIds}
                onChange={onStoreFilterChange}
                placeholder={t("common.allStores")}
              />
            </div>
          )}
        </FilterActionsRow>
      }
    />
  );
}
