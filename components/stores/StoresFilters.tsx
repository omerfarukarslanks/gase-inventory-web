"use client";

import Button from "@/components/ui/Button";
import FilterField from "@/components/ui/FilterField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import SearchInput from "@/components/ui/SearchInput";
import { getStatusFilterOptions, parseIsActiveFilter } from "@/components/products/types";
import { AdvancedFiltersPanel, FilterActionsRow, PageToolbar } from "@/components/ui/PageToolbar";
import { useLang } from "@/context/LangContext";

type StoresFiltersProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  canCreate: boolean;
  onCreate: () => void;
  statusFilter: boolean | "all";
  onStatusFilterChange: (value: boolean | "all") => void;
  onClearFilters: () => void;
};

export default function StoresFilters({
  searchTerm,
  onSearchTermChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  canCreate,
  onCreate,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: StoresFiltersProps) {
  const { t } = useLang();
  const statusOptions = getStatusFilterOptions(t);

  return (
    <>
      <PageToolbar
        title={t("stores.title")}
        description={t("stores.subtitle")}
        actions={
          <FilterActionsRow className="w-full lg:w-auto">
            <SearchInput
              value={searchTerm}
              onChange={onSearchTermChange}
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
                label={t("stores.new")}
                onClick={onCreate}
                variant="primarySoft"
                className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
              />
            )}
          </FilterActionsRow>
        }
      />

      {showAdvancedFilters && (
        <AdvancedFiltersPanel className="md:grid-cols-2 lg:grid-cols-3">
          <FilterField label={t("common.status")}>
            <SearchableDropdown
              options={statusOptions}
              value={statusFilter === "all" ? "all" : String(statusFilter)}
              onChange={(value) => onStatusFilterChange(parseIsActiveFilter(value))}
              placeholder={t("common.allStatuses")}
              showEmptyOption={false}
              allowClear={false}
              inputAriaLabel={t("stores.statusFilter")}
              toggleAriaLabel={t("stores.statusFilter")}
            />
          </FilterField>
          <div className="md:col-span-2 lg:col-span-3">
            <Button
              label={t("common.clearFilters")}
              onClick={onClearFilters}
              variant="secondary"
              className="w-full sm:w-auto"
            />
          </div>
        </AdvancedFiltersPanel>
      )}
    </>
  );
}
