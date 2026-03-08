"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { trimText } from "@/lib/payload";
import {
  createAttribute,
  createAttributeValues,
  getAttributeById,
  getAttributesPaginated,
  updateAttribute,
  updateAttributeValue,
  type Attribute,
  type AttributesPaginatedMeta,
  type AttributeValue,
} from "@/lib/attributes";
import { parseCommaSeparated, type DrawerStep, type EditableValue } from "@/components/attributes/types";

type UseAttributesPageStateOptions = {
  canReadPage: boolean;
  loadErrorMessage: string;
};

export function useAttributesPageState({
  canReadPage,
  loadErrorMessage,
}: UseAttributesPageStateOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [meta, setMeta] = useState<AttributesPaginatedMeta | null>(null);
  const [expandedAttributeIds, setExpandedAttributeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
  const [togglingAttributeIds, setTogglingAttributeIds] = useState<string[]>([]);
  const [togglingValueIds, setTogglingValueIds] = useState<string[]>([]);

  const debouncedSearch = useDebounceStr(searchTerm, 300);
  const pagination = useTablePaginationState({
    totalPages: meta?.totalPages ?? 1,
    loading,
  });

  const fetchAttributes = useCallback(async () => {
    if (!canReadPage) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAttributesPaginated({
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        sortOrder: "DESC",
        sortBy: "createdAt",
        isActive: statusFilter,
      });
      setAttributes(res.data);
      setMeta(res.meta);
      setExpandedAttributeIds([]);
    } catch {
      setAttributes([]);
      setMeta(null);
      setError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [canReadPage, debouncedSearch, loadErrorMessage, pagination.page, pagination.pageSize, statusFilter]);

  useEffect(() => {
    if (!canReadPage) return;
    void fetchAttributes();
  }, [canReadPage, fetchAttributes]);

  useEffect(() => {
    pagination.resetPage();
  }, [debouncedSearch, pagination.resetPage, statusFilter]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }, []);

  const openCreateDrawer = useCallback(() => {
    setEditingId(null);
    setWorkingAttribute(null);
    setDrawerStep(1);
    setFormName("");
    setOriginalName("");
    setExistingValues([]);
    setNewValuesInput("");
    setFormError("");
    setDrawerOpen(true);
  }, []);

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
          setSuccess("Ozellik bilgisi guncellendi.");
          await fetchAttributes();
        }
      } else {
        const created = await createAttribute({ name: nextName });
        setEditingId(created.id);
        setWorkingAttribute(created);
        setOriginalName(created.name ?? nextName);
        setSuccess("Ozellik olusturuldu. Deger girisine devam edin.");
        await fetchAttributes();
      }

      setDrawerStep(2);
    } catch {
      setFormError("Ozellik kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }, [editingId, fetchAttributes, formName, originalName, submitting, workingAttribute]);

  const goPrevStep = useCallback(() => {
    setFormError("");
    setDrawerStep(1);
  }, []);

  const toggleAttributeStatus = useCallback(async (attribute: Attribute, next: boolean) => {
    setTogglingAttributeIds((prev) => [...prev, attribute.id]);
    setAttributes((prev) =>
      prev.map((item) => (item.id === attribute.id ? { ...item, isActive: next } : item)),
    );
    try {
      await updateAttribute(attribute.id, { isActive: next });
      setSuccess("Ozellik durumu guncellendi.");
      await fetchAttributes();
    } catch {
      setError("Ozellik durumu guncellenemedi.");
      setAttributes((prev) =>
        prev.map((item) =>
          item.id === attribute.id ? { ...item, isActive: attribute.isActive } : item,
        ),
      );
    } finally {
      setTogglingAttributeIds((prev) => prev.filter((id) => id !== attribute.id));
    }
  }, [fetchAttributes]);

  const toggleAttributeValueStatus = useCallback(async (value: AttributeValue, next: boolean) => {
    setTogglingValueIds((prev) => [...prev, value.id]);
    try {
      await updateAttributeValue(value.id, { isActive: next });
      setSuccess("Deger durumu guncellendi.");
      await fetchAttributes();
    } catch {
      setError("Deger durumu guncellenemedi.");
    } finally {
      setTogglingValueIds((prev) => prev.filter((id) => id !== value.id));
    }
  }, [fetchAttributes]);

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
      setSuccess("Degisiklik yok.");
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
      setSuccess("Degerler kaydedildi.");
      await fetchAttributes();
    } catch {
      setFormError("Kaydetme islemi basarisiz oldu.");
    } finally {
      setSubmitting(false);
    }
  }, [existingValues, fetchAttributes, newValuesInput, workingAttribute]);

  const updateEditableValue = useCallback((id: string, patch: Partial<EditableValue>) => {
    setExistingValues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  return {
    loading,
    error,
    success,
    attributes,
    meta,
    expandedAttributeIds,
    searchTerm,
    statusFilter,
    showAdvancedFilters,
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
    togglingAttributeIds,
    togglingValueIds,
    pagination,
    setSearchTerm,
    setStatusFilter,
    setShowAdvancedFilters,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    goNextStep,
    goPrevStep,
    toggleExpand,
    toggleAttributeStatus,
    toggleAttributeValueStatus,
    handleSave,
    setFormName,
    setNewValuesInput,
    updateEditableValue,
  };
}
