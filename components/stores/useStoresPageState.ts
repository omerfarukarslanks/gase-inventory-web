"use client";

import { useStoreFormState } from "@/components/stores/useStoreFormState";
import { useStoresListState } from "@/components/stores/useStoresListState";
import type { StoresPageMessages } from "@/components/stores/types";

type UseStoresPageStateOptions = {
  canReadPage: boolean;
  token: string | null;
  isHydrated: boolean;
  messages: StoresPageMessages;
};

export function useStoresPageState({
  canReadPage,
  token,
  isHydrated,
  messages,
}: UseStoresPageStateOptions) {
  const listState = useStoresListState({
    canReadPage,
    token,
    isHydrated,
    messages,
  });
  const formState = useStoreFormState({
    token,
    messages,
    onRefresh: listState.refresh,
  });

  return {
    ...listState,
    ...formState,
  };
}
