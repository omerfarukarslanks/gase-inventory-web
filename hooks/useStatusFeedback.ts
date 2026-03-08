"use client";

import { useCallback, useState } from "react";
import { useAutoDismissEffect } from "@/hooks/useAutoDismissEffect";

type UseStatusFeedbackOptions = {
  successDurationMs?: number | null;
  errorDurationMs?: number | null;
};

export function useStatusFeedback({
  successDurationMs = 3000,
  errorDurationMs = null,
}: UseStatusFeedbackOptions = {}) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const clearSuccess = useCallback(() => {
    setSuccess("");
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const clearAll = useCallback(() => {
    setSuccess("");
    setError("");
  }, []);

  const showSuccess = useCallback((message: string) => {
    setError("");
    setSuccess(message);
  }, []);

  const showError = useCallback((message: string) => {
    setSuccess("");
    setError(message);
  }, []);

  useAutoDismissEffect(
    successDurationMs == null ? "" : success,
    clearSuccess,
    successDurationMs ?? 0,
  );

  useAutoDismissEffect(
    errorDurationMs == null ? "" : error,
    clearError,
    errorDurationMs ?? 0,
  );

  return {
    success,
    error,
    setSuccess,
    setError,
    clearSuccess,
    clearError,
    clearAll,
    showSuccess,
    showError,
  };
}
