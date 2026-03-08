"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPermissions,
  getRole,
  getRoles,
  replaceRolePermissions,
  type Permission,
  type RoleEntry,
} from "@/lib/permissions";

type UseRolesTabStateOptions = {
  canReadPage: boolean;
  active: boolean;
};

export function useRolesTabState({ canReadPage, active }: UseRolesTabStateOptions) {
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleEntry | null>(null);
  const [allPermsForRole, setAllPermsForRole] = useState<Permission[]>([]);
  const [selectedPermNames, setSelectedPermNames] = useState<Set<string>>(new Set());
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleFormError, setRoleFormError] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!canReadPage) return;
    setRolesLoading(true);
    setRolesError("");
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch {
      setRolesError("Roller yüklenemedi. Lütfen tekrar deneyin.");
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [canReadPage]);

  useEffect(() => {
    if (!canReadPage || !active) return;
    void fetchRoles();
  }, [active, canReadPage, fetchRoles]);

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
      setRoleFormError("Yetki bilgileri yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setRoleLoading(false);
    }
  }, []);

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
      await replaceRolePermissions(editingRole.role, {
        permissionNames: [...selectedPermNames],
        isActive: true,
      });
      setRoleDrawerOpen(false);
      await fetchRoles();
    } catch {
      setRoleFormError("Rol yetkileri güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setRoleSubmitting(false);
    }
  }, [editingRole, fetchRoles, selectedPermNames]);

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
    roles,
    rolesLoading,
    rolesError,
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
