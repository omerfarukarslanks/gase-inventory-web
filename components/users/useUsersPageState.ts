"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { trimText } from "@/lib/payload";
import { createUser, getUsers, updateUser, type Meta, type User } from "@/lib/users";
import {
  EMPTY_USER_FORM,
  EMPTY_USER_FORM_ERRORS,
  type UserForm,
  type UserFormErrors,
} from "@/components/users/types";

type UseUsersPageStateOptions = {
  canReadPage: boolean;
};

export function useUsersPageState({ canReadPage }: UseUsersPageStateOptions) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingUserIds, setTogglingUserIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"edit" | "create">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [formErrors, setFormErrors] = useState<UserFormErrors>(EMPTY_USER_FORM_ERRORS);
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebounceStr(searchTerm, 500);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });

  const fetchUsers = useCallback(async () => {
    if (!canReadPage) return;
    setLoading(true);
    try {
      const res = await getUsers({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        storeId: storeFilter || undefined,
        isActive: statusFilter,
        sortBy,
        sortOrder,
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch {
      setUsers([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [
    canReadPage,
    debouncedSearch,
    pagination.page,
    pagination.pageSize,
    sortBy,
    sortOrder,
    statusFilter,
    storeFilter,
  ]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchUsers();
  }, [canReadPage, fetchUsers]);

  useEffect(() => {
    if (debouncedSearch !== "") {
      pagination.resetPage();
    }
  }, [debouncedSearch, pagination.resetPage]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.resetPage, storeFilter, statusFilter]);

  const onToggleUserActive = useCallback(
    async (user: User, next: boolean) => {
      setTogglingUserIds((prev) => [...prev, user.id]);
      try {
        await updateUser(user.id, {
          name: user.name,
          surname: user.surname,
          role: user.role,
          storeIds: user.userStores?.map((userStore) => userStore.store.id) || [],
          isActive: next,
        });
        await fetchUsers();
      } catch {
        alert("Kullanıcı durumu güncellenemedi.");
      } finally {
        setTogglingUserIds((prev) => prev.filter((id) => id !== user.id));
      }
    },
    [fetchUsers],
  );

  const clearAdvancedFilters = useCallback(() => {
    setStoreFilter("");
    setStatusFilter("all");
  }, []);

  const handleSort = useCallback((key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      return;
    }
    setSortBy(key);
    setSortOrder("ASC");
  }, [sortBy]);

  const resetForm = useCallback(() => {
    setForm(EMPTY_USER_FORM);
    setFormErrors(EMPTY_USER_FORM_ERRORS);
  }, []);

  const openCreate = useCallback(() => {
    setMode("create");
    setSelectedUser(null);
    resetForm();
    setIsDrawerOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((user: User) => {
    setMode("edit");
    setSelectedUser(user);
    setForm({
      name: user.name,
      surname: user.surname,
      role: user.role,
      email: user.email,
      password: "",
      storeId: user.userStores?.[0]?.store.id ?? "",
    });
    setFormErrors(EMPTY_USER_FORM_ERRORS);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    if (saving) return;
    setIsDrawerOpen(false);
    setFormErrors(EMPTY_USER_FORM_ERRORS);
  }, [saving]);

  const onFormChange = useCallback(<K extends keyof UserForm>(field: K, value: UserForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (mode !== "create") return;

    if (field === "name" && formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: "" }));
    }
    if (field === "surname" && formErrors.surname) {
      setFormErrors((prev) => ({ ...prev, surname: "" }));
    }
    if (field === "email" && formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: "" }));
    }
    if (field === "password" && formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }
  }, [formErrors.email, formErrors.name, formErrors.password, formErrors.surname, mode]);

  const validateCreateForm = useCallback(() => {
    const trimmedName = trimText(form.name);
    const trimmedSurname = trimText(form.surname);
    const trimmedEmail = trimText(form.email);

    const nextErrors: UserFormErrors = {
      name: "",
      surname: "",
      email: "",
      password: "",
    };

    if (!trimmedName) {
      nextErrors.name = "Ad zorunludur.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Ad en az 2 karakter olmalıdır.";
    }

    if (!trimmedSurname) {
      nextErrors.surname = "Soyad zorunludur.";
    } else if (trimmedSurname.length < 2) {
      nextErrors.surname = "Soyad en az 2 karakter olmalıdır.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "E-posta zorunludur.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Geçerli bir e-posta giriniz.";
    }

    if (!form.password) {
      nextErrors.password = "Şifre zorunludur.";
    } else if (!passwordPattern.test(form.password)) {
      nextErrors.password = "Şifre en az 8 karakter olmalı, büyük-küçük harf ve rakam içermelidir.";
    }

    setFormErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  }, [form.email, form.name, form.password, form.surname]);

  const handleSave = useCallback(async () => {
    if (mode === "create" && !validateCreateForm()) return;

    setSaving(true);
    try {
      const trimmedName = trimText(form.name);
      const trimmedSurname = trimText(form.surname);
      const trimmedEmail = trimText(form.email);

      if (mode === "create") {
        await createUser({
          email: trimmedEmail,
          password: form.password,
          name: trimmedName,
          surname: trimmedSurname,
          role: form.role,
          storeIds: form.storeId ? [form.storeId] : [],
        });
      } else {
        if (!selectedUser) return;
        await updateUser(selectedUser.id, {
          name: trimmedName,
          surname: trimmedSurname,
          role: form.role,
          storeIds: form.storeId ? [form.storeId] : [],
        });
      }

      setIsDrawerOpen(false);
      setFormErrors(EMPTY_USER_FORM_ERRORS);
      await fetchUsers();
    } catch {
      alert("İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  }, [fetchUsers, form.email, form.name, form.password, form.role, form.storeId, form.surname, mode, selectedUser, validateCreateForm]);

  return {
    users,
    meta,
    loading,
    searchTerm,
    storeFilter,
    statusFilter,
    showAdvancedFilters,
    sortBy,
    sortOrder,
    togglingUserIds,
    mode,
    selectedUser,
    isDrawerOpen,
    form,
    formErrors,
    saving,
    pagination,
    setSearchTerm,
    setStoreFilter,
    setStatusFilter,
    setShowAdvancedFilters,
    clearAdvancedFilters,
    handleSort,
    openCreate,
    openEdit,
    closeDrawer,
    onFormChange,
    handleSave,
    onToggleUserActive,
  };
}
