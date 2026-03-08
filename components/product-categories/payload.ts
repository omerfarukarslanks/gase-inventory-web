"use client";

import {
  nullishToUndefined,
  omitUndefined,
  trimText,
  trimToNull,
  trimToUndefined,
} from "@/lib/payload";
import type {
  CreateProductCategoryRequest,
  ProductCategory,
  UpdateProductCategoryRequest,
} from "@/lib/product-categories";
import { slugifyText, type CategoryForm } from "@/components/product-categories/types";

export function buildCreateProductCategoryPayload(
  form: CategoryForm,
): CreateProductCategoryRequest {
  return omitUndefined({
    name: trimText(form.name),
    slug: trimText(form.slug),
    description: trimToUndefined(form.description),
    parentId: trimToNull(form.parentId),
    isActive: true,
  });
}

export function buildUpdateProductCategoryPayload(
  form: CategoryForm,
): UpdateProductCategoryRequest {
  return omitUndefined({
    name: trimText(form.name),
    slug: trimText(form.slug),
    description: trimToUndefined(form.description),
    parentId: trimToNull(form.parentId),
  });
}

export function buildToggleProductCategoryPayload(
  category: ProductCategory,
  isActive: boolean,
): UpdateProductCategoryRequest {
  return omitUndefined({
    name: category.name,
    slug: category.slug ?? slugifyText(category.name),
    description: nullishToUndefined(category.description),
    parentId: category.parentId ?? null,
    isActive,
  });
}
