"use client";

import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import FormField from "@/components/ui/FormField";
import InputField from "@/components/ui/InputField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { CURRENCY_OPTIONS } from "@/components/products/types";
import { cn } from "@/lib/cn";
import { useLang } from "@/context/LangContext";
import type { Currency } from "@/lib/products";
import type { StoreType } from "@/lib/stores";
import type { StoreForm } from "@/components/stores/types";

type StoreDrawerProps = {
  open: boolean;
  editingStoreId: string | null;
  submitting: boolean;
  loadingStoreDetail: boolean;
  isMobile: boolean;
  form: StoreForm;
  formError: string;
  nameError: string;
  storeTypeOptions: ReadonlyArray<{ value: StoreType; label: string }>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: <K extends keyof StoreForm>(field: K, value: StoreForm[K]) => void;
  normalizeCurrency: (value: string) => Currency;
  normalizeStoreType: (value: string) => StoreType;
};

export default function StoreDrawer({
  open,
  editingStoreId,
  submitting,
  loadingStoreDetail,
  isMobile,
  form,
  formError,
  nameError,
  storeTypeOptions,
  onClose,
  onSubmit,
  onFormChange,
  normalizeCurrency,
  normalizeStoreType,
}: StoreDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingStoreId ? t("stores.update") : t("stores.create")}
      description={editingStoreId ? t("stores.update") : t("stores.name")}
      closeDisabled={submitting || loadingStoreDetail}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={submitting || loadingStoreDetail}
            variant="secondary"
          />
          <Button
            label={
              submitting
                ? editingStoreId
                  ? t("common.updating")
                  : t("common.creating")
                : editingStoreId
                  ? t("stores.update")
                  : t("stores.create")
            }
            type="submit"
            form="create-store-form"
            disabled={submitting || loadingStoreDetail}
            variant="primarySolid"
          />
        </div>
      }
    >
      <form id="create-store-form" onSubmit={onSubmit} className="space-y-4 p-5">
        {loadingStoreDetail ? (
          <div className="text-sm text-muted">{t("stores.loadingDetail")}</div>
        ) : (
          <>
            <InputField
              label={t("stores.name")}
              type="text"
              value={form.name}
              onChange={(value) => onFormChange("name", value)}
              placeholder={t("stores.namePlaceholder")}
              error={nameError}
            />

            <InputField
              label={t("stores.code")}
              type="text"
              value={form.code}
              onChange={(value) => onFormChange("code", value)}
              placeholder={t("stores.codePlaceholder")}
            />

            <FormField label={t("stores.storeType")}>
              <SearchableDropdown
                options={[...storeTypeOptions]}
                value={form.storeType}
                onChange={(value) => onFormChange("storeType", normalizeStoreType(value))}
                placeholder={t("stores.storeTypePlaceholder")}
                showEmptyOption={false}
                allowClear={false}
                inputAriaLabel={t("stores.storeType")}
                toggleAriaLabel={t("stores.storeType")}
                disabled={Boolean(editingStoreId)}
              />
            </FormField>

            <FormField label={t("stores.currency")}>
              <SearchableDropdown
                options={CURRENCY_OPTIONS}
                value={form.currency}
                onChange={(value) => onFormChange("currency", normalizeCurrency(value))}
                placeholder={t("stores.currencyPlaceholder")}
                showEmptyOption={false}
                allowClear={false}
                inputAriaLabel={t("stores.currency")}
                toggleAriaLabel={t("stores.currency")}
                disabled={Boolean(editingStoreId)}
              />
            </FormField>

            <InputField
              label={t("stores.address")}
              type="text"
              value={form.address}
              onChange={(value) => onFormChange("address", value)}
              placeholder={t("stores.addressPlaceholder")}
            />

            <InputField
              label={t("stores.slug")}
              type="text"
              value={form.slug}
              onChange={(value) => onFormChange("slug", value)}
              placeholder={t("stores.slugPlaceholder")}
            />

            <InputField
              label={t("stores.logo")}
              type="text"
              value={form.logo}
              onChange={(value) => onFormChange("logo", value)}
              placeholder={t("stores.logoPlaceholder")}
            />

            <TextareaField
              label={t("stores.description")}
              value={form.description}
              onChange={(value) => onFormChange("description", value)}
              placeholder={t("stores.descPlaceholder")}
            />

            {formError && <p className="text-sm text-error">{formError}</p>}
          </>
        )}
      </form>
    </Drawer>
  );
}
