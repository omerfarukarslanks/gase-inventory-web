"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import TablePagination from "@/components/ui/TablePagination";
import StoresFilters from "@/components/stores/StoresFilters";
import StoreDrawer from "@/components/stores/StoreDrawer";
import StoresTable from "@/components/stores/StoresTable";
import { EMPTY_FORM, type StoreForm } from "@/components/stores/types";
import { useDebounceStr } from "@/hooks/useDebounce";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSession } from "@/hooks/useSession";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { useLang } from "@/context/LangContext";
import { nullishToUndefined, trimText, trimToUndefined } from "@/lib/payload";
import type { Currency } from "@/lib/products";
import {
  createStore,
  getStoreById,
  getStores,
  updateStore,
  type Store,
  type StoreType,
  type StoresListMeta,
} from "@/lib/stores";

export default function StoresPage() {
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("STORE_READ");
  const { token } = useSession();
  const isMobile = !useMediaQuery();
  const { t } = useLang();

  const [stores, setStores] = useState<Store[]>([]);
  const [meta, setMeta] = useState<StoresListMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingStoreIds, setTogglingStoreIds] = useState<string[]>([]);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editingStoreIsActive, setEditingStoreIsActive] = useState(true);
  const [loadingStoreDetail, setLoadingStoreDetail] = useState(false);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [form, setForm] = useState<StoreForm>(EMPTY_FORM);

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });
  const canCreate = can("STORE_CREATE");
  const canUpdate = can("STORE_UPDATE");
  const storeTypeOptions = [
    { value: "RETAIL", label: t("stores.storeTypeRetail") },
    { value: "WHOLESALE", label: t("stores.storeTypeWholesale") },
  ] as const;

  const normalizeCurrency = (value: string): Currency =>
    value === "USD" || value === "EUR" ? value : "TRY";

  const normalizeStoreType = (value: string): StoreType =>
    value === "WHOLESALE" ? "WHOLESALE" : "RETAIL";

  const fetchStores = useCallback(async () => {
    if (!canReadPage) return;
    setLoading(true);
    setError("");

    try {
      if (!token) {
        setError(t("common.sessionNotFound"));
        setStores([]);
        setMeta(null);
        return;
      }

      const res = await getStores({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        isActive: statusFilter,
        token,
      });

      setStores(res.data);
      setMeta(res.meta);
    } catch {
      setError(t("stores.loadError"));
      setStores([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [canReadPage, debouncedSearch, pagination.page, pagination.pageSize, statusFilter, t, token]);

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
    void fetchStores();
  }, [canReadPage, fetchStores]);

  const onOpenDrawer = () => {
    setFormError("");
    setNameError("");
    setForm(EMPTY_FORM);
    setEditingStoreId(null);
    setEditingStoreIsActive(true);
    setDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    if (submitting || loadingStoreDetail) return;
    setNameError("");
    setDrawerOpen(false);
  };

  const onFormChange = <K extends keyof StoreForm>(field: K, value: StoreForm[K]) => {
    if (field === "name" && nameError) {
      setNameError("");
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onEditStore = async (id: string) => {
    setFormError("");
    setNameError("");
    setLoadingStoreDetail(true);

    try {
      if (!token) {
        setFormError(t("common.sessionNotFound"));
        return;
      }

      const detail = await getStoreById(id, token);
      setForm({
        name: detail.name ?? "",
        storeType: normalizeStoreType(String(detail.storeType ?? "RETAIL")),
        currency: normalizeCurrency(String(detail.currency ?? "TRY")),
        code: detail.code ?? "",
        address: detail.address ?? "",
        slug: detail.slug ?? "",
        logo: detail.logo ?? "",
        description: detail.description ?? "",
      });
      setEditingStoreId(detail.id);
      setEditingStoreIsActive(detail.isActive);
      setDrawerOpen(true);
    } catch {
      setFormError(t("stores.detailLoadError"));
    } finally {
      setLoadingStoreDetail(false);
    }
  };

  const onSubmitStore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNameError("");
    const trimmedName = trimText(form.name);

    if (!trimmedName) {
      setNameError(t("stores.nameRequired"));
      return;
    }

    if (trimmedName.length < 2) {
      setNameError(t("stores.nameMinLength"));
      return;
    }

    if (!token) {
      setFormError(t("common.sessionNotFound"));
      return;
    }

    setSubmitting(true);

    try {
      if (editingStoreId) {
        await updateStore(
          editingStoreId,
          {
            name: trimmedName,
            code: trimToUndefined(form.code),
            address: trimToUndefined(form.address),
            slug: trimToUndefined(form.slug),
            logo: trimToUndefined(form.logo),
            description: trimToUndefined(form.description),
            isActive: editingStoreIsActive,
          },
          token,
        );
      } else {
        await createStore(
          {
            name: trimmedName,
            storeType: form.storeType,
            currency: form.currency,
            code: trimToUndefined(form.code),
            address: trimToUndefined(form.address),
            slug: trimToUndefined(form.slug),
            logo: trimToUndefined(form.logo),
            description: trimToUndefined(form.description),
          },
          token,
        );
      }

      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      setNameError("");
      setEditingStoreId(null);
      setEditingStoreIsActive(true);
      await fetchStores();
    } catch {
      setFormError(editingStoreId ? t("stores.updateError") : t("stores.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  const clearAdvancedFilters = () => {
    setStatusFilter("all");
  };

  const onToggleStoreActive = async (store: Store, next: boolean) => {
    setTogglingStoreIds((prev) => [...prev, store.id]);

    try {
      if (!token) {
        setError(t("common.sessionNotFound"));
        return;
      }

      await updateStore(
        store.id,
        {
          name: store.name,
          code: nullishToUndefined(store.code),
          address: nullishToUndefined(store.address),
          slug: nullishToUndefined(store.slug),
          logo: nullishToUndefined(store.logo),
          description: nullishToUndefined(store.description),
          isActive: next,
        },
        token,
      );
      await fetchStores();
    } catch {
      setError(t("stores.toggleError"));
    } finally {
      setTogglingStoreIds((prev) => prev.filter((id) => id !== store.id));
    }
  };

  if (!canReadPage) return null;

  return (
    <div className="space-y-4">
      <StoresFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
        canCreate={canCreate}
        onCreate={onOpenDrawer}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearAdvancedFilters}
      />

      <StoresTable
        loading={loading}
        error={error}
        stores={stores}
        canUpdate={canUpdate}
        togglingStoreIds={togglingStoreIds}
        onEditStore={(id) => void onEditStore(id)}
        onToggleStoreActive={(store, next) => void onToggleStoreActive(store, next)}
        footer={
          meta ? (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={meta.total}
              pageSize={pagination.pageSize}
              pageSizeId="stores-page-size"
              loading={loading}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={pagination.onPageSizeChange}
            />
          ) : null
        }
      />

      <StoreDrawer
        open={drawerOpen}
        editingStoreId={editingStoreId}
        submitting={submitting}
        loadingStoreDetail={loadingStoreDetail}
        isMobile={isMobile}
        form={form}
        formError={formError}
        nameError={nameError}
        storeTypeOptions={storeTypeOptions}
        onClose={onCloseDrawer}
        onSubmit={onSubmitStore}
        onFormChange={onFormChange}
        normalizeCurrency={normalizeCurrency}
        normalizeStoreType={normalizeStoreType}
      />
    </div>
  );
}
