"use client";

import { trimText } from "@/lib/payload";

export function buildCreatePermissionPayload(form: {
  name: string;
  description: string;
  group: string;
  isActive: boolean;
}) {
  return {
    name: trimText(form.name) ?? "",
    description: trimText(form.description) ?? "",
    group: trimText(form.group) ?? "",
    isActive: form.isActive,
  };
}

export function buildUpdatePermissionPayload(form: {
  description: string;
  group: string;
  isActive: boolean;
}) {
  return {
    description: trimText(form.description) ?? "",
    group: trimText(form.group) ?? "",
    isActive: form.isActive,
  };
}

export function buildReplaceRolePermissionsPayload(selectedPermissionNames: Iterable<string>) {
  return {
    permissionNames: [...selectedPermissionNames],
    isActive: true,
  };
}
