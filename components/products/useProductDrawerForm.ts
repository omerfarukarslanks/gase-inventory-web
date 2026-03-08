"use client";

import { type FormEvent, useCallback, useMemo, useState } from "react";
import {
  createProduct,
  createProductVariant,
  getProductAttributes,
  getProductById,
  updateProduct,
  updateProductVariant,
} from "@/lib/products";
import { toNumberOrNull } from "@/lib/format";
import {
  EMPTY_PRODUCT_FORM,
  type FormErrors,
  type IsActiveFilter,
  type ProductForm,
  type VariantErrors,
  type VariantForm,
  type VariantSnapshot,
  areVariantAttributesEqual,
  createVariantClientKey,
} from "@/components/products/types";

type UseProductDrawerFormOptions = {
  canTenantOnly: boolean;
  variantStatusFilter: IsActiveFilter;
  onRefreshProducts: () => Promise<void>;
  onRefreshTableVariants: (productId: string, status?: IsActiveFilter) => Promise<void>;
};

export function useProductDrawerForm({
  canTenantOnly,
  variantStatusFilter,
  onRefreshProducts,
  onRefreshTableVariants,
}: UseProductDrawerFormOptions) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [originalForm, setOriginalForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [expandedVariantKeys, setExpandedVariantKeys] = useState<string[]>([]);
  const [originalVariantMap, setOriginalVariantMap] = useState<Record<string, VariantSnapshot>>({});
  const [variantErrors, setVariantErrors] = useState<Record<number, VariantErrors>>({});
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [step1ProductInfoOpen, setStep1ProductInfoOpen] = useState(false);
  const [step1StoreScopeOpen, setStep1StoreScopeOpen] = useState(true);

  const calculatedLineTotal = useMemo(() => {
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
  }, [
    form.unitPrice,
    form.taxMode,
    form.taxPercent,
    form.taxAmount,
    form.discountMode,
    form.discountPercent,
    form.discountAmount,
  ]);

  const onOpenDrawer = useCallback(() => {
    setForm(EMPTY_PRODUCT_FORM);
    setVariants([]);
    setErrors({});
    setVariantErrors({});
    setFormError("");
    setEditingProductId(null);
    setCreatedProductId(null);
    setExpandedVariantKeys([]);
    setOriginalVariantMap({});
    setStep(1);
    setStep1ProductInfoOpen(false);
    setStep1StoreScopeOpen(true);
    setDrawerOpen(true);
  }, []);

  const onCloseDrawer = useCallback(() => {
    if (submitting || loadingDetail) return;
    setDrawerOpen(false);
  }, [loadingDetail, submitting]);

  const onFormChange = useCallback((field: keyof ProductForm, value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (next[field]) next[field] = undefined;
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
    });
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onFormPatch = useCallback((patch: Partial<ProductForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const onClearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const onEditProduct = useCallback(async (id: string) => {
    setFormError("");
    setErrors({});
    setVariantErrors({});
    setOriginalVariantMap({});
    setLoadingDetail(true);
    setStep(1);

    try {
      const detail = await getProductById(id);
      const formData: ProductForm = {
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

      setForm(formData);
      setOriginalForm(formData);
      setVariants([]);
      setStep1ProductInfoOpen(true);
      setStep1StoreScopeOpen(true);
      setEditingProductId(detail.id);
      setDrawerOpen(true);
    } catch {
      setFormError("Urun detayi yuklenemedi. Lutfen tekrar deneyin.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = "Urun adi zorunludur.";
    if (!form.sku.trim()) nextErrors.sku = "SKU zorunludur.";

    if (!form.unitPrice || Number.isNaN(Number(form.unitPrice)) || Number(form.unitPrice) < 0) {
      nextErrors.unitPrice = "Gecerli bir satis fiyati girin.";
    }

    if (!form.purchasePrice || Number.isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) < 0) {
      nextErrors.purchasePrice = "Gecerli bir alis fiyati girin.";
    }

    if (form.taxMode === "percent") {
      if (form.taxPercent && Number.isNaN(Number(form.taxPercent))) {
        nextErrors.taxPercent = "Gecerli bir vergi orani girin.";
      } else if (form.taxPercent) {
        const tax = Number(form.taxPercent);
        if (tax < 0 || tax > 100) nextErrors.taxPercent = "Vergi orani 0-100 arasi olmalidir.";
      }
    } else if (form.taxAmount && Number.isNaN(Number(form.taxAmount))) {
      nextErrors.taxAmount = "Gecerli bir vergi tutari girin.";
    }

    if (form.discountMode === "percent") {
      if (form.discountPercent && Number.isNaN(Number(form.discountPercent))) {
        nextErrors.discountPercent = "Gecerli bir indirim orani girin.";
      } else if (form.discountPercent) {
        const discount = Number(form.discountPercent);
        if (discount < 0 || discount > 100) {
          nextErrors.discountPercent = "Indirim orani 0-100 arasi olmalidir.";
        }
      }
    } else if (form.discountAmount && Number.isNaN(Number(form.discountAmount))) {
      nextErrors.discountAmount = "Gecerli bir indirim tutari girin.";
    }

    if (calculatedLineTotal == null || Number.isNaN(calculatedLineTotal) || calculatedLineTotal < 0) {
      nextErrors.lineTotal = "Gecerli bir satir toplami girin.";
    }

    if (canTenantOnly && !form.applyToAllStores && form.storeIds.length === 0) {
      nextErrors.storeIds = "En az bir magaza secin veya tum magazalara uygulayin.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [calculatedLineTotal, canTenantOnly, form]);

  const validateVariants = useCallback((): boolean => {
    if (variants.length === 0) {
      setFormError("En az bir ozellik eklemelisiniz.");
      return false;
    }

    const nextErrors: Record<number, VariantErrors> = {};
    let hasAtLeastOneValidAttribute = false;

    variants.forEach((variant, index) => {
      const variantError: VariantErrors = {};
      const hasEmptyAttr = variant.attributes.some((attribute) => attribute.id && attribute.values.length === 0);
      const hasEmptyKey = variant.attributes.some((attribute) => !attribute.id && attribute.values.length > 0);
      const validAttributeCount = variant.attributes.filter((attribute) => attribute.id && attribute.values.length > 0).length;

      if (validAttributeCount > 0) hasAtLeastOneValidAttribute = true;

      if (hasEmptyAttr || hasEmptyKey) {
        variantError.attributes = "Tum ozellik alanlari doldurulmalidir.";
      } else if (validAttributeCount === 0) {
        variantError.attributes = "En az bir ozellik secmelisiniz.";
      }

      if (Object.keys(variantError).length > 0) nextErrors[index] = variantError;
    });

    setFormError(hasAtLeastOneValidAttribute ? "" : "En az bir ozellik eklemelisiniz.");
    setVariantErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && hasAtLeastOneValidAttribute;
  }, [variants]);

  const isFormChanged = useCallback((): boolean => {
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
  }, [form, originalForm]);

  const fetchVariants = useCallback(async (productId: string) => {
    try {
      const productAttributesResponse = await getProductAttributes(productId);
      const productAttributes = (productAttributesResponse.attributes ?? []).map((attribute) => ({
        id: attribute.id,
        values: (attribute.values ?? [])
          .filter((value) => value.isActive)
          .map((value) => value.id),
      }));

      const clientKey = createVariantClientKey();
      setOriginalVariantMap({});
      setVariants([
        {
          clientKey,
          id: undefined,
          isActive: true,
          attributes: productAttributes.length > 0 ? productAttributes : [{ id: "", values: [] }],
        },
      ]);
      setExpandedVariantKeys([clientKey]);
    } catch {
      const clientKey = createVariantClientKey();
      setOriginalVariantMap({});
      setVariants([
        {
          clientKey,
          id: undefined,
          isActive: true,
          attributes: [{ id: "", values: [] }],
        },
      ]);
      setExpandedVariantKeys([clientKey]);
    }
  }, []);

  const buildPricingPayload = useCallback(() => ({
    currency: form.currency,
    unitPrice: Number(form.unitPrice),
    purchasePrice: Number(form.purchasePrice),
    ...(form.taxMode === "percent"
      ? form.taxPercent
        ? { taxPercent: Number(form.taxPercent) }
        : {}
      : form.taxAmount
        ? { taxAmount: Number(form.taxAmount) }
        : {}),
    ...(form.discountMode === "percent"
      ? form.discountPercent
        ? { discountPercent: Number(form.discountPercent) }
        : {}
      : form.discountAmount
        ? { discountAmount: Number(form.discountAmount) }
        : {}),
  }), [form]);

  const buildScopePayload = useCallback(() => (
    canTenantOnly
      ? { storeIds: [], applyToAllStores: false }
      : form.applyToAllStores
        ? { storeIds: [], applyToAllStores: true }
        : { storeIds: form.storeIds, applyToAllStores: false }
  ), [canTenantOnly, form.applyToAllStores, form.storeIds]);

  const goToStep2 = useCallback(async () => {
    if (!validateStep1()) return;

    setSubmitting(true);
    setFormError("");

    try {
      const productPayload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        categoryId: form.categoryId || undefined,
        supplierId: form.supplierId || undefined,
        ...buildPricingPayload(),
        ...buildScopePayload(),
      };

      if (editingProductId) {
        if (isFormChanged()) {
          await updateProduct(editingProductId, productPayload);
        }
        await fetchVariants(editingProductId);
        setStep(2);
      } else {
        const created = await createProduct(productPayload);
        setCreatedProductId(created.id);
        await fetchVariants(created.id);
        setStep(2);
      }
    } catch {
      setFormError(
        editingProductId
          ? "Urun guncellenemedi. Lutfen tekrar deneyin."
          : "Urun olusturulamadi. Lutfen tekrar deneyin.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    buildPricingPayload,
    buildScopePayload,
    editingProductId,
    fetchVariants,
    form.categoryId,
    form.description,
    form.image,
    form.name,
    form.sku,
    form.supplierId,
    isFormChanged,
    validateStep1,
  ]);

  const goToStep1 = useCallback(() => {
    setStep(1);
  }, []);

  const closeAndReset = useCallback(async () => {
    setDrawerOpen(false);
    setForm(EMPTY_PRODUCT_FORM);
    setVariants([]);
    setEditingProductId(null);
    setCreatedProductId(null);
    setExpandedVariantKeys([]);
    setOriginalVariantMap({});
    setStep(1);
    await onRefreshProducts();
  }, [onRefreshProducts]);

  const onSubmitProduct = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) {
      await goToStep2();
      return;
    }

    if (!validateVariants()) return;

    const preparedVariants = variants
      .filter((variant) => variant.attributes.some((attribute) => attribute.id && attribute.values.length > 0))
      .map((variant) => ({
        id: variant.id,
        isActive: variant.isActive ?? true,
        payload: {
          attributes: variant.attributes.filter((attribute) => attribute.id && attribute.values.length > 0),
        },
      }));

    const targetProductId = editingProductId ?? createdProductId;

    if (preparedVariants.length === 0) {
      await closeAndReset();
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (editingProductId) {
        const variantsToUpdate = preparedVariants.filter((variant) => {
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

        const hasChanges = variantsToUpdate.length > 0 || variantsToCreate.length > 0;

        if (hasChanges) {
          if (variantsToUpdate.length > 0) {
            await Promise.all(
              variantsToUpdate.map((variant) =>
                updateProductVariant(editingProductId, variant.id!, {
                  ...variant.payload,
                  isActive: variant.isActive,
                }),
              ),
            );
          }

          if (variantsToCreate.length > 0) {
            await Promise.all(
              variantsToCreate.map((payload) => createProductVariant(editingProductId, payload)),
            );
          }

          await onRefreshTableVariants(editingProductId, variantStatusFilter);
        }
      } else if (targetProductId) {
        await Promise.all(
          preparedVariants.map((variant) => createProductVariant(targetProductId, variant.payload)),
        );
      }

      await closeAndReset();
    } catch {
      setFormError("Varyantlar olusturulamadi. Lutfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }, [
    closeAndReset,
    createdProductId,
    editingProductId,
    goToStep2,
    onRefreshTableVariants,
    originalVariantMap,
    step,
    validateVariants,
    variantStatusFilter,
    variants,
  ]);

  const removeVariant = useCallback((index: number) => {
    const removedKey = variants[index]?.clientKey;
    setVariants((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (removedKey) {
      setExpandedVariantKeys((prev) => prev.filter((key) => key !== removedKey));
    }
    setVariantErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, [variants]);

  const toggleVariantPanel = useCallback((clientKey: string) => {
    setExpandedVariantKeys((prev) =>
      prev.includes(clientKey)
        ? prev.filter((key) => key !== clientKey)
        : [...prev, clientKey],
    );
  }, []);

  const addAttribute = useCallback((variantIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, index) => (
        index === variantIndex
          ? { ...variant, attributes: [...variant.attributes, { id: "", values: [] }] }
          : variant
      )),
    );
  }, []);

  const removeAttribute = useCallback((variantIndex: number, attrIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, index) => (
        index === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.filter((_, attributeIndex) => attributeIndex !== attrIndex),
            }
          : variant
      )),
    );
  }, []);

  const updateVariantAttribute = useCallback(
    (variantIndex: number, attrIndex: number, field: "id" | "values", value: string | string[]) => {
      setVariants((prev) =>
        prev.map((variant, index) =>
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
        ),
      );
    },
    [],
  );

  return {
    drawerOpen,
    step,
    submitting,
    editingProductId,
    loadingDetail,
    formError,
    form,
    errors,
    calculatedLineTotal,
    variants,
    expandedVariantKeys,
    variantErrors,
    step1ProductInfoOpen,
    step1StoreScopeOpen,
    setStep1ProductInfoOpen,
    setStep1StoreScopeOpen,
    onOpenDrawer,
    onCloseDrawer,
    onFormChange,
    onFormPatch,
    onClearError,
    onEditProduct,
    goToStep1,
    onSubmitProduct,
    removeVariant,
    toggleVariantPanel,
    addAttribute,
    removeAttribute,
    updateVariantAttribute,
  };
}
