"use client";

import { type FormEvent, useCallback, useState } from "react";
import { clearStringError, resetStringErrors } from "@/lib/form-errors";
import { trimText } from "@/lib/payload";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from "@/lib/customers";
import {
  buildCreateCustomerPayload,
  buildUpdateCustomerPayload,
} from "@/components/customers/payload";
import {
  EMPTY_FORM,
  type CustomerForm,
  type CustomersPageMessages,
} from "@/components/customers/types";

type UseCustomerFormStateOptions = {
  messages: CustomersPageMessages;
  onRefresh: () => Promise<void>;
};

export function useCustomerFormState({
  messages,
  onRefresh,
}: UseCustomerFormStateOptions) {
  const [editingCustomerIsActive, setEditingCustomerIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const drawerState = useCrudFormDrawerState<CustomerForm>(EMPTY_FORM);
  const {
    drawerOpen,
    submitting,
    loadingDetail: loadingCustomerDetail,
    editingId: editingCustomerId,
    form,
    setDrawerOpen,
    setSubmitting,
    setLoadingDetail: setLoadingCustomerDetail,
    setEditingId: setEditingCustomerId,
    setForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  } = drawerState;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onOpenDrawer = useCallback(() => {
    openCreate(() => {
      setFormError("");
      resetStringErrors(setNameError, setSurnameError, setEmailError);
      setEditingCustomerIsActive(true);
    });
  }, [openCreate]);

  const onCloseDrawer = useCallback(() => {
    closeDrawer(() => {
      resetStringErrors(setNameError, setSurnameError, setEmailError);
    });
  }, [closeDrawer]);

  const onFormChange = useCallback((field: keyof CustomerForm, value: string) => {
    if (field === "name" && nameError) clearStringError(nameError, setNameError);
    if (field === "surname" && surnameError) clearStringError(surnameError, setSurnameError);
    if (field === "email" && emailError) clearStringError(emailError, setEmailError);
    setForm((prev) => ({ ...prev, [field]: value }));
  }, [emailError, nameError, surnameError]);

  const onEditCustomer = useCallback(async (id: string) => {
    setFormError("");
    resetStringErrors(setNameError, setSurnameError, setEmailError);
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
      setFormError(messages.loadErrorMessage);
    } finally {
      setLoadingCustomerDetail(false);
    }
  }, [messages.loadErrorMessage]);

  const onSubmitCustomer = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    resetStringErrors(setNameError, setSurnameError, setEmailError);
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
        await updateCustomer(editingCustomerId, buildUpdateCustomerPayload(form, editingCustomerIsActive));
      } else {
        await createCustomer(buildCreateCustomerPayload(form));
      }

      completeSubmit(() => {
        resetStringErrors(setNameError, setSurnameError, setEmailError);
        setEditingCustomerIsActive(true);
      });
      await onRefresh();
    } catch {
      setFormError(messages.loadErrorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [editingCustomerId, editingCustomerIsActive, form, messages.loadErrorMessage, onRefresh]);

  return {
    drawerOpen,
    submitting,
    editingCustomerId,
    editingCustomerIsActive,
    loadingCustomerDetail,
    formError,
    nameError,
    surnameError,
    emailError,
    form,
    setEditingCustomerIsActive,
    onOpenDrawer,
    onCloseDrawer,
    onFormChange,
    onEditCustomer,
    onSubmitCustomer,
  };
}
