"use client";

import { useUsersListState } from "@/components/users/useUsersListState";
import { useUserFormState } from "@/components/users/useUserFormState";

type UseUsersPageStateOptions = {
  canReadPage: boolean;
};

export function useUsersPageState({ canReadPage }: UseUsersPageStateOptions) {
  const listState = useUsersListState({ canReadPage });
  const formState = useUserFormState({ onRefresh: listState.refresh });

  return {
    ...listState,
    ...formState,
  };
}
