"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import TablePagination from "@/components/ui/TablePagination";
import {
  createProductCategory,
  getAllProductCategories,
  getProductCategoryById,
  getProductCategoriesPaginated,
  updateProductCategory,
  type ProductCategory,
  type ProductCategoriesListMeta,
} from "@/lib/product-categories";
import { useDebounceStr } from "@/hooks/useDebounce";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { useLang } from "@/context/LangContext";
import { nullishToUndefined, trimText, trimToNull, trimToUndefined } from "@/lib/payload";
import ProductCategoryFilters from "@/components/product-categories/ProductCategoryFilters";
import ProductCategoryTable from "@/components/product-categories/ProductCategoryTable";
import ProductCategoryDrawer from "@/components/product-categories/ProductCategoryDrawer";
import { EMPTY_FORM, slugifyText, type CategoryForm } from "@/components/product-categories/types";

export default function ProductCategoriesPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("PRODUCT_CATEGORY_READ");
  const canCreate = can("PRODUCT_CATEGORY_CREATE");
  const canUpdate = can("PRODUCT_CATEGORY_UPDATE");
  const isMobile = !useMediaQuery();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([]);
  const [meta, setMeta] = useState<ProductCategoriesListMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategoryDetail, setLoadingCategoryDetail] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [togglingCategoryIds, setTogglingCategoryIds] = useState<string[]>([]);

  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });

  const fetchCategories = useCallback(async () => {
    if (!canReadPage) return;
    setLoading(true);
    setError("");
    try {
      const res = await getProductCategoriesPaginated({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        isActive: statusFilter,
      });
      setCategories(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setError(t("productCategories.loadError"));
      setCategories([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [canReadPage, debouncedSearch, pagination.page, pagination.pageSize, statusFilter, t]);

  const fetchAllCategories = useCallback(async () => {
    if (!canReadPage) return;
    try {
      const res = await getAllProductCategories({ isActive: "all" });
      setAllCategories(res);
    } catch {
      setAllCategories([]);
    }
  }, [canReadPage]);

  useEffect(() => {
    if (debouncedSearch !== "") {
      pagination.resetPage();
    }
  }, [debouncedSearch, pagination.resetPage]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.resetPage, statusFilter]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchCategories();
  }, [canReadPage, fetchCategories]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchAllCategories();
  }, [canReadPage, fetchAllCategories]);

  const parentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    allCategories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [allCategories]);

  const parentOptions = useMemo(
    () =>
      allCategories
        .filter((category) => category.id !== editingCategoryId)
        .map((category) => ({ value: category.id, label: category.name })),
    [allCategories, editingCategoryId],
  );

  const onOpenDrawer = () => {
    setFormError("");
    setNameError("");
    setSlugError("");
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setEditingCategoryId(null);
    setDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    if (submitting || loadingCategoryDetail) return;
    setNameError("");
    setSlugError("");
    setDrawerOpen(false);
  };

  const onFormChange = (field: keyof CategoryForm, value: string) => {
    if (field === "name" && nameError) setNameError("");
    if (field === "slug" && slugError) setSlugError("");

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
  };

  const onEditCategory = async (id: string) => {
    setFormError("");
    setNameError("");
    setSlugError("");
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
      setFormError(t("common.loadError"));
    } finally {
      setLoadingCategoryDetail(false);
    }
  };

  const onSubmitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNameError("");
    setSlugError("");

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
        await updateProductCategory(editingCategoryId, {
          name: trimmedName,
          slug: trimmedSlug,
          description: trimToUndefined(form.description),
          parentId: trimToNull(form.parentId),
        });
      } else {
        await createProductCategory({
          name: trimmedName,
          slug: trimmedSlug,
          description: trimToUndefined(form.description),
          parentId: trimToNull(form.parentId),
          isActive: true,
        });
      }

      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      setNameError("");
      setSlugError("");
      setEditingCategoryId(null);
      setSlugTouched(false);
      await Promise.all([fetchCategories(), fetchAllCategories()]);
    } catch {
      setFormError(t("common.loadError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleCategoryActive = async (category: ProductCategory, next: boolean) => {
    setTogglingCategoryIds((prev) => [...prev, category.id]);
    try {
      await updateProductCategory(category.id, {
        name: category.name,
        slug: category.slug ?? slugifyText(category.name),
        description: nullishToUndefined(category.description),
        parentId: category.parentId ?? null,
        isActive: next,
      });
      await Promise.all([fetchCategories(), fetchAllCategories()]);
    } catch {
      setError(t("common.loadError"));
    } finally {
      setTogglingCategoryIds((prev) => prev.filter((id) => id !== category.id));
    }
  };

  if (!canReadPage) return null;

  return (
    <div className="space-y-4">
      <ProductCategoryFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
        canCreate={canCreate}
        onCreate={onOpenDrawer}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={() => setStatusFilter("all")}
      />

      <ProductCategoryTable
        loading={loading}
        error={error}
        categories={categories}
        parentNameMap={parentNameMap}
        canUpdate={canUpdate}
        togglingCategoryIds={togglingCategoryIds}
        onEditCategory={(id) => void onEditCategory(id)}
        onToggleCategoryActive={(category, next) => void onToggleCategoryActive(category, next)}
        footer={
          meta ? (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={meta.total}
              pageSize={pagination.pageSize}
              pageSizeId="product-categories-page-size"
              loading={loading}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={pagination.onPageSizeChange}
            />
          ) : null
        }
      />

      <ProductCategoryDrawer
        open={drawerOpen}
        editingCategoryId={editingCategoryId}
        submitting={submitting}
        loadingCategoryDetail={loadingCategoryDetail}
        isMobile={isMobile}
        form={form}
        parentOptions={parentOptions}
        formError={formError}
        nameError={nameError}
        slugError={slugError}
        onClose={onCloseDrawer}
        onSubmit={onSubmitCategory}
        onFormChange={onFormChange}
      />
    </div>
  );
}
