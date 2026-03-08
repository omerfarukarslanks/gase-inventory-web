"use client";

import type { Currency } from "@/lib/products";
import type { StoreType } from "@/lib/stores";

export type StoreForm = {
  name: string;
  storeType: StoreType;
  currency: Currency;
  code: string;
  address: string;
  slug: string;
  logo: string;
  description: string;
};

export type StoresPageMessages = {
  sessionNotFound: string;
  loadError: string;
  detailLoadError: string;
  nameRequired: string;
  nameMinLength: string;
  updateError: string;
  createError: string;
  toggleError: string;
};

export const EMPTY_FORM: StoreForm = {
  name: "",
  storeType: "RETAIL",
  currency: "TRY",
  code: "",
  address: "",
  slug: "",
  logo: "",
  description: "",
};
