"use client";

import { useCallback, useState } from "react";

export function useCrudFormDrawerState<TForm>(emptyForm: TForm) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TForm>(emptyForm);

  const resetCoreState = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
  }, [emptyForm]);

  const openCreate = useCallback((onReset?: () => void) => {
    resetCoreState();
    onReset?.();
    setDrawerOpen(true);
  }, [resetCoreState]);

  const closeDrawer = useCallback((onBeforeClose?: () => void) => {
    if (submitting || loadingDetail) return false;
    onBeforeClose?.();
    setDrawerOpen(false);
    return true;
  }, [loadingDetail, submitting]);

  const completeSubmit = useCallback((onReset?: () => void) => {
    setDrawerOpen(false);
    resetCoreState();
    onReset?.();
  }, [resetCoreState]);

  return {
    drawerOpen,
    submitting,
    loadingDetail,
    editingId,
    form,
    setDrawerOpen,
    setSubmitting,
    setLoadingDetail,
    setEditingId,
    setForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  };
}
