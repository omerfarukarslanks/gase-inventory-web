"use client";

import { toNumberOrNull } from "@/lib/format";
import {
  nullishToUndefined,
  omitUndefined,
  trimText,
  trimToUndefined,
} from "@/lib/payload";
import type {
  CreateProductPackageRequest,
  ProductPackage,
  ProductPackageItemInput,
  UpdateProductPackageRequest,
} from "@/lib/product-packages";
import type { PackageForm, PackageItemRow } from "@/components/product-packages/types";

export function buildProductPackageItemsPayload(items: PackageItemRow[]): ProductPackageItemInput[] {
  return items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: toNumberOrNull(item.quantity) ?? 1,
  }));
}

export function buildCreateProductPackagePayload(
  form: PackageForm,
  items: PackageItemRow[],
): CreateProductPackageRequest {
  return omitUndefined({
    name: trimText(form.name),
    code: trimText(form.code),
    description: trimToUndefined(form.description),
    items: buildProductPackageItemsPayload(items),
  });
}

export function buildUpdateProductPackagePayload(
  form: PackageForm,
  items: PackageItemRow[],
  isActive: boolean,
): UpdateProductPackageRequest {
  return omitUndefined({
    name: trimText(form.name),
    code: trimText(form.code),
    description: trimToUndefined(form.description),
    isActive,
    items: buildProductPackageItemsPayload(items),
  });
}

export function buildToggleProductPackagePayload(
  productPackage: ProductPackage,
  isActive: boolean,
): UpdateProductPackageRequest {
  return omitUndefined({
    name: productPackage.name,
    code: productPackage.code,
    description: nullishToUndefined(productPackage.description),
    isActive,
    items: (productPackage.items ?? []).map((item) => ({
      productVariantId: item.productVariant.id,
      quantity: item.quantity,
    })),
  });
}
