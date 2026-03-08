"use client";

import { type FormEvent, useCallback, useState } from "react";
import { clearStringError, resetStringErrors } from "@/lib/form-errors";
import { trimText } from "@/lib/payload";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import type { Currency } from "@/lib/products";
import {
  createStore,
  getStoreById,
  updateStore,
  type StoreType,
} from "@/lib/stores";
import {
  buildCreateStorePayload,
  buildUpdateStorePayload,
} from "@/components/stores/payload";
import {
  EMPTY_FORM,
  type StoreForm,
  type StoresPageMessages,
} from "@/components/stores/types";

type UseStoreFormStateOptions = {
  token: string | null;
  messages: StoresPageMessages;
  onRefresh: () => Promise<void>;
};

export function useStoreFormState({
  token,
  messages,
  onRefresh,
}: UseStoreFormStateOptions) {
  const [editingStoreIsActive, setEditingStoreIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const drawerState = useCrudFormDrawerState<StoreForm>(EMPTY_FORM);
  const {
    drawerOpen,
    submitting,
    loadingDetail: loadingStoreDetail,
    editingId: editingStoreId,
    form,
    setDrawerOpen,
    setSubmitting,
    setLoadingDetail: setLoadingStoreDetail,
    setEditingId: setEditingStoreId,
    setForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  } = drawerState;

  const normalizeCurrency = useCallback((value: string): Currency => (
    value === "USD" || value === "EUR" ? value : "TRY"
  ), []);

  const normalizeStoreType = useCallback((value: string): StoreType => (
    value === "WHOLESALE" ? "WHOLESALE" : "RETAIL"
  ), []);

  const onOpenDrawer = useCallback(() => {
    openCreate(() => {
      setFormError("");
      resetStringErrors(setNameError);
      setEditingStoreIsActive(true);
    });
  }, [openCreate]);

  const onCloseDrawer = useCallback(() => {
    closeDrawer(() => {
      resetStringErrors(setNameError);
    });
  }, [closeDrawer]);

  const onFormChange = useCallback(<K extends keyof StoreForm>(field: K, value: StoreForm[K]) => {
    if (field === "name" && nameError) {
      clearStringError(nameError, setNameError);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  }, [nameError]);

  const onEditStore = useCallback(async (id: string) => {
    setFormError("");
    resetStringErrors(setNameError);
    setLoadingStoreDetail(true);

    try {
      if (!token) {
        setFormError(messages.sessionNotFound);
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
      setFormError(messages.detailLoadError);
    } finally {
      setLoadingStoreDetail(false);
    }
  }, [
    messages.detailLoadError,
    messages.sessionNotFound,
    normalizeCurrency,
    normalizeStoreType,
    token,
  ]);

  const onSubmitStore = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    resetStringErrors(setNameError);
    const trimmedName = trimText(form.name);

    if (!trimmedName) {
      setNameError(messages.nameRequired);
      return;
    }

    if (trimmedName.length < 2) {
      setNameError(messages.nameMinLength);
      return;
    }

    if (!token) {
      setFormError(messages.sessionNotFound);
      return;
    }

    setSubmitting(true);

    try {
      if (editingStoreId) {
        await updateStore(
          editingStoreId,
          buildUpdateStorePayload(form, editingStoreIsActive),
          token,
        );
      } else {
        await createStore(
          buildCreateStorePayload(form),
          token,
        );
      }

      completeSubmit(() => {
        resetStringErrors(setNameError);
        setEditingStoreIsActive(true);
      });
      await onRefresh();
    } catch {
      setFormError(editingStoreId ? messages.updateError : messages.createError);
    } finally {
      setSubmitting(false);
    }
  }, [
    editingStoreId,
    editingStoreIsActive,
    form,
    messages.createError,
    messages.nameMinLength,
    messages.nameRequired,
    messages.sessionNotFound,
    messages.updateError,
    onRefresh,
    token,
  ]);

  return {
    drawerOpen,
    submitting,
    editingStoreId,
    editingStoreIsActive,
    loadingStoreDetail,
    formError,
    nameError,
    form,
    normalizeCurrency,
    normalizeStoreType,
    setEditingStoreIsActive,
    onOpenDrawer,
    onCloseDrawer,
    onFormChange,
    onEditStore,
    onSubmitStore,
  };
}
