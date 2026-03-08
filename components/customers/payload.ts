"use client";

import {
  nullishToUndefined,
  omitUndefined,
  trimText,
  trimToUndefined,
} from "@/lib/payload";
import type {
  CreateCustomerRequest,
  Customer,
  CustomerGender,
  UpdateCustomerRequest,
} from "@/lib/customers";
import type { CustomerForm } from "@/components/customers/types";

function toCustomerGender(value: string | null | undefined): CustomerGender | undefined {
  const normalized = trimToUndefined(value);
  return normalized ? (normalized as CustomerGender) : undefined;
}

function normalizeBirthDate(value: string | null | undefined): string | undefined {
  const normalized = trimToUndefined(value);
  return normalized ? normalized.slice(0, 10) : undefined;
}

export function buildCreateCustomerPayload(form: CustomerForm): CreateCustomerRequest {
  return omitUndefined({
    name: trimText(form.name),
    surname: trimText(form.surname),
    address: trimToUndefined(form.address),
    country: trimToUndefined(form.country),
    city: trimToUndefined(form.city),
    district: trimToUndefined(form.district),
    phoneNumber: trimToUndefined(form.phoneNumber),
    email: trimToUndefined(form.email),
    gender: toCustomerGender(form.gender),
    birthDate: normalizeBirthDate(form.birthDate),
  });
}

export function buildUpdateCustomerPayload(
  form: CustomerForm,
  isActive: boolean,
): UpdateCustomerRequest {
  return omitUndefined({
    name: trimText(form.name),
    surname: trimText(form.surname),
    address: trimToUndefined(form.address),
    country: trimToUndefined(form.country),
    city: trimToUndefined(form.city),
    district: trimToUndefined(form.district),
    phoneNumber: trimToUndefined(form.phoneNumber),
    email: trimToUndefined(form.email),
    gender: toCustomerGender(form.gender),
    birthDate: normalizeBirthDate(form.birthDate),
    isActive,
  });
}

export function buildToggleCustomerPayload(
  customer: Customer,
  isActive: boolean,
): UpdateCustomerRequest {
  return omitUndefined({
    name: customer.name,
    surname: customer.surname,
    address: nullishToUndefined(customer.address),
    country: nullishToUndefined(customer.country),
    city: nullishToUndefined(customer.city),
    district: nullishToUndefined(customer.district),
    phoneNumber: nullishToUndefined(customer.phoneNumber),
    email: nullishToUndefined(customer.email),
    gender: nullishToUndefined(customer.gender),
    birthDate: normalizeBirthDate(customer.birthDate),
    isActive,
  });
}
