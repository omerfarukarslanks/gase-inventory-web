"use client";

import { useCallback, useState } from "react";
import {
  createCustomer,
  type CreateCustomerRequest,
  type Customer,
} from "@/lib/customers";
import {
  createEmptySaleCustomerPreview,
  mapCustomerToSaleCustomerPreview,
  type SaleCustomerPreview,
} from "@/components/sales/customer-preview";

type UseSaleCustomerStateOptions = {
  onCustomerChanged?: () => void;
};

export function useSaleCustomerState({
  onCustomerChanged,
}: UseSaleCustomerStateOptions = {}) {
  const [customerId, setCustomerId] = useState("");
  const [customerDropdownRefreshKey, setCustomerDropdownRefreshKey] = useState(0);
  const [customerPreview, setCustomerPreview] = useState<SaleCustomerPreview>(
    createEmptySaleCustomerPreview(),
  );

  const applyCustomerState = useCallback((nextCustomerId: string, preview: SaleCustomerPreview) => {
    setCustomerId(nextCustomerId);
    setCustomerPreview(preview);
  }, []);

  const resetCustomerState = useCallback(() => {
    applyCustomerState("", createEmptySaleCustomerPreview());
  }, [applyCustomerState]);

  const handleCustomerIdChange = useCallback((value: string) => {
    onCustomerChanged?.();
    setCustomerId(value);

    if (!value) {
      setCustomerPreview(createEmptySaleCustomerPreview());
    }
  }, [onCustomerChanged]);

  const selectCustomer = useCallback((customer: Customer) => {
    onCustomerChanged?.();
    applyCustomerState(customer.id, mapCustomerToSaleCustomerPreview(customer));
  }, [applyCustomerState, onCustomerChanged]);

  const quickCreateCustomer = useCallback(async (payload: CreateCustomerRequest) => {
    const created = await createCustomer(payload);
    setCustomerDropdownRefreshKey((prev) => prev + 1);
    return created;
  }, []);

  return {
    customerId,
    customerDropdownRefreshKey,
    customerPreview,
    applyCustomerState,
    resetCustomerState,
    handleCustomerIdChange,
    selectCustomer,
    quickCreateCustomer,
  };
}
