"use client";

import { useCallback, useState } from "react";
import {
  getCustomerBalance,
  type Customer,
  type CustomerBalance,
} from "@/lib/customers";
import type { CustomersPageMessages } from "@/components/customers/types";

type UseCustomerBalanceStateOptions = {
  messages: CustomersPageMessages;
};

export function useCustomerBalanceState({
  messages,
}: UseCustomerBalanceStateOptions) {
  const [balanceDrawerOpen, setBalanceDrawerOpen] = useState(false);
  const [selectedBalanceCustomerId, setSelectedBalanceCustomerId] = useState<string | null>(null);
  const [selectedBalanceCustomerName, setSelectedBalanceCustomerName] = useState("");
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | null>(null);
  const [customerBalanceLoading, setCustomerBalanceLoading] = useState(false);
  const [customerBalanceError, setCustomerBalanceError] = useState("");

  const loadCustomerBalance = useCallback(async (customerId: string) => {
    setCustomerBalanceLoading(true);
    setCustomerBalanceError("");
    try {
      const balance = await getCustomerBalance(customerId);
      setCustomerBalance(balance);
    } catch {
      setCustomerBalance(null);
      setCustomerBalanceError(messages.loadErrorMessage);
    } finally {
      setCustomerBalanceLoading(false);
    }
  }, [messages.loadErrorMessage]);

  const onOpenBalanceDrawer = useCallback(async (customer: Customer) => {
    const fullName = [customer.name, customer.surname].filter(Boolean).join(" ").trim();
    setSelectedBalanceCustomerId(customer.id);
    setSelectedBalanceCustomerName(fullName || "Musteri");
    setCustomerBalance(null);
    setCustomerBalanceError("");
    setBalanceDrawerOpen(true);
    await loadCustomerBalance(customer.id);
  }, [loadCustomerBalance]);

  const onCloseBalanceDrawer = useCallback(() => {
    if (customerBalanceLoading) return;
    setBalanceDrawerOpen(false);
  }, [customerBalanceLoading]);

  return {
    balanceDrawerOpen,
    selectedBalanceCustomerId,
    selectedBalanceCustomerName,
    customerBalance,
    customerBalanceLoading,
    customerBalanceError,
    loadCustomerBalance,
    onOpenBalanceDrawer,
    onCloseBalanceDrawer,
  };
}
