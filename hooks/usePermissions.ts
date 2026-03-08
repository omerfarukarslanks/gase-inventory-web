"use client";

import type { PermissionName } from "@/lib/authz";
import { useSession } from "@/hooks/useSession";

export function usePermissions() {
  const { permissions, isHydrated } = useSession();

  const can = (permission: PermissionName): boolean =>
    permissions.includes(permission);

  const canAny = (perms: PermissionName[]): boolean =>
    perms.some((p) => permissions.includes(p));

  return { can, canAny, permissions, isHydrated };
}
