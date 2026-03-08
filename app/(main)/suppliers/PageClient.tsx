"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import SuppliersFilters from "@/components/suppliers/SuppliersFilters";
import SupplierDrawer from "@/components/suppliers/SupplierDrawer";
import SuppliersTable from "@/components/suppliers/SuppliersTable";
import { EMPTY_FORM, type SupplierForm } from "@/components/suppliers/types";
import TablePagination from "@/components/ui/TablePagination";
import { useDebounceStr } from "@/hooks/useDebounce";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { useLang } from "@/context/LangContext";
import { nullishToUndefined, trimText, trimToUndefined } from "@/lib/payload";
import {
  createSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
  type Supplier,
  type SuppliersListMeta,
} from "@/lib/suppliers";

export default function SuppliersPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("SUPPLIER_READ");
  const isMobile = !useMediaQuery();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState<SuppliersListMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingSupplierIds, setTogglingSupplierIds] = useState<string[]>([]);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [editingSupplierIsActive, setEditingSupplierIsActive] = useState(true);
  const [loadingSupplierDetail, setLoadingSupplierDetail] = useState(false);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const canCreate = can("SUPPLIER_CREATE");
  const canUpdate = can("SUPPLIER_UPDATE");

  const fetchSuppliers = useCallback(async () => {
    if (!canReadPage) return;
    setLoading(true);
    setError("");

    try {
      const res = await getSuppliers({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        isActive: statusFilter,
      });
      setSuppliers(res.data);
      setMeta(res.meta);
    } catch {
      setError(t("common.loadError"));
      setSuppliers([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [canReadPage, debouncedSearch, pagination.page, pagination.pageSize, statusFilter, t]);

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
    void fetchSuppliers();
  }, [canReadPage, fetchSuppliers]);

  const onOpenDrawer = () => {
    setFormError("");
    setNameError("");
    setEmailError("");
    setForm(EMPTY_FORM);
    setEditingSupplierId(null);
    setEditingSupplierIsActive(true);
    setDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    if (submitting || loadingSupplierDetail) return;
    setNameError("");
    setEmailError("");
    setDrawerOpen(false);
  };

  const onFormChange = (field: keyof SupplierForm, value: string) => {
    if (field === "name" && nameError) {
      setNameError("");
    }
    if (field === "email" && emailError) {
      setEmailError("");
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onEditSupplier = async (id: string) => {
    setFormError("");
    setNameError("");
    setEmailError("");
    setLoadingSupplierDetail(true);

    try {
      const detail = await getSupplierById(id);
      setForm({
        name: detail.name ?? "",
        surname: detail.surname ?? "",
        address: detail.address ?? "",
        phoneNumber: detail.phoneNumber ?? "",
        email: detail.email ?? "",
      });
      setEditingSupplierId(detail.id);
      setEditingSupplierIsActive(detail.isActive ?? true);
      setDrawerOpen(true);
    } catch {
      setFormError(t("suppliers.loadingDetail"));
    } finally {
      setLoadingSupplierDetail(false);
    }
  };

  const onSubmitSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNameError("");
    setEmailError("");
    const trimmedName = trimText(form.name);
    const trimmedEmail = trimText(form.email);

    if (!trimmedName) {
      setNameError("Isim alani zorunludur.");
      return;
    }

    if (trimmedName.length < 2) {
      setNameError("Isim en az 2 karakter olmalidir.");
      return;
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      setEmailError("Gecerli bir e-posta girin.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingSupplierId) {
        await updateSupplier(editingSupplierId, {
          name: trimmedName,
          surname: trimToUndefined(form.surname),
          address: trimToUndefined(form.address),
          phoneNumber: trimToUndefined(form.phoneNumber),
          email: trimmedEmail || undefined,
          isActive: editingSupplierIsActive,
        });
      } else {
        await createSupplier({
          name: trimmedName,
          surname: trimToUndefined(form.surname),
          address: trimToUndefined(form.address),
          phoneNumber: trimToUndefined(form.phoneNumber),
          email: trimmedEmail || undefined,
        });
      }

      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      setNameError("");
      setEmailError("");
      setEditingSupplierId(null);
      setEditingSupplierIsActive(true);
      await fetchSuppliers();
    } catch {
      setFormError(t("common.loadError"));
    } finally {
      setSubmitting(false);
    }
  };

  const clearAdvancedFilters = () => {
    setStatusFilter("all");
  };

  const onToggleSupplierActive = async (supplier: Supplier, next: boolean) => {
    setTogglingSupplierIds((prev) => [...prev, supplier.id]);

    try {
      await updateSupplier(supplier.id, {
        name: supplier.name,
        surname: nullishToUndefined(supplier.surname),
        address: nullishToUndefined(supplier.address),
        phoneNumber: nullishToUndefined(supplier.phoneNumber),
        email: nullishToUndefined(supplier.email),
        isActive: next,
      });
      await fetchSuppliers();
    } catch {
      setError(t("common.loadError"));
    } finally {
      setTogglingSupplierIds((prev) => prev.filter((id) => id !== supplier.id));
    }
  };

  if (!canReadPage) return null;

  return (
    <div className="space-y-4">
      <SuppliersFilters
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

      <SuppliersTable
        loading={loading}
        error={error}
        suppliers={suppliers}
        canUpdate={canUpdate}
        togglingSupplierIds={togglingSupplierIds}
        onEditSupplier={(id) => void onEditSupplier(id)}
        onToggleSupplierActive={(supplier, next) => void onToggleSupplierActive(supplier, next)}
        footer={
          meta ? (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={meta.total}
              pageSize={pagination.pageSize}
              pageSizeId="suppliers-page-size"
              loading={loading}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={pagination.onPageSizeChange}
            />
          ) : null
        }
      />

      <SupplierDrawer
        open={drawerOpen}
        editingSupplierId={editingSupplierId}
        submitting={submitting}
        loadingSupplierDetail={loadingSupplierDetail}
        isMobile={isMobile}
        form={form}
        formError={formError}
        nameError={nameError}
        emailError={emailError}
        editingSupplierIsActive={editingSupplierIsActive}
        onClose={onCloseDrawer}
        onSubmit={onSubmitSupplier}
        onFormChange={onFormChange}
        onEditingSupplierIsActiveChange={setEditingSupplierIsActive}
      />
    </div>
  );
}
