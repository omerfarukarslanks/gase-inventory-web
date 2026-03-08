"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SessionStoreType } from "@/lib/session-user";
import { useSession } from "@/hooks/useSession";

export function useStoreTypeGuard(
  requiredStoreType: SessionStoreType,
  redirectTo = "/dashboard",
): boolean {
  const router = useRouter();
  const { isAuthenticated, isHydrated, storeType } = useSession();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (storeType !== requiredStoreType) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrated, redirectTo, requiredStoreType, router, storeType]);

  return isHydrated && isAuthenticated && storeType === requiredStoreType;
}
