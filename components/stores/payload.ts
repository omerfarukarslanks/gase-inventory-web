"use client";

import { nullishToUndefined, omitUndefined, trimText, trimToUndefined } from "@/lib/payload";
import type { CreateStoreRequest, Store, UpdateStoreRequest } from "@/lib/stores";
import type { StoreForm } from "@/components/stores/types";

export function buildCreateStorePayload(form: StoreForm): CreateStoreRequest {
  return omitUndefined({
    name: trimText(form.name),
    storeType: form.storeType,
    currency: form.currency,
    code: trimToUndefined(form.code),
    address: trimToUndefined(form.address),
    slug: trimToUndefined(form.slug),
    logo: trimToUndefined(form.logo),
    description: trimToUndefined(form.description),
  });
}

export function buildUpdateStorePayload(
  form: StoreForm,
  isActive: boolean,
): UpdateStoreRequest {
  return omitUndefined({
    name: trimText(form.name),
    code: trimToUndefined(form.code),
    address: trimToUndefined(form.address),
    slug: trimToUndefined(form.slug),
    logo: trimToUndefined(form.logo),
    description: trimToUndefined(form.description),
    isActive,
  });
}

export function buildToggleStorePayload(store: Store, isActive: boolean): UpdateStoreRequest {
  return omitUndefined({
    name: store.name,
    code: nullishToUndefined(store.code),
    address: nullishToUndefined(store.address),
    slug: nullishToUndefined(store.slug),
    logo: nullishToUndefined(store.logo),
    description: nullishToUndefined(store.description),
    isActive,
  });
}
