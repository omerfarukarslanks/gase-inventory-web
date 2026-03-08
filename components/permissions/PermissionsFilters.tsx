"use client";

import Button from "@/components/ui/Button";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import SearchInput from "@/components/ui/SearchInput";
import { STATUS_FILTER_OPTIONS, parseIsActiveFilter } from "@/components/products/types";

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
}: PermissionsFiltersProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
          <SearchInput
            value={permSearch}
            onChange={onPermSearchChange}
            placeholder="Ara..."
            containerClassName="w-full lg:w-64"
          />
          <Button
            label={showPermFilters ? "Detaylı Filtreyi Gizle" : "Detaylı Filtre"}
            onClick={onTogglePermFilters}
            variant="secondary"
            className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
          />
          {canManage && (
            <Button
              label="Yeni Yetki"
              onClick={onCreatePermission}
              variant="primarySoft"
              className="w-full px-2.5 py-2 lg:w-auto lg:px-3"
            />
          )}
        </div>
      </div>

      {showPermFilters && (
        <div className="grid gap-3 rounded-xl2 border border-border bg-surface p-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Durum</label>
            <SearchableDropdown
              options={STATUS_FILTER_OPTIONS}
              value={permStatusFilter === "all" ? "all" : String(permStatusFilter)}
              onChange={(value) => onPermStatusFilterChange(parseIsActiveFilter(value))}
              placeholder="Tüm Durumlar"
              showEmptyOption={false}
              allowClear={false}
              inputAriaLabel="Yetki durum filtresi"
              toggleAriaLabel="Yetki durum listesini aç"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Button
              label="Filtreleri Temizle"
              onClick={onClearFilters}
              variant="secondary"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
