"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { getStores, type Store } from "@/lib/stores";

/**
 * Fetches all stores (page 1, limit 100) whenever the active session token is ready.
 * Returns the store list.
 */
export function useStores(): Store[] {
  const [stores, setStores] = useState<Store[]>([]);
  const { token, isHydrated } = useSession();

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      setStores([]);
      return;
    }

    getStores({ token, page: 1, limit: 100 })
      .then((res) => setStores(res.data))
      .catch(() => setStores([]));
  }, [isHydrated, token]);

  return stores;
}
