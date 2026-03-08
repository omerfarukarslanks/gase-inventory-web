"use client";

export type UserForm = {
  name: string;
  surname: string;
  role: string;
  email: string;
  password: string;
  storeId: string;
};

export type UserFormErrors = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export const EMPTY_USER_FORM: UserForm = {
  name: "",
  surname: "",
  role: "STAFF",
  email: "",
  password: "",
  storeId: "",
};

export const EMPTY_USER_FORM_ERRORS: UserFormErrors = {
  name: "",
  surname: "",
  email: "",
  password: "",
};

export const USER_ROLE_OPTIONS = [
  { value: "STAFF", label: "STAFF" },
  { value: "MANAGER", label: "MANAGER" },
  { value: "ADMIN", label: "ADMIN" },
] as const;
