"use client";

import type { FormEvent } from "react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import InputField from "@/components/ui/InputField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { cn } from "@/lib/cn";
import { useLang } from "@/context/LangContext";
import type { CategoryForm } from "@/components/product-categories/types";

type ProductCategoryDrawerProps = {
  open: boolean;
  editingCategoryId: string | null;
  submitting: boolean;
  loadingCategoryDetail: boolean;
  isMobile: boolean;
  form: CategoryForm;
  parentOptions: Array<{ value: string; label: string }>;
  formError: string;
  nameError: string;
  slugError: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof CategoryForm, value: string) => void;
};

export default function ProductCategoryDrawer({
  open,
  editingCategoryId,
  submitting,
  loadingCategoryDetail,
  isMobile,
  form,
  parentOptions,
  formError,
  nameError,
  slugError,
  onClose,
  onSubmit,
  onFormChange,
}: ProductCategoryDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingCategoryId ? t("common.update") : t("productCategories.new")}
      description={editingCategoryId ? t("common.update") : t("productCategories.new")}
      closeDisabled={submitting || loadingCategoryDetail}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={submitting || loadingCategoryDetail}
            variant="secondary"
          />
          <Button
            label={submitting ? (editingCategoryId ? t("common.updating") : t("common.creating")) : t("common.save")}
            type="submit"
            form="category-form"
            disabled={submitting || loadingCategoryDetail}
            variant="primarySolid"
          />
        </div>
      }
    >
      <form id="category-form" onSubmit={onSubmit} className="space-y-4 p-5">
        {loadingCategoryDetail ? (
          <div className="text-sm text-muted">{t("productCategories.loadingDetail")}</div>
        ) : (
          <>
            <InputField
              label={t("productCategories.name")}
              type="text"
              value={form.name}
              onChange={(value) => onFormChange("name", value)}
              placeholder={t("productCategories.namePlaceholder")}
              error={nameError}
            />

            <InputField
              label={t("productCategories.slug")}
              type="text"
              value={form.slug}
              onChange={(value) => onFormChange("slug", value)}
              placeholder={t("productCategories.slugPlaceholder")}
              error={slugError}
            />

            <FormField label={t("productCategories.parent")}>
              <SearchableDropdown
                options={parentOptions}
                value={form.parentId}
                onChange={(value) => onFormChange("parentId", value)}
                placeholder={t("productCategories.parentPlaceholder")}
                emptyOptionLabel={t("productCategories.parentPlaceholder")}
              />
            </FormField>

            <TextareaField
              label={t("productCategories.description")}
              value={form.description}
              onChange={(value) => onFormChange("description", value)}
              placeholder={t("productCategories.descriptionPlaceholder")}
            />

            {formError && <p className="text-sm text-error">{formError}</p>}
          </>
        )}
      </form>
    </Drawer>
  );
}
