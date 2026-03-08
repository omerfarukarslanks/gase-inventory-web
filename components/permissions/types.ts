export type PermissionsTab = "permissions" | "roles";

export type PermForm = {
  name: string;
  description: string;
  group: string;
  isActive: boolean;
};

export const EMPTY_PERM_FORM: PermForm = {
  name: "",
  description: "",
  group: "",
  isActive: true,
};
