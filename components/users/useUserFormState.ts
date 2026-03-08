"use client";

import { useCallback, useState } from "react";
import { clearFieldError } from "@/lib/form-errors";
import { trimText } from "@/lib/payload";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import { createUser, updateUser, type User } from "@/lib/users";
import {
  buildCreateUserPayload,
  buildUpdateUserPayload,
} from "@/components/users/payload";
import {
  EMPTY_USER_FORM,
  EMPTY_USER_FORM_ERRORS,
  type UserForm,
  type UserFormErrors,
} from "@/components/users/types";

type UseUserFormStateOptions = {
  onRefresh: () => Promise<void>;
};

export function useUserFormState({ onRefresh }: UseUserFormStateOptions) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const [mode, setMode] = useState<"edit" | "create">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<UserFormErrors>(EMPTY_USER_FORM_ERRORS);
  const drawerState = useCrudFormDrawerState<UserForm>(EMPTY_USER_FORM);
  const {
    drawerOpen: isDrawerOpen,
    submitting: saving,
    form,
    setDrawerOpen,
    setSubmitting: setSaving,
    setForm,
    openCreate: openCreateDrawer,
    closeDrawer: closeFormDrawer,
    completeSubmit,
  } = drawerState;

  const openCreate = useCallback(() => {
    openCreateDrawer(() => {
      setMode("create");
      setSelectedUser(null);
      setFormErrors(EMPTY_USER_FORM_ERRORS);
    });
  }, [openCreateDrawer]);

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
    setDrawerOpen(true);
  }, [setDrawerOpen, setForm]);

  const closeDrawer = useCallback(() => {
    closeFormDrawer(() => {
      setFormErrors(EMPTY_USER_FORM_ERRORS);
    });
  }, [closeFormDrawer]);

  const onFormChange = useCallback(<K extends keyof UserForm>(field: K, value: UserForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (mode !== "create") return;

    switch (field) {
      case "name":
      case "surname":
      case "email":
      case "password":
        setFormErrors((prev) => clearFieldError(prev, field, ""));
        break;
      default:
        break;
    }
  }, [mode, setForm]);

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
      if (mode === "create") {
        await createUser(buildCreateUserPayload(form));
      } else {
        if (!selectedUser) return;
        await updateUser(selectedUser.id, buildUpdateUserPayload(form));
      }

      completeSubmit(() => {
        setFormErrors(EMPTY_USER_FORM_ERRORS);
      });
      await onRefresh();
    } catch {
      alert("İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  }, [completeSubmit, form, mode, onRefresh, selectedUser, validateCreateForm]);

  return {
    mode,
    selectedUser,
    isDrawerOpen,
    form,
    formErrors,
    saving,
    openCreate,
    openEdit,
    closeDrawer,
    onFormChange,
    handleSave,
  };
}
