"use client";

import { useSupplierFormState } from "@/components/suppliers/useSupplierFormState";
import { useSuppliersListState } from "@/components/suppliers/useSuppliersListState";
import type { SuppliersPageMessages } from "@/components/suppliers/types";

type UseSuppliersPageStateOptions = {
  canReadPage: boolean;
  loadErrorMessage: SuppliersPageMessages["loadErrorMessage"];
  detailLoadErrorMessage: SuppliersPageMessages["detailLoadErrorMessage"];
};

export function useSuppliersPageState({
  canReadPage,
  loadErrorMessage,
  detailLoadErrorMessage,
}: UseSuppliersPageStateOptions) {
  const messages = {
    loadErrorMessage,
    detailLoadErrorMessage,
  };
  const listState = useSuppliersListState({
    canReadPage,
    messages,
  });
  const formState = useSupplierFormState({
    messages,
    onRefresh: listState.refresh,
  });

  return {
    ...listState,
    ...formState,
  };
}
