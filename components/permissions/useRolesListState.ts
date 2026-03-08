"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";
import { getRoles, type RoleEntry } from "@/lib/permissions";

type UseRolesListStateOptions = {
  canReadPage: boolean;
  active: boolean;
};

export function useRolesListState({ canReadPage, active }: UseRolesListStateOptions) {
  const { t } = useLang();
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  const fetchRoles = useCallback(async () => {
    if (!canReadPage) return;
    setRolesLoading(true);
    setRolesError("");
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch {
      setRolesError(t("permissions.rolesLoadError"));
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [canReadPage, t]);

  useEffect(() => {
    if (!canReadPage || !active) return;
    void fetchRoles();
  }, [active, canReadPage, fetchRoles]);

  return {
    roles,
    rolesLoading,
    rolesError,
    fetchRoles,
  };
}
