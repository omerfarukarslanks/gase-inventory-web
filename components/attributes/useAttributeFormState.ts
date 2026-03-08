"use client";

import { useCallback, useState } from "react";
import { trimText } from "@/lib/payload";
import {
  createAttribute,
  createAttributeValues,
  getAttributeById,
  updateAttribute,
  updateAttributeValue,
  type Attribute,
} from "@/lib/attributes";
import {
  parseCommaSeparated,
  type DrawerStep,
  type EditableValue,
} from "@/components/attributes/types";

type UseAttributeFormStateOptions = {
  loadErrorMessage: string;
  onRefresh: () => Promise<void>;
  onSuccess: (message: string) => void;
};

export function useAttributeFormState({
  loadErrorMessage,
  onRefresh,
  onSuccess,
}: UseAttributeFormStateOptions) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState<DrawerStep>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [workingAttribute, setWorkingAttribute] = useState<Attribute | null>(null);
  const [formName, setFormName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [existingValues, setExistingValues] = useState<EditableValue[]>([]);
  const [newValuesInput, setNewValuesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const resetFormState = useCallback(() => {
    setEditingId(null);
    setWorkingAttribute(null);
    setDrawerStep(1);
    setFormName("");
    setOriginalName("");
    setExistingValues([]);
    setNewValuesInput("");
    setFormError("");
  }, []);

  const openCreateDrawer = useCallback(() => {
    resetFormState();
    setDrawerOpen(true);
  }, [resetFormState]);

  const openEditDrawer = useCallback(async (attribute: Attribute) => {
    setEditingId(attribute.id);
    setWorkingAttribute(attribute);
    setDrawerStep(1);
    setFormName(attribute.name);
    setOriginalName(attribute.name);
    setExistingValues([]);
    setNewValuesInput("");
    setFormError("");
    setDrawerOpen(true);
    setDetailLoading(true);

    try {
      const detail = await getAttributeById(attribute.id);
      const values = [...detail.values]
        .sort((a, b) => Number(a.value) - Number(b.value))
        .map((value) => ({
          id: value.id,
          name: value.name ?? "",
          isActive: value.isActive,
          originalName: value.name ?? "",
          originalIsActive: value.isActive,
        }));
      setExistingValues(values);
    } catch {
      setFormError(loadErrorMessage);
    } finally {
      setDetailLoading(false);
    }
  }, [loadErrorMessage]);

  const closeDrawer = useCallback(() => {
    if (submitting) return;
    setDrawerOpen(false);
  }, [submitting]);

  const goNextStep = useCallback(async () => {
    setFormError("");
    const nextName = trimText(formName);

    if (!nextName) {
      setFormError("Ozellik adi zorunludur.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingId && workingAttribute) {
        if (nextName !== trimText(originalName)) {
          await updateAttribute(editingId, { name: nextName });
          setOriginalName(nextName);
          onSuccess("Ozellik bilgisi guncellendi.");
          await onRefresh();
        }
      } else {
        const created = await createAttribute({ name: nextName });
        setEditingId(created.id);
        setWorkingAttribute(created);
        setOriginalName(created.name ?? nextName);
        onSuccess("Ozellik olusturuldu. Deger girisine devam edin.");
        await onRefresh();
      }

      setDrawerStep(2);
    } catch {
      setFormError("Ozellik kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }, [editingId, formName, onRefresh, onSuccess, originalName, submitting, workingAttribute]);

  const goPrevStep = useCallback(() => {
    setFormError("");
    setDrawerStep(1);
  }, []);

  const handleSave = useCallback(async () => {
    setFormError("");
    if (!workingAttribute) {
      setFormError("Ozellik kimligi bulunamadi. Lutfen tekrar deneyin.");
      return;
    }

    const preparedNewValues = parseCommaSeparated(newValuesInput).map((name) => ({ name }));
    const existingValueUpdates = existingValues
      .filter((item) => trimText(item.name) !== item.originalName)
      .map((item) => ({ id: item.id, name: trimText(item.name) }));

    if (existingValueUpdates.some((item) => !item.name)) {
      setFormError("Deger adi bos birakilamaz.");
      return;
    }

    if (preparedNewValues.length === 0 && existingValueUpdates.length === 0) {
      onSuccess("Degisiklik yok.");
      setDrawerOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      if (existingValueUpdates.length > 0) {
        await Promise.all(
          existingValueUpdates.map((value) => updateAttributeValue(value.id, { name: value.name })),
        );
      }

      if (preparedNewValues.length > 0) {
        await createAttributeValues(workingAttribute.value, preparedNewValues);
      }

      setDrawerOpen(false);
      onSuccess("Degerler kaydedildi.");
      await onRefresh();
    } catch {
      setFormError("Kaydetme islemi basarisiz oldu.");
    } finally {
      setSubmitting(false);
    }
  }, [existingValues, newValuesInput, onRefresh, onSuccess, workingAttribute]);

  const updateEditableValue = useCallback((id: string, patch: Partial<EditableValue>) => {
    setExistingValues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  return {
    drawerOpen,
    drawerStep,
    editingId,
    formName,
    originalName,
    existingValues,
    newValuesInput,
    submitting,
    formError,
    detailLoading,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    goNextStep,
    goPrevStep,
    handleSave,
    setFormName,
    setNewValuesInput,
    updateEditableValue,
  };
}
