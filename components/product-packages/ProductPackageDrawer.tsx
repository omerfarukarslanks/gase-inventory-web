"use client";

import type { FormEvent } from "react";
import type { Product } from "@/lib/products";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import FormSectionHeader from "@/components/ui/FormSectionHeader";
import InputField from "@/components/ui/InputField";
import SearchableMultiSelectDropdown from "@/components/ui/SearchableMultiSelectDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { SearchIcon } from "@/components/ui/icons/TableIcons";
import { useLang } from "@/context/LangContext";
import { cn } from "@/lib/cn";
import type { FormErrors, PackageForm, PackageItemRow } from "@/components/product-packages/types";

type ProductPackageDrawerProps = {
  open: boolean;
  editingId: string | null;
  loadingDetail: boolean;
  submitting: boolean;
  isMobile: boolean;
  formError: string;
  form: PackageForm;
  errors: FormErrors;
  items: PackageItemRow[];
  variantSearchTerm: string;
  variantSearchLoading: boolean;
  variantSearchProducts: Product[];
  selectedProductForVariant: string;
  variantOptions: Array<{ value: string; label: string }>;
  variantsLoading: boolean;
  selectedVariantIds: string[];
  addItemQuantity: string;
  addItemError: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof PackageForm, value: string) => void;
  onVariantSearchTermChange: (value: string) => void;
  onSelectProductForVariant: (product: Product) => void;
  onSelectedVariantIdsChange: (values: string[]) => void;
  onAddItemQuantityChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (rowId: string) => void;
  onItemQuantityChange: (rowId: string, value: string) => void;
};

export default function ProductPackageDrawer({
  open,
  editingId,
  loadingDetail,
  submitting,
  isMobile,
  formError,
  form,
  errors,
  items,
  variantSearchTerm,
  variantSearchLoading,
  variantSearchProducts,
  selectedProductForVariant,
  variantOptions,
  variantsLoading,
  selectedVariantIds,
  addItemQuantity,
  addItemError,
  onClose,
  onSubmit,
  onFormChange,
  onVariantSearchTermChange,
  onSelectProductForVariant,
  onSelectedVariantIdsChange,
  onAddItemQuantityChange,
  onAddItem,
  onRemoveItem,
  onItemQuantityChange,
}: ProductPackageDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingId ? t("productPackages.update") : t("productPackages.new")}
      description={
        editingId
          ? t("productPackages.editDesc")
          : t("productPackages.createDesc")
      }
      closeDisabled={submitting || loadingDetail}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={submitting || loadingDetail}
            variant="secondary"
          />
          <Button
            label={
              submitting
                ? editingId
                  ? t("common.updating")
                  : t("common.creating")
                : t("common.save")
            }
            type="submit"
            form="package-form"
            disabled={submitting || loadingDetail}
            variant="primarySolid"
          />
        </div>
      }
    >
      <form id="package-form" onSubmit={onSubmit} className="space-y-4 p-5">
        {loadingDetail ? (
          <div className="text-sm text-muted">{t("productPackages.loadingDetail")}</div>
        ) : (
          <>
            <InputField
              label={t("productPackages.name")}
              type="text"
              value={form.name}
              onChange={(value) => onFormChange("name", value)}
              placeholder={t("productPackages.namePlaceholder")}
              error={errors.name}
            />

            <InputField
              label={t("productPackages.code")}
              type="text"
              value={form.code}
              onChange={(value) => onFormChange("code", value)}
              placeholder={t("productPackages.codePlaceholder")}
              error={errors.code}
            />

            <TextareaField
              label={t("productPackages.description")}
              value={form.description}
              onChange={(value) => onFormChange("description", value)}
              placeholder={t("productPackages.descriptionPlaceholder")}
              textareaClassName="min-h-[80px] w-full rounded-xl2 border border-border bg-surface2 px-3 py-2.5 text-sm text-text outline-none focus:border-primary/60"
            />

            <div className="space-y-3 border-t border-border pt-4">
              <FormSectionHeader
                title={t("productPackages.itemsTitle")}
                description={t("productPackages.itemsSubtitle")}
              />

              {errors.items && <p className="text-xs text-error">{errors.items}</p>}

              {items.length > 0 && (
                <div className="divide-y divide-border rounded-xl border border-border bg-surface2/30">
                  {items.map((item) => (
                    <div key={item.rowId} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text">{item.variantLabel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap text-xs text-muted">
                          {t("productPackages.quantity")}:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => onItemQuantityChange(item.rowId, event.target.value)}
                          className="h-8 w-20 rounded-lg border border-border bg-surface px-2 text-sm text-text outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.rowId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-error transition-colors hover:bg-error/10"
                          title={t("productPackages.removeItem")}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-xl2 border border-dashed border-border bg-surface2/20 p-3">
                <p className="text-xs font-semibold text-muted">{t("productPackages.addVariant")}</p>

                <div className="space-y-1">
                  <label className="text-xs text-muted">{t("productPackages.searchProduct")}</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder={t("productPackages.searchProductPlaceholder")}
                      value={variantSearchTerm}
                      onChange={(event) => onVariantSearchTermChange(event.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {variantSearchLoading && (
                    <p className="text-xs text-muted">{t("productPackages.searchLoading")}</p>
                  )}
                  {!variantSearchLoading && variantSearchProducts.length > 0 && !selectedProductForVariant && (
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-surface shadow-md">
                      {variantSearchProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => onSelectProductForVariant(product)}
                          className="w-full px-3 py-2 text-left text-sm text-text2 transition-colors hover:bg-surface2 hover:text-text"
                        >
                          <span className="font-medium">{product.name}</span>
                          <span className="ml-2 text-xs text-muted">({product.sku})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedProductForVariant && (
                  <div className="space-y-1">
                    <label className="text-xs text-muted">{t("productPackages.selectVariants")}</label>
                    {variantsLoading ? (
                      <p className="text-xs text-muted">{t("productPackages.variantsLoading")}</p>
                    ) : variantOptions.length === 0 ? (
                      <p className="text-xs text-muted">{t("productPackages.noActiveVariants")}</p>
                    ) : (
                      <SearchableMultiSelectDropdown
                        options={variantOptions.filter(
                          (option) =>
                            selectedVariantIds.includes(option.value) ||
                            !items.some((item) => item.productVariantId === option.value),
                        )}
                        values={selectedVariantIds}
                        onChange={onSelectedVariantIdsChange}
                        placeholder={t("productPackages.selectVariantsPlaceholder")}
                        noResultsText={t("productPackages.noSelectableVariants")}
                      />
                    )}
                  </div>
                )}

                {selectedVariantIds.length > 0 && (
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-muted">{t("productPackages.quantityPerPackage")}</label>
                      <input
                        type="number"
                        min="1"
                        value={addItemQuantity}
                        onChange={(event) => onAddItemQuantityChange(event.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary"
                      />
                    </div>
                    <Button
                      label={`${t("productPackages.addSelected")} (${selectedVariantIds.length})`}
                      type="button"
                      onClick={onAddItem}
                      variant="primarySoft"
                      className="h-9 px-4 py-0"
                    />
                  </div>
                )}

                {addItemError && <p className="text-xs text-error">{addItemError}</p>}
              </div>
            </div>

            {formError && <p className="text-sm text-error">{formError}</p>}
          </>
        )}
      </form>
    </Drawer>
  );
}
