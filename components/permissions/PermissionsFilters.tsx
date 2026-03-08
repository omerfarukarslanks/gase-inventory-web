"use client";

import Button from "@/components/ui/Button";
import FilterField from "@/components/ui/FilterField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import SearchInput from "@/components/ui/SearchInput";
import { getStatusFilterOptions, parseIsActiveFilter } from "@/components/products/types";
import { AdvancedFiltersPanel, FilterActionsRow, PageToolbar } from "@/components/ui/PageToolbar";
import { useLang } from "@/context/LangContext";

type PermissionsFiltersProps = {
  permSearch: string;
  onPermSearchChange: (value: string) => void;
  showPermFilters: boolean;
  onTogglePermFilters: () => void;
  canManage: boolean;
  onCreatePermission: () => void;
  permStatusFilter: boolean | "all";
  onPermStatusFilterChange: (value: boolean | "all") => void;
  onClearFilters: () => void;
  showActions?: boolean;
};

export default function PermissionsFilters({
  permSearch,
  onPermSearchChange,
  showPermFilters,
  onTogglePermFilters,
  canManage,
  onCreatePermission,
  permStatusFilter,
  onPermStatusFilterChange,
  onClearFilters,
  showActions = true,
}: PermissionsFiltersProps) {
  const { t } = useLang();
  const statusOptions = getStatusFilterOptions(t);

  return (
    <>
      <PageToolbar
        title={t("permissions.title")}
        description={t("permissions.subtitle")}
        actions={showActions ? (
          <FilterActionsRow className="w-full lg:w-auto">
            <SearchInput
              value={permSearch}
              onChange={onPermSearchChange}
              placeholder={t("common.search")}
              containerClassName="w-full lg:w-64"
            />
            <Button
              label={showPermFilters ? t("common.hideFilter") : t("common.filter")}
              onClick={onTogglePermFilters}
              variant="secondary"
              className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
            />
            {canManage && (
              <Button
                label={t("permissions.new")}
                onClick={onCreatePermission}
                variant="primarySoft"
                className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
              />
            )}
          </FilterActionsRow>
        ) : null}
      />

      {showActions && showPermFilters && (
        <AdvancedFiltersPanel className="md:grid-cols-2 lg:grid-cols-3">
          <FilterField label={t("common.status")}>
            <SearchableDropdown
              options={statusOptions}
              value={permStatusFilter === "all" ? "all" : String(permStatusFilter)}
              onChange={(value) => onPermStatusFilterChange(parseIsActiveFilter(value))}
              placeholder={t("common.allStatuses")}
              showEmptyOption={false}
              allowClear={false}
              inputAriaLabel={t("common.status")}
              toggleAriaLabel={t("common.status")}
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
