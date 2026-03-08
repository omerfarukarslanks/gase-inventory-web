"use client";

import { useEffect } from "react";

export function useAutoDismissEffect(
  value: string,
  onDismiss: () => void,
  delayMs: number,
) {
  useEffect(() => {
    if (!value) return;

    const timer = window.setTimeout(() => {
      onDismiss();
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, onDismiss, value]);
}
