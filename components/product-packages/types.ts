export type PackageItemRow = {
  rowId: string;
  productVariantId: string;
  variantLabel: string;
  quantity: string;
};

export type PackageForm = {
  name: string;
  code: string;
  description: string;
};

export type FormErrors = Partial<Record<keyof PackageForm | "items", string>>;

export const EMPTY_FORM: PackageForm = {
  name: "",
  code: "",
  description: "",
};

export function createPackageRowId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
