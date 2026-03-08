"use client";

import { useState } from "react";
import { useAutoDismissEffect } from "@/hooks/useAutoDismissEffect";
import { useAttributeFormState } from "@/components/attributes/useAttributeFormState";
import { useAttributesListState } from "@/components/attributes/useAttributesListState";

type UseAttributesPageStateOptions = {
  canReadPage: boolean;
  loadErrorMessage: string;
};

export function useAttributesPageState({
  canReadPage,
  loadErrorMessage,
}: UseAttributesPageStateOptions) {
  const [success, setSuccess] = useState("");
  const listState = useAttributesListState({
    canReadPage,
    loadErrorMessage,
    onSuccess: setSuccess,
  });

  useAutoDismissEffect(success, () => {
    setSuccess("");
  }, 3000);

  useAutoDismissEffect(listState.error, () => {
    listState.setError("");
  }, 5000);

  const formState = useAttributeFormState({
    loadErrorMessage,
    onRefresh: listState.refresh,
    onSuccess: setSuccess,
  });

  return {
    success,
    ...listState,
    ...formState,
  };
}
