"use client";

export type CustomerForm = {
  name: string;
  surname: string;
  address: string;
  country: string;
  city: string;
  district: string;
  phoneNumber: string;
  email: string;
  gender: string;
  birthDate: string;
};

export type CustomersPageMessages = {
  loadErrorMessage: string;
};

export type TranslateFn = (key: string) => string;

export function getGenderOptions(t: TranslateFn) {
  return [
    { value: "male", label: t("customers.genderMale") },
    { value: "female", label: t("customers.genderFemale") },
    { value: "other", label: t("customers.genderOther") },
  ];
}

export const EMPTY_FORM: CustomerForm = {
  name: "",
  surname: "",
  address: "",
  country: "",
  city: "",
  district: "",
  phoneNumber: "",
  email: "",
  gender: "",
  birthDate: "",
};

export function formatCount(value: number | string | null | undefined): string {
  if (value == null) return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "-";
  return numeric.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}
