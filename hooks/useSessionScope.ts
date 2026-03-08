"use client";

import { useMemo } from "react";
import { useSession } from "@/hooks/useSession";

export function useSessionScope() {
  const { storeIds, storeType, isHydrated } = useSession();

  return useMemo(
    () => ({
      storeIds,
      storeType,
      scopeReady: isHydrated,
      scopedStoreId: storeIds[0] ?? "",
      isWholesaleStoreType: storeType === "WHOLESALE",
      isRetailStoreType: storeType === "RETAIL",
    }),
    [isHydrated, storeIds, storeType],
  );
}
