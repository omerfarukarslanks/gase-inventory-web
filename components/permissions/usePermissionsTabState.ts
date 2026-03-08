"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPermission,
  getPermissions,
  updatePermission,
  type Permission,
  type PermissionListMeta,
} from "@/lib/permissions";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { EMPTY_PERM_FORM, type PermForm } from "@/components/permissions/types";

type UsePermissionsTabStateOptions = {
  canReadPage: boolean;
  active: boolean;
};

export function usePermissionsTabState({ canReadPage, active }: UsePermissionsTabStateOptions) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permMeta, setPermMeta] = useState<PermissionListMeta | null>(null);
  const [permSearch, setPermSearch] = useState("");
  const [permStatusFilter, setPermStatusFilter] = useState<boolean | "all">("all");
  const [showPermFilters, setShowPermFilters] = useState(false);
  const [permLoading, setPermLoading] = useState(true);
  const [permError, setPermError] = useState("");
  const [togglingPermIds, setTogglingPermIds] = useState<string[]>([]);
  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [editingPermId, setEditingPermId] = useState<string | null>(null);
  const [permForm, setPermForm] = useState<PermForm>(EMPTY_PERM_FORM);
  const [permFormError, setPermFormError] = useState("");
  const [permNameError, setPermNameError] = useState("");
  const [permDescError, setPermDescError] = useState("");
  const [permGroupError, setPermGroupError] = useState("");
  const [permSubmitting, setPermSubmitting] = useState(false);

  const debouncedPermSearch = useDebounceStr(permSearch, 500);
  const pagination = useTablePaginationState({
    initialPageSize: 20,
    totalPages: permMeta?.totalPages ?? 1,
    loading: permLoading,
  });

  const fetchPermissions = useCallback(async () => {
    if (!canReadPage) return;
    setPermLoading(true);
    setPermError("");
    try {
      const response = await getPermissions({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedPermSearch || undefined,
        isActive: permStatusFilter,
      });
      setPermissions(response.data);
      setPermMeta(response.meta);
    } catch {
      setPermError("Yetkiler yüklenemedi. Lütfen tekrar deneyin.");
      setPermissions([]);
      setPermMeta(null);
    } finally {
      setPermLoading(false);
    }
  }, [canReadPage, debouncedPermSearch, pagination.page, pagination.pageSize, permStatusFilter]);

  useEffect(() => {
    if (debouncedPermSearch !== "") pagination.resetPage();
  }, [debouncedPermSearch, pagination.resetPage]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.resetPage, permStatusFilter]);

  useEffect(() => {
    if (!canReadPage || !active) return;
    void fetchPermissions();
  }, [active, canReadPage, fetchPermissions]);

  const permTotalPages = pagination.totalPages;

  const onTogglePermActive = useCallback(async (perm: Permission, next: boolean) => {
    setTogglingPermIds((prev) => [...prev, perm.id]);
    try {
      await updatePermission(perm.id, { isActive: next });
      await fetchPermissions();
    } catch {
      setPermError("Yetki durumu güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setTogglingPermIds((prev) => prev.filter((id) => id !== perm.id));
    }
  }, [fetchPermissions]);

  const openCreatePermDrawer = useCallback(() => {
    setEditingPermId(null);
    setPermForm(EMPTY_PERM_FORM);
    setPermFormError("");
    setPermNameError("");
    setPermDescError("");
    setPermGroupError("");
    setPermDrawerOpen(true);
  }, []);

  const openEditPermDrawer = useCallback((perm: Permission) => {
    setEditingPermId(perm.id);
    setPermForm({
      name: perm.name,
      description: perm.description,
      group: perm.group,
      isActive: perm.isActive,
    });
    setPermFormError("");
    setPermNameError("");
    setPermDescError("");
    setPermGroupError("");
    setPermDrawerOpen(true);
  }, []);

  const onClosePermDrawer = useCallback(() => {
    if (permSubmitting) return;
    setPermDrawerOpen(false);
  }, [permSubmitting]);

  const onPermFormChange = useCallback((field: keyof PermForm, value: string | boolean) => {
    if (field === "name" && permNameError) setPermNameError("");
    if (field === "description" && permDescError) setPermDescError("");
    if (field === "group" && permGroupError) setPermGroupError("");
    setPermForm((prev) => ({ ...prev, [field]: value }));
  }, [permDescError, permGroupError, permNameError]);

  const validatePermForm = useCallback(() => {
    let valid = true;
    if (!permForm.name.trim()) {
      setPermNameError("Ad zorunludur.");
      valid = false;
    }
    if (!permForm.description.trim()) {
      setPermDescError("Açıklama zorunludur.");
      valid = false;
    }
    if (!permForm.group.trim()) {
      setPermGroupError("Grup zorunludur.");
      valid = false;
    }
    return valid;
  }, [permForm.description, permForm.group, permForm.name]);

  const onSubmitPermForm = useCallback(async () => {
    setPermFormError("");
    if (!validatePermForm()) return;

    setPermSubmitting(true);
    try {
      if (editingPermId) {
        await updatePermission(editingPermId, {
          description: permForm.description.trim(),
          group: permForm.group.trim(),
          isActive: permForm.isActive,
        });
      } else {
        await createPermission({
          name: permForm.name.trim(),
          description: permForm.description.trim(),
          group: permForm.group.trim(),
          isActive: permForm.isActive,
        });
      }
      setPermDrawerOpen(false);
      await fetchPermissions();
    } catch {
      setPermFormError(editingPermId ? "Yetki güncellenemedi." : "Yetki oluşturulamadı.");
    } finally {
      setPermSubmitting(false);
    }
  }, [editingPermId, fetchPermissions, permForm.description, permForm.group, permForm.isActive, permForm.name, validatePermForm]);

  return {
    permissions,
    permMeta,
    permPage: pagination.page,
    permPageSize: pagination.pageSize,
    permSearch,
    permStatusFilter,
    showPermFilters,
    permLoading,
    permError,
    togglingPermIds,
    permDrawerOpen,
    editingPermId,
    permForm,
    permFormError,
    permNameError,
    permDescError,
    permGroupError,
    permSubmitting,
    permTotalPages,
    setPermPage: pagination.setPage,
    setPermSearch,
    setPermStatusFilter,
    setShowPermFilters,
    onPermPageSizeChange: pagination.onPageSizeChange,
    onTogglePermActive,
    openCreatePermDrawer,
    openEditPermDrawer,
    onClosePermDrawer,
    onPermFormChange,
    onSubmitPermForm,
  };
}
