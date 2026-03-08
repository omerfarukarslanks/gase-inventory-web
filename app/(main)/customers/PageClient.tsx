"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import TablePagination from "@/components/ui/TablePagination";
import {
  createCustomer,
  getCustomerById,
  getCustomerBalance,
  getCustomers,
  updateCustomer,
  type Customer,
  type CustomerBalance,
  type CustomersListMeta,
  type CustomerGender,
} from "@/lib/customers";
import { useDebounceStr } from "@/hooks/useDebounce";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { useLang } from "@/context/LangContext";
import { nullishToUndefined, trimText, trimToUndefined } from "@/lib/payload";
import CustomersFilters from "@/components/customers/CustomersFilters";
import CustomersTable from "@/components/customers/CustomersTable";
import CustomerDrawer from "@/components/customers/CustomerDrawer";
import CustomerBalanceDrawer from "@/components/customers/CustomerBalanceDrawer";
import { EMPTY_FORM, type CustomerForm } from "@/components/customers/types";

export default function CustomersPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("CUSTOMER_READ");
  const canCreate = can("CUSTOMER_CREATE");
  const canUpdate = can("CUSTOMER_UPDATE");
  const isMobile = !useMediaQuery();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<CustomersListMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingCustomerIds, setTogglingCustomerIds] = useState<string[]>([]);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingCustomerIsActive, setEditingCustomerIsActive] = useState(true);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [balanceDrawerOpen, setBalanceDrawerOpen] = useState(false);
  const [selectedBalanceCustomerId, setSelectedBalanceCustomerId] = useState<string | null>(null);
  const [selectedBalanceCustomerName, setSelectedBalanceCustomerName] = useState("");
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | null>(null);
  const [customerBalanceLoading, setCustomerBalanceLoading] = useState(false);
  const [customerBalanceError, setCustomerBalanceError] = useState("");

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fetchCustomers = useCallback(async () => {
    if (!canReadPage) return;
    setLoading(true);
    setError("");
    try {
      const res = await getCustomers({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        isActive: statusFilter,
      });
      setCustomers(res.data);
      setMeta(res.meta);
    } catch {
      setError(t("common.loadError"));
      setCustomers([]);
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
    fetchCustomers();
  }, [canReadPage, fetchCustomers]);

  const onOpenDrawer = () => {
    setFormError("");
    setNameError("");
    setSurnameError("");
    setEmailError("");
    setForm(EMPTY_FORM);
    setEditingCustomerId(null);
    setEditingCustomerIsActive(true);
    setDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    if (submitting || loadingCustomerDetail) return;
    setNameError("");
    setSurnameError("");
    setEmailError("");
    setDrawerOpen(false);
  };

  const onFormChange = (field: keyof CustomerForm, value: string) => {
    if (field === "name" && nameError) setNameError("");
    if (field === "surname" && surnameError) setSurnameError("");
    if (field === "email" && emailError) setEmailError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onEditCustomer = async (id: string) => {
    setFormError("");
    setNameError("");
    setSurnameError("");
    setEmailError("");
    setLoadingCustomerDetail(true);
    try {
      const detail = await getCustomerById(id);
      setForm({
        name: detail.name ?? "",
        surname: detail.surname ?? "",
        address: detail.address ?? "",
        country: detail.country ?? "",
        city: detail.city ?? "",
        district: detail.district ?? "",
        phoneNumber: detail.phoneNumber ?? "",
        email: detail.email ?? "",
        gender: detail.gender ?? "",
        birthDate: detail.birthDate ? String(detail.birthDate).slice(0, 10) : "",
      });
      setEditingCustomerId(detail.id);
      setEditingCustomerIsActive(detail.isActive ?? true);
      setDrawerOpen(true);
    } catch {
      setFormError(t("common.loadError"));
    } finally {
      setLoadingCustomerDetail(false);
    }
  };

  const onSubmitCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNameError("");
    setSurnameError("");
    setEmailError("");
    const trimmedName = trimText(form.name);
    const trimmedSurname = trimText(form.surname);
    const trimmedEmail = trimText(form.email);

    if (!trimmedName) {
      setNameError("Isim alani zorunludur.");
      return;
    }

    if (!trimmedSurname) {
      setSurnameError("Soyisim alani zorunludur.");
      return;
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      setEmailError("Gecerli bir e-posta girin.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomerId) {
        await updateCustomer(editingCustomerId, {
          name: trimmedName,
          surname: trimmedSurname,
          address: trimToUndefined(form.address),
          country: trimToUndefined(form.country),
          city: trimToUndefined(form.city),
          district: trimToUndefined(form.district),
          phoneNumber: trimToUndefined(form.phoneNumber),
          email: trimmedEmail || undefined,
          gender: (form.gender || undefined) as CustomerGender | undefined,
          birthDate: form.birthDate || undefined,
          isActive: editingCustomerIsActive,
        });
      } else {
        await createCustomer({
          name: trimmedName,
          surname: trimmedSurname,
          address: trimToUndefined(form.address),
          country: trimToUndefined(form.country),
          city: trimToUndefined(form.city),
          district: trimToUndefined(form.district),
          phoneNumber: trimToUndefined(form.phoneNumber),
          email: trimmedEmail || undefined,
          gender: (form.gender || undefined) as CustomerGender | undefined,
          birthDate: form.birthDate || undefined,
        });
      }

      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      setNameError("");
      setSurnameError("");
      setEmailError("");
      setEditingCustomerId(null);
      setEditingCustomerIsActive(true);
      await fetchCustomers();
    } catch {
      setFormError(t("common.loadError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleCustomerActive = async (customer: Customer, next: boolean) => {
    setTogglingCustomerIds((prev) => [...prev, customer.id]);
    try {
      await updateCustomer(customer.id, {
        name: customer.name,
        surname: customer.surname,
        address: nullishToUndefined(customer.address),
        country: nullishToUndefined(customer.country),
        city: nullishToUndefined(customer.city),
        district: nullishToUndefined(customer.district),
        phoneNumber: nullishToUndefined(customer.phoneNumber),
        email: nullishToUndefined(customer.email),
        gender: nullishToUndefined(customer.gender),
        birthDate: customer.birthDate ? String(customer.birthDate).slice(0, 10) : undefined,
        isActive: next,
      });
      await fetchCustomers();
    } catch {
      setError(t("common.loadError"));
    } finally {
      setTogglingCustomerIds((prev) => prev.filter((id) => id !== customer.id));
    }
  };

  const loadCustomerBalance = useCallback(async (customerId: string) => {
    setCustomerBalanceLoading(true);
    setCustomerBalanceError("");
    try {
      const balance = await getCustomerBalance(customerId);
      setCustomerBalance(balance);
    } catch {
      setCustomerBalance(null);
      setCustomerBalanceError(t("common.loadError"));
    } finally {
      setCustomerBalanceLoading(false);
    }
  }, [t]);

  const onOpenBalanceDrawer = async (customer: Customer) => {
    const fullName = [customer.name, customer.surname].filter(Boolean).join(" ").trim();
    setSelectedBalanceCustomerId(customer.id);
    setSelectedBalanceCustomerName(fullName || "Musteri");
    setCustomerBalance(null);
    setCustomerBalanceError("");
    setBalanceDrawerOpen(true);
    await loadCustomerBalance(customer.id);
  };

  const onCloseBalanceDrawer = () => {
    if (customerBalanceLoading) return;
    setBalanceDrawerOpen(false);
  };

  if (!canReadPage) return null;

  return (
    <div className="space-y-4">
      <CustomersFilters
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

      <CustomersTable
        loading={loading}
        error={error}
        customers={customers}
        togglingCustomerIds={togglingCustomerIds}
        canUpdate={canUpdate}
        onOpenBalanceDrawer={(customer) => void onOpenBalanceDrawer(customer)}
        onEditCustomer={(id) => void onEditCustomer(id)}
        onToggleCustomerActive={(customer, next) => void onToggleCustomerActive(customer, next)}
        footer={
          meta ? (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={meta.total}
              pageSize={pagination.pageSize}
              pageSizeId="customers-page-size"
              loading={loading}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={pagination.onPageSizeChange}
            />
          ) : null
        }
      />

      <CustomerDrawer
        open={drawerOpen}
        editingCustomerId={editingCustomerId}
        submitting={submitting}
        loadingCustomerDetail={loadingCustomerDetail}
        isMobile={isMobile}
        form={form}
        formError={formError}
        nameError={nameError}
        surnameError={surnameError}
        emailError={emailError}
        editingCustomerIsActive={editingCustomerIsActive}
        onClose={onCloseDrawer}
        onSubmit={onSubmitCustomer}
        onFormChange={onFormChange}
        onEditingCustomerIsActiveChange={setEditingCustomerIsActive}
      />

      <CustomerBalanceDrawer
        open={balanceDrawerOpen}
        onClose={onCloseBalanceDrawer}
        isMobile={isMobile}
        customerBalanceLoading={customerBalanceLoading}
        customerBalanceError={customerBalanceError}
        customerBalance={customerBalance}
        selectedBalanceCustomerId={selectedBalanceCustomerId}
        selectedBalanceCustomerName={selectedBalanceCustomerName}
        onRefresh={() => {
          if (!selectedBalanceCustomerId) return;
          void loadCustomerBalance(selectedBalanceCustomerId);
        }}
      />
    </div>
  );
}
