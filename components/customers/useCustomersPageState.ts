"use client";

import { useCustomerBalanceState } from "@/components/customers/useCustomerBalanceState";
import { useCustomerFormState } from "@/components/customers/useCustomerFormState";
import { useCustomersListState } from "@/components/customers/useCustomersListState";
import type { CustomersPageMessages } from "@/components/customers/types";

type UseCustomersPageStateOptions = {
  canReadPage: boolean;
  loadErrorMessage: CustomersPageMessages["loadErrorMessage"];
};

export function useCustomersPageState({
  canReadPage,
  loadErrorMessage,
}: UseCustomersPageStateOptions) {
  const messages = {
    loadErrorMessage,
  };
  const listState = useCustomersListState({
    canReadPage,
    messages,
  });
  const formState = useCustomerFormState({
    messages,
    onRefresh: listState.refresh,
  });
  const balanceState = useCustomerBalanceState({
    messages,
  });

  return {
    ...listState,
    ...formState,
    ...balanceState,
  };
}
