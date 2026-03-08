"use client";

import { trimText } from "@/lib/payload";
import type { CreateUserDto, UpdateUserDto, User } from "@/lib/users";
import type { UserForm } from "@/components/users/types";

export function buildCreateUserPayload(form: UserForm): CreateUserDto {
  return {
    email: trimText(form.email),
    password: form.password,
    name: trimText(form.name),
    surname: trimText(form.surname),
    role: form.role,
    storeIds: form.storeId ? [form.storeId] : [],
  };
}

export function buildUpdateUserPayload(form: UserForm): UpdateUserDto {
  return {
    name: trimText(form.name),
    surname: trimText(form.surname),
    role: form.role,
    storeIds: form.storeId ? [form.storeId] : [],
  };
}

export function buildToggleUserPayload(user: User, isActive: boolean): UpdateUserDto {
  return {
    name: user.name,
    surname: user.surname,
    role: user.role,
    storeIds: user.userStores?.map((userStore) => userStore.store.id) ?? [],
    isActive,
  };
}
