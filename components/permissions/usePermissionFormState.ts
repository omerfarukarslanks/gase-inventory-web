"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/context/LangContext";
import { createPermission, updatePermission, type Permission } from "@/lib/permissions";
import { clearStringError, resetStringErrors } from "@/lib/form-errors";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import {
  buildCreatePermissionPayload,
  buildUpdatePermissionPayload,
} from "@/components/permissions/payload";
import { EMPTY_PERM_FORM, type PermForm } from "@/components/permissions/types";

type UsePermissionFormStateOptions = {
  onRefreshPermissions: () => Promise<void>;
};

export function usePermissionFormState({ onRefreshPermissions }: UsePermissionFormStateOptions) {
  const { t } = useLang();
  const [permFormError, setPermFormError] = useState("");
  const [permNameError, setPermNameError] = useState("");
  const [permDescError, setPermDescError] = useState("");
  const [permGroupError, setPermGroupError] = useState("");
  const drawerState = useCrudFormDrawerState<PermForm>(EMPTY_PERM_FORM);
  const {
    drawerOpen: permDrawerOpen,
    submitting: permSubmitting,
    editingId: editingPermId,
    form: permForm,
    setDrawerOpen: setPermDrawerOpen,
    setSubmitting: setPermSubmitting,
    setEditingId: setEditingPermId,
    setForm: setPermForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  } = drawerState;

  const openCreatePermDrawer = useCallback(() => {
    openCreate(() => {
      setPermFormError("");
      resetStringErrors(setPermNameError, setPermDescError, setPermGroupError);
    });
  }, [openCreate]);

  const openEditPermDrawer = useCallback((perm: Permission) => {
    setEditingPermId(perm.id);
    setPermForm({
      name: perm.name,
      description: perm.description,
      group: perm.group,
      isActive: perm.isActive,
    });
    setPermFormError("");
    resetStringErrors(setPermNameError, setPermDescError, setPermGroupError);
    setPermDrawerOpen(true);
  }, [setPermDrawerOpen, setPermForm]);

  const onClosePermDrawer = useCallback(() => {
    closeDrawer(() => {
      resetStringErrors(setPermNameError, setPermDescError, setPermGroupError);
    });
  }, [closeDrawer]);

  const onPermFormChange = useCallback((field: keyof PermForm, value: string | boolean) => {
    if (field === "name") clearStringError(permNameError, setPermNameError);
    if (field === "description") clearStringError(permDescError, setPermDescError);
    if (field === "group") clearStringError(permGroupError, setPermGroupError);
    setPermForm((prev) => ({ ...prev, [field]: value }));
  }, [permDescError, permGroupError, permNameError]);

  const validatePermForm = useCallback(() => {
    let valid = true;
    if (!permForm.name.trim()) {
      setPermNameError(t("permissions.nameRequired"));
      valid = false;
    }
    if (!permForm.description.trim()) {
      setPermDescError(t("permissions.descRequired"));
      valid = false;
    }
    if (!permForm.group.trim()) {
      setPermGroupError(t("permissions.groupRequired"));
      valid = false;
    }
    return valid;
  }, [permForm.description, permForm.group, permForm.name, t]);

  const onSubmitPermForm = useCallback(async () => {
    setPermFormError("");
    if (!validatePermForm()) return;

    setPermSubmitting(true);
    try {
      if (editingPermId) {
        await updatePermission(editingPermId, buildUpdatePermissionPayload(permForm));
      } else {
        await createPermission(buildCreatePermissionPayload(permForm));
      }
      completeSubmit(() => {
        resetStringErrors(setPermNameError, setPermDescError, setPermGroupError);
      });
      await onRefreshPermissions();
    } catch {
      setPermFormError(editingPermId ? t("permissions.updateError") : t("permissions.createError"));
    } finally {
      setPermSubmitting(false);
    }
  }, [
    editingPermId,
    completeSubmit,
    onRefreshPermissions,
    permForm,
    t,
    validatePermForm,
  ]);

  return {
    permDrawerOpen,
    editingPermId,
    permForm,
    permFormError,
    permNameError,
    permDescError,
    permGroupError,
    permSubmitting,
    openCreatePermDrawer,
    openEditPermDrawer,
    onClosePermDrawer,
    onPermFormChange,
    onSubmitPermForm,
  };
}
