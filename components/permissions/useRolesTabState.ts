"use client";

import { useRolesListState } from "@/components/permissions/useRolesListState";
import { useRolePermissionsFormState } from "@/components/permissions/useRolePermissionsFormState";

type UseRolesTabStateOptions = {
  canReadPage: boolean;
  active: boolean;
};

export function useRolesTabState({ canReadPage, active }: UseRolesTabStateOptions) {
  const listState = useRolesListState({
    canReadPage,
    active,
  });
  const formState = useRolePermissionsFormState({
    onRefreshRoles: listState.fetchRoles,
  });

  return {
    ...listState,
    ...formState,
  };
}
