"use client";

import { useCallback, useMemo, useState } from "react";
import { useLang } from "@/context/LangContext";
import {
  getPermissions,
  getRole,
  replaceRolePermissions,
  type Permission,
  type RoleEntry,
} from "@/lib/permissions";
import { buildReplaceRolePermissionsPayload } from "@/components/permissions/payload";

type UseRolePermissionsFormStateOptions = {
  onRefreshRoles: () => Promise<void>;
};

export function useRolePermissionsFormState({ onRefreshRoles }: UseRolePermissionsFormStateOptions) {
  const { t } = useLang();
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleEntry | null>(null);
  const [allPermsForRole, setAllPermsForRole] = useState<Permission[]>([]);
  const [selectedPermNames, setSelectedPermNames] = useState<Set<string>>(new Set());
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleFormError, setRoleFormError] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  const openRoleDrawer = useCallback(async (role: RoleEntry) => {
    setEditingRole(role);
    setRoleFormError("");
    setSelectedPermNames(new Set());
    setAllPermsForRole([]);
    setRoleDrawerOpen(true);
    setRoleLoading(true);

    try {
      const [rolePerms, allPermsResponse] = await Promise.all([
        getRole(role.role),
        getPermissions({}),
      ]);
      setSelectedPermNames(new Set(rolePerms.map((permission) => permission.name)));
      setAllPermsForRole(allPermsResponse.data);
    } catch {
      setRoleFormError(t("permissions.roleDetailError"));
    } finally {
      setRoleLoading(false);
    }
  }, [t]);

  const onCloseRoleDrawer = useCallback(() => {
    if (roleSubmitting) return;
    setRoleDrawerOpen(false);
  }, [roleSubmitting]);

  const onToggleRolePerm = useCallback((name: string, checked: boolean) => {
    setSelectedPermNames((prev) => {
      const next = new Set(prev);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  }, []);

  const onSaveRolePerms = useCallback(async () => {
    if (!editingRole) return;
    setRoleFormError("");
    setRoleSubmitting(true);
    try {
      await replaceRolePermissions(
        editingRole.role,
        buildReplaceRolePermissionsPayload(selectedPermNames),
      );
      setRoleDrawerOpen(false);
      await onRefreshRoles();
    } catch {
      setRoleFormError(t("permissions.roleUpdateError"));
    } finally {
      setRoleSubmitting(false);
    }
  }, [editingRole, onRefreshRoles, selectedPermNames, t]);

  const groupedPerms = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of allPermsForRole) {
      const items = map.get(permission.group) ?? [];
      items.push(permission);
      map.set(permission.group, items);
    }
    return map;
  }, [allPermsForRole]);

  return {
    roleDrawerOpen,
    editingRole,
    selectedPermNames,
    roleSubmitting,
    roleFormError,
    roleLoading,
    groupedPerms,
    openRoleDrawer,
    onCloseRoleDrawer,
    onToggleRolePerm,
    onSaveRolePerms,
  };
}
