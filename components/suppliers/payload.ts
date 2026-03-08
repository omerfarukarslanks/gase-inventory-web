"use client";

import { nullishToUndefined, omitUndefined, trimText, trimToUndefined } from "@/lib/payload";
import type { CreateSupplierRequest, Supplier, UpdateSupplierRequest } from "@/lib/suppliers";
import type { SupplierForm } from "@/components/suppliers/types";

export function buildCreateSupplierPayload(form: SupplierForm): CreateSupplierRequest {
  return omitUndefined({
    name: trimText(form.name),
    surname: trimToUndefined(form.surname),
    address: trimToUndefined(form.address),
    phoneNumber: trimToUndefined(form.phoneNumber),
    email: trimToUndefined(form.email),
  });
}

export function buildUpdateSupplierPayload(
  form: SupplierForm,
  isActive: boolean,
): UpdateSupplierRequest {
  return omitUndefined({
    name: trimText(form.name),
    surname: trimToUndefined(form.surname),
    address: trimToUndefined(form.address),
    phoneNumber: trimToUndefined(form.phoneNumber),
    email: trimToUndefined(form.email),
    isActive,
  });
}

export function buildToggleSupplierPayload(
  supplier: Supplier,
  isActive: boolean,
): UpdateSupplierRequest {
  return omitUndefined({
    name: supplier.name,
    surname: nullishToUndefined(supplier.surname),
    address: nullishToUndefined(supplier.address),
    phoneNumber: nullishToUndefined(supplier.phoneNumber),
    email: nullishToUndefined(supplier.email),
    isActive,
  });
}
