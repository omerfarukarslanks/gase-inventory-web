"use client";

import { useCallback, useMemo, useState } from "react";

type UseTablePaginationStateOptions = {
  initialPage?: number;
  initialPageSize?: number;
  totalPages?: number;
  loading?: boolean;
};

export function useTablePaginationState({
  initialPage = 1,
  initialPageSize = 10,
  totalPages = 1,
  loading = false,
}: UseTablePaginationStateOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const safeTotalPages = useMemo(() => Math.max(1, totalPages), [totalPages]);

  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  const onPageSizeChange = useCallback(
    (nextPageSize: number) => {
      setPageSize(nextPageSize);
      setPage(initialPage);
    },
    [initialPage],
  );

  const onPageChange = useCallback(
    (nextPage: number) => {
      if (loading) return;
      const clamped = Math.min(safeTotalPages, Math.max(1, nextPage));
      if (clamped === page) return;
      setPage(clamped);
    },
    [loading, page, safeTotalPages],
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages: safeTotalPages,
    resetPage,
    onPageSizeChange,
    onPageChange,
  };
}
