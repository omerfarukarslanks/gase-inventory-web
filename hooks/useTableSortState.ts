"use client";

import { useCallback, useState } from "react";

type SortOrder = "ASC" | "DESC";

type UseTableSortStateOptions = {
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
};

export function useTableSortState({
  initialSortBy,
  initialSortOrder,
}: UseTableSortStateOptions = {}) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(initialSortOrder);

  const handleSort = useCallback((key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      return;
    }

    setSortBy(key);
    setSortOrder("ASC");
  }, [sortBy]);

  const clearSort = useCallback(() => {
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialSortBy, initialSortOrder]);

  return {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    handleSort,
    clearSort,
  };
}
