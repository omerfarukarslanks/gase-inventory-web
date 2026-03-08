"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PermissionName } from "@/lib/authz";
import { useSession } from "@/hooks/useSession";

type PermissionGuardOptions = {
  mode?: "all" | "any";
  redirectTo?: string;
  loginRedirectTo?: string;
};

export function usePermissionGuard(
  requiredPermissions: PermissionName | PermissionName[],
  options: PermissionGuardOptions = {},
): boolean {
  const router = useRouter();
  const { isAuthenticated, isHydrated, permissions } = useSession();
  const { mode = "all", redirectTo = "/dashboard", loginRedirectTo = "/auth/login" } = options;

  const normalizedPermissions = useMemo(
    () => (Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]),
    [requiredPermissions],
  );

  const hasRequiredPermission = useMemo(() => {
    if (normalizedPermissions.length === 0) return true;

    if (mode === "any") {
      return normalizedPermissions.some((permission) => permissions.includes(permission));
    }

    return normalizedPermissions.every((permission) => permissions.includes(permission));
  }, [mode, normalizedPermissions, permissions]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(loginRedirectTo);
      return;
    }

    if (!hasRequiredPermission) {
      router.replace(redirectTo);
    }
  }, [hasRequiredPermission, isAuthenticated, isHydrated, loginRedirectTo, redirectTo, router]);

  return isHydrated && isAuthenticated && hasRequiredPermission;
}
