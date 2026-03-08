"use client";

import type { CreateVariantDto, Product, ProductAttributeInput } from "@/lib/products";
import { toNumberOrNull } from "@/lib/format";
import { omitUndefined, trimToUndefined } from "@/lib/payload";
import {
  type FormErrors,
  type ProductForm,
  type VariantErrors,
  type VariantForm,
  type VariantSnapshot,
  areVariantAttributesEqual,
  createVariantClientKey,
} from "@/components/products/types";

type Translate = (key: string) => string;

type VariantValidationResult = {
  formError: string;
  variantErrors: Record<number, VariantErrors>;
  isValid: boolean;
};

type PreparedVariant = {
  id?: string;
  isActive: boolean;
  payload: CreateVariantDto;
};

type PreparedVariantUpdate = {
  id: string;
  isActive: boolean;
  payload: CreateVariantDto;
};

export function mapProductDetailToForm(detail: Product): ProductForm {
  return {
    currency: detail.currency ?? "TRY",
    purchasePrice: detail.purchasePrice != null ? String(detail.purchasePrice) : "",
    unitPrice: detail.unitPrice != null ? String(detail.unitPrice) : "",
    discountMode:
      detail.discountAmount != null && String(detail.discountAmount) !== "" ? "amount" : "percent",
    discountPercent: detail.discountPercent != null ? String(detail.discountPercent) : "",
    discountAmount: detail.discountAmount != null ? String(detail.discountAmount) : "",
    taxMode: detail.taxAmount != null && String(detail.taxAmount) !== "" ? "amount" : "percent",
    taxPercent: detail.taxPercent != null ? String(detail.taxPercent) : "",
    taxAmount: detail.taxAmount != null ? String(detail.taxAmount) : "",
    name: detail.name ?? "",
    sku: detail.sku ?? "",
    description: detail.description ?? "",
    image: detail.image ?? "",
    storeIds: detail.storeIds ?? [],
    applyToAllStores: Boolean(detail.applyToAllStores),
    categoryId: detail.categoryId ?? detail.category?.id ?? "",
    supplierId: detail.supplierId ?? detail.supplier?.id ?? "",
  };
}

export function calculateProductLineTotal(form: ProductForm): number | null {
  const unitPrice = toNumberOrNull(form.unitPrice);
  if (unitPrice == null || unitPrice < 0) return null;

  const taxValue =
    form.taxMode === "percent"
      ? unitPrice * ((toNumberOrNull(form.taxPercent) ?? 0) / 100)
      : (toNumberOrNull(form.taxAmount) ?? 0);
  const subtotalWithTax = unitPrice + taxValue;
  const discountValue =
    form.discountMode === "percent"
      ? subtotalWithTax * ((toNumberOrNull(form.discountPercent) ?? 0) / 100)
      : (toNumberOrNull(form.discountAmount) ?? 0);

  return subtotalWithTax - discountValue;
}

export function validateProductStep1(
  form: ProductForm,
  options: {
    calculatedLineTotal: number | null;
    canTenantOnly: boolean;
    t: Translate;
  },
): FormErrors {
  const { calculatedLineTotal, canTenantOnly, t } = options;
  const nextErrors: FormErrors = {};

  if (!form.name.trim()) nextErrors.name = t("products.nameRequired");
  if (!form.sku.trim()) nextErrors.sku = t("products.skuRequired");

  if (!form.unitPrice || Number.isNaN(Number(form.unitPrice)) || Number(form.unitPrice) < 0) {
    nextErrors.unitPrice = t("products.unitPriceInvalid");
  }

  if (!form.purchasePrice || Number.isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) < 0) {
    nextErrors.purchasePrice = t("products.purchasePriceInvalid");
  }

  if (form.taxMode === "percent") {
    if (form.taxPercent && Number.isNaN(Number(form.taxPercent))) {
      nextErrors.taxPercent = t("products.taxPercentInvalid");
    } else if (form.taxPercent) {
      const tax = Number(form.taxPercent);
      if (tax < 0 || tax > 100) nextErrors.taxPercent = t("products.taxPercentRange");
    }
  } else if (form.taxAmount && Number.isNaN(Number(form.taxAmount))) {
    nextErrors.taxAmount = t("products.taxAmountInvalid");
  }

  if (form.discountMode === "percent") {
    if (form.discountPercent && Number.isNaN(Number(form.discountPercent))) {
      nextErrors.discountPercent = t("products.discountPercentInvalid");
    } else if (form.discountPercent) {
      const discount = Number(form.discountPercent);
      if (discount < 0 || discount > 100) {
        nextErrors.discountPercent = t("products.discountPercentRange");
      }
    }
  } else if (form.discountAmount && Number.isNaN(Number(form.discountAmount))) {
    nextErrors.discountAmount = t("products.discountAmountInvalid");
  }

  if (calculatedLineTotal == null || Number.isNaN(calculatedLineTotal) || calculatedLineTotal < 0) {
    nextErrors.lineTotal = t("products.lineTotalInvalid");
  }

  if (canTenantOnly && !form.applyToAllStores && form.storeIds.length === 0) {
    nextErrors.storeIds = t("products.storeSelectionRequired");
  }

  return nextErrors;
}

export function validateProductVariants(
  variants: VariantForm[],
  t: Translate,
): VariantValidationResult {
  const nextErrors: Record<number, VariantErrors> = {};
  let hasAtLeastOneValidAttribute = false;

  if (variants.length === 0) {
    return {
      formError: t("products.attributesRequired"),
      variantErrors: {},
      isValid: false,
    };
  }

  variants.forEach((variant, index) => {
    const variantError: VariantErrors = {};
    const hasEmptyAttr = variant.attributes.some((attribute) => attribute.id && attribute.values.length === 0);
    const hasEmptyKey = variant.attributes.some((attribute) => !attribute.id && attribute.values.length > 0);
    const validAttributeCount = variant.attributes.filter(
      (attribute) => attribute.id && attribute.values.length > 0,
    ).length;

    if (validAttributeCount > 0) hasAtLeastOneValidAttribute = true;

    if (hasEmptyAttr || hasEmptyKey) {
      variantError.attributes = t("products.variantAttributesRequired");
    } else if (validAttributeCount === 0) {
      variantError.attributes = t("products.atLeastOneAttribute");
    }

    if (Object.keys(variantError).length > 0) nextErrors[index] = variantError;
  });

  return {
    formError: hasAtLeastOneValidAttribute ? "" : t("products.attributesRequired"),
    variantErrors: nextErrors,
    isValid: Object.keys(nextErrors).length === 0 && hasAtLeastOneValidAttribute,
  };
}

export function clearProductFormErrorsOnFieldChange(
  errors: FormErrors,
  field: keyof ProductForm,
): FormErrors {
  const next = { ...errors };

  if (next[field]) {
    next[field] = undefined;
  }

  if (
    (field === "unitPrice" ||
      field === "taxPercent" ||
      field === "taxAmount" ||
      field === "discountPercent" ||
      field === "discountAmount") &&
    next.lineTotal
  ) {
    next.lineTotal = undefined;
  }

  return next;
}

export function createEmptyVariantAttribute(): ProductAttributeInput {
  return { id: "", values: [] };
}

export function createVariantForm(
  attributes: ProductAttributeInput[] = [createEmptyVariantAttribute()],
): VariantForm {
  return {
    clientKey: createVariantClientKey(),
    id: undefined,
    isActive: true,
    attributes: attributes.length > 0 ? attributes : [createEmptyVariantAttribute()],
  };
}

export function createInitialVariantForms(
  attributes: ProductAttributeInput[] = [createEmptyVariantAttribute()],
): VariantForm[] {
  return [createVariantForm(attributes)];
}

export function getExpandedVariantKeys(variants: VariantForm[]): string[] {
  return variants.map((variant) => variant.clientKey);
}

export function removeVariantErrorAtIndex(
  variantErrors: Record<number, VariantErrors>,
  targetIndex: number,
): Record<number, VariantErrors> {
  return Object.entries(variantErrors).reduce<Record<number, VariantErrors>>((next, [indexKey, value]) => {
    const index = Number(indexKey);
    if (Number.isNaN(index) || index === targetIndex) {
      return next;
    }

    next[index > targetIndex ? index - 1 : index] = value;
    return next;
  }, {});
}

export function clearVariantErrorAtIndex(
  variantErrors: Record<number, VariantErrors>,
  targetIndex: number,
): Record<number, VariantErrors> {
  if (!variantErrors[targetIndex]) {
    return variantErrors;
  }

  const next = { ...variantErrors };
  delete next[targetIndex];
  return next;
}

export function addEmptyAttributeToVariant(
  variants: VariantForm[],
  variantIndex: number,
): VariantForm[] {
  return variants.map((variant, index) => (
    index === variantIndex
      ? { ...variant, attributes: [...variant.attributes, createEmptyVariantAttribute()] }
      : variant
  ));
}

export function removeVariantAttributeAt(
  variants: VariantForm[],
  variantIndex: number,
  attrIndex: number,
): VariantForm[] {
  return variants.map((variant, index) => (
    index === variantIndex
      ? {
          ...variant,
          attributes: variant.attributes.filter((_, attributeIndex) => attributeIndex !== attrIndex),
        }
      : variant
  ));
}

export function updateVariantAttributeAt(
  variants: VariantForm[],
  variantIndex: number,
  attrIndex: number,
  field: "id" | "values",
  value: string | string[],
): VariantForm[] {
  return variants.map((variant, index) =>
    index === variantIndex
      ? {
          ...variant,
          attributes: variant.attributes.map((attribute, attributeIndex) => {
            if (attributeIndex !== attrIndex) return attribute;
            if (field === "id") {
              return { id: String(value), values: [] };
            }
            return { ...attribute, values: Array.isArray(value) ? value : [] };
          }),
        }
      : variant,
  );
}

export function isProductFormChanged(originalForm: ProductForm, form: ProductForm): boolean {
  const simpleKeys = Object.keys(originalForm) as (keyof ProductForm)[];
  return simpleKeys.some((key) => {
    if (key === "storeIds") {
      const left = originalForm.storeIds;
      const right = form.storeIds;
      if (left.length !== right.length) return true;
      return left.some((id, index) => id !== right[index]);
    }
    return form[key] !== originalForm[key];
  });
}

export function buildProductPricingPayload(form: ProductForm) {
  return omitUndefined({
    currency: form.currency,
    unitPrice: Number(form.unitPrice),
    purchasePrice: Number(form.purchasePrice),
    taxPercent: form.taxMode === "percent" ? toNumberOrNull(form.taxPercent) ?? undefined : undefined,
    taxAmount: form.taxMode === "amount" ? toNumberOrNull(form.taxAmount) ?? undefined : undefined,
    discountPercent:
      form.discountMode === "percent" ? toNumberOrNull(form.discountPercent) ?? undefined : undefined,
    discountAmount:
      form.discountMode === "amount" ? toNumberOrNull(form.discountAmount) ?? undefined : undefined,
  });
}

export function buildProductScopePayload(form: ProductForm, canTenantOnly: boolean) {
  if (canTenantOnly) {
    return { storeIds: [], applyToAllStores: false };
  }

  if (form.applyToAllStores) {
    return { storeIds: [], applyToAllStores: true };
  }

  return { storeIds: form.storeIds, applyToAllStores: false };
}

export function buildProductPayload(form: ProductForm, canTenantOnly: boolean) {
  return {
    name: form.name.trim(),
    sku: form.sku.trim(),
    description: trimToUndefined(form.description),
    image: trimToUndefined(form.image),
    categoryId: form.categoryId || undefined,
    supplierId: form.supplierId || undefined,
    ...buildProductPricingPayload(form),
    ...buildProductScopePayload(form, canTenantOnly),
  };
}

export function prepareProductVariants(variants: VariantForm[]): PreparedVariant[] {
  return variants
    .filter((variant) => variant.attributes.some((attribute) => attribute.id && attribute.values.length > 0))
    .map((variant) => ({
      id: variant.id,
      isActive: variant.isActive ?? true,
      payload: {
        attributes: variant.attributes.filter((attribute) => attribute.id && attribute.values.length > 0),
      },
    }));
}

export function splitPreparedProductVariantsForUpdate(
  preparedVariants: PreparedVariant[],
  originalVariantMap: Record<string, VariantSnapshot>,
) {
  const variantsToUpdate: PreparedVariantUpdate[] = preparedVariants.filter((variant): variant is PreparedVariantUpdate => {
    if (!variant.id) return false;
    const original = originalVariantMap[variant.id];
    if (!original) return true;
    return (
      original.isActive !== variant.isActive ||
      !areVariantAttributesEqual(original.payload.attributes, variant.payload.attributes)
    );
  });

  const variantsToCreate = preparedVariants
    .filter((variant) => !variant.id)
    .map((variant) => variant.payload);

  return {
    variantsToUpdate,
    variantsToCreate,
    hasChanges: variantsToUpdate.length > 0 || variantsToCreate.length > 0,
  };
}
