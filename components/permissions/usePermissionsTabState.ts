"use client";

import { usePermissionsListState } from "@/components/permissions/usePermissionsListState";
import { usePermissionFormState } from "@/components/permissions/usePermissionFormState";

type UsePermissionsTabStateOptions = {
  canReadPage: boolean;
  active: boolean;
};

export function usePermissionsTabState({ canReadPage, active }: UsePermissionsTabStateOptions) {
  const listState = usePermissionsListState({
    canReadPage,
    active,
  });
  const formState = usePermissionFormState({
    onRefreshPermissions: listState.fetchPermissions,
  });

  return {
    ...listState,
    ...formState,
  };
}
