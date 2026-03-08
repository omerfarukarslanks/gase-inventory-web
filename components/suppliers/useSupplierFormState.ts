"use client";

import { type FormEvent, useCallback, useState } from "react";
import { clearStringError, resetStringErrors } from "@/lib/form-errors";
import { trimText } from "@/lib/payload";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import {
  createSupplier,
  getSupplierById,
  updateSupplier,
} from "@/lib/suppliers";
import {
  buildCreateSupplierPayload,
  buildUpdateSupplierPayload,
} from "@/components/suppliers/payload";
import {
  EMPTY_FORM,
  type SupplierForm,
  type SuppliersPageMessages,
} from "@/components/suppliers/types";

type UseSupplierFormStateOptions = {
  messages: SuppliersPageMessages;
  onRefresh: () => Promise<void>;
};

export function useSupplierFormState({
  messages,
  onRefresh,
}: UseSupplierFormStateOptions) {
  const [editingSupplierIsActive, setEditingSupplierIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const drawerState = useCrudFormDrawerState<SupplierForm>(EMPTY_FORM);
  const {
    drawerOpen,
    submitting,
    loadingDetail: loadingSupplierDetail,
    editingId: editingSupplierId,
    form,
    setDrawerOpen,
    setSubmitting,
    setLoadingDetail: setLoadingSupplierDetail,
    setEditingId: setEditingSupplierId,
    setForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  } = drawerState;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onOpenDrawer = useCallback(() => {
    openCreate(() => {
      setFormError("");
      resetStringErrors(setNameError, setEmailError);
      setEditingSupplierIsActive(true);
    });
  }, [openCreate]);

  const onCloseDrawer = useCallback(() => {
    closeDrawer(() => {
      resetStringErrors(setNameError, setEmailError);
    });
  }, [closeDrawer]);

  const onFormChange = useCallback((field: keyof SupplierForm, value: string) => {
    if (field === "name" && nameError) {
      clearStringError(nameError, setNameError);
    }
    if (field === "email" && emailError) {
      clearStringError(emailError, setEmailError);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  }, [emailError, nameError]);

  const onEditSupplier = useCallback(async (id: string) => {
    setFormError("");
    resetStringErrors(setNameError, setEmailError);
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
      setFormError(messages.detailLoadErrorMessage);
    } finally {
      setLoadingSupplierDetail(false);
    }
  }, [messages.detailLoadErrorMessage]);

  const onSubmitSupplier = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    resetStringErrors(setNameError, setEmailError);
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
        await updateSupplier(editingSupplierId, buildUpdateSupplierPayload(form, editingSupplierIsActive));
      } else {
        await createSupplier(buildCreateSupplierPayload(form));
      }

      completeSubmit(() => {
        resetStringErrors(setNameError, setEmailError);
        setEditingSupplierIsActive(true);
      });
      await onRefresh();
    } catch {
      setFormError(messages.loadErrorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [editingSupplierId, editingSupplierIsActive, form, messages.loadErrorMessage, onRefresh]);

  return {
    drawerOpen,
    submitting,
    editingSupplierId,
    editingSupplierIsActive,
    loadingSupplierDetail,
    formError,
    nameError,
    emailError,
    form,
    setEditingSupplierIsActive,
    onOpenDrawer,
    onCloseDrawer,
    onFormChange,
    onEditSupplier,
    onSubmitSupplier,
  };
}
