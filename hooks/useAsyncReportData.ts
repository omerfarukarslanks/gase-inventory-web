"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseAsyncReportDataOptions<TData> = {
  initialData: TData;
  load: () => Promise<TData>;
  errorMessage?: string;
  enabled?: boolean;
};

export function useAsyncReportData<TData>({
  initialData,
  load,
  errorMessage = "Veriler yuklenemedi. Lutfen tekrar deneyin.",
  enabled = true,
}: UseAsyncReportDataOptions<TData>) {
  const initialDataRef = useRef(initialData);
  const [data, setData] = useState<TData>(initialDataRef.current);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled) {
      return initialDataRef.current;
    }

    setLoading(true);
    setError("");

    try {
      const nextData = await load();
      setData(nextData);
      return nextData;
    } catch {
      setData(initialDataRef.current);
      setError(errorMessage);
      return initialDataRef.current;
    } finally {
      setLoading(false);
    }
  }, [enabled, errorMessage, load]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError("");
      setData(initialDataRef.current);
      return;
    }

    void refresh();
  }, [enabled, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    setData,
    setError,
  };
}
