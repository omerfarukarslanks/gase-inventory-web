"use client";

import { type FormEvent, useCallback, useMemo, useState } from "react";
import { clearStringError, resetStringErrors } from "@/lib/form-errors";
import { trimText } from "@/lib/payload";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import {
  createProductCategory,
  getProductCategoryById,
  updateProductCategory,
  type ProductCategory,
} from "@/lib/product-categories";
import {
  buildCreateProductCategoryPayload,
  buildUpdateProductCategoryPayload,
} from "@/components/product-categories/payload";
import {
  EMPTY_FORM,
  slugifyText,
  type CategoryForm,
  type ProductCategoriesPageMessages,
} from "@/components/product-categories/types";

type UseProductCategoryFormStateOptions = {
  allCategories: ProductCategory[];
  messages: ProductCategoriesPageMessages;
  onRefresh: () => Promise<void>;
};

export function useProductCategoryFormState({
  allCategories,
  messages,
  onRefresh,
}: UseProductCategoryFormStateOptions) {
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const drawerState = useCrudFormDrawerState<CategoryForm>(EMPTY_FORM);
  const {
    drawerOpen,
    submitting,
    loadingDetail: loadingCategoryDetail,
    editingId: editingCategoryId,
    form,
    setDrawerOpen,
    setSubmitting,
    setLoadingDetail: setLoadingCategoryDetail,
    setEditingId: setEditingCategoryId,
    setForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  } = drawerState;

  const parentOptions = useMemo(
    () =>
      allCategories
        .filter((category) => category.id !== editingCategoryId)
        .map((category) => ({ value: category.id, label: category.name })),
    [allCategories, editingCategoryId],
  );

  const onOpenDrawer = useCallback(() => {
    openCreate(() => {
      setFormError("");
      resetStringErrors(setNameError, setSlugError);
      setSlugTouched(false);
    });
  }, [openCreate]);

  const onCloseDrawer = useCallback(() => {
    closeDrawer(() => {
      resetStringErrors(setNameError, setSlugError);
    });
  }, [closeDrawer]);

  const onFormChange = useCallback((field: keyof CategoryForm, value: string) => {
    if (field === "name" && nameError) clearStringError(nameError, setNameError);
    if (field === "slug" && slugError) clearStringError(slugError, setSlugError);

    if (field === "name") {
      setForm((prev) => {
        const nextName = value;
        const nextSlug = !slugTouched ? slugifyText(nextName) : prev.slug;
        return {
          ...prev,
          name: nextName,
          slug: nextSlug,
        };
      });
      return;
    }

    if (field === "slug") {
      setSlugTouched(true);
      setForm((prev) => ({ ...prev, slug: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  }, [nameError, slugError, slugTouched]);

  const onEditCategory = useCallback(async (id: string) => {
    setFormError("");
    resetStringErrors(setNameError, setSlugError);
    setLoadingCategoryDetail(true);
    try {
      const detail = await getProductCategoryById(id);
      setForm({
        name: detail.name ?? "",
        slug: detail.slug ?? "",
        description: detail.description ?? "",
        parentId: detail.parentId ?? "",
      });
      setEditingCategoryId(detail.id);
      setSlugTouched(true);
      setDrawerOpen(true);
    } catch {
      setFormError(messages.loadErrorMessage);
    } finally {
      setLoadingCategoryDetail(false);
    }
  }, [messages.loadErrorMessage]);

  const onSubmitCategory = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    resetStringErrors(setNameError, setSlugError);

    const trimmedName = trimText(form.name);
    const trimmedSlug = trimText(form.slug);

    if (!trimmedName) {
      setNameError("Kategori adi zorunludur.");
      return;
    }

    if (!trimmedSlug) {
      setSlugError("Slug alani zorunludur.");
      return;
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(trimmedSlug)) {
      setSlugError("Slug sadece kucuk harf, rakam ve tire icerebilir.");
      return;
    }

    if (editingCategoryId && form.parentId && form.parentId === editingCategoryId) {
      setFormError("Bir kategori kendisini ust kategori secemez.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategoryId) {
        await updateProductCategory(editingCategoryId, buildUpdateProductCategoryPayload(form));
      } else {
        await createProductCategory(buildCreateProductCategoryPayload(form));
      }

      completeSubmit(() => {
        resetStringErrors(setNameError, setSlugError);
        setSlugTouched(false);
      });
      await onRefresh();
    } catch {
      setFormError(messages.loadErrorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [editingCategoryId, form, messages.loadErrorMessage, onRefresh]);

  return {
    drawerOpen,
    submitting,
    loadingCategoryDetail,
    editingCategoryId,
    formError,
    nameError,
    slugError,
    form,
    parentOptions,
    onOpenDrawer,
    onCloseDrawer,
    onFormChange,
    onEditCategory,
    onSubmitCategory,
  };
}
