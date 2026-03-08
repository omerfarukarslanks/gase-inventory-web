"use client";

import { type FormEvent, useCallback, useMemo, useState } from "react";
import { useLang } from "@/context/LangContext";
import { clearFieldError, clearStringError } from "@/lib/form-errors";
import {
  createProduct,
  createProductVariant,
  getProductAttributes,
  getProductById,
  updateProduct,
  updateProductVariant,
} from "@/lib/products";
import {
  EMPTY_PRODUCT_FORM,
  type FormErrors,
  type IsActiveFilter,
  type ProductForm,
  type VariantErrors,
  type VariantForm,
  type VariantSnapshot,
} from "@/components/products/types";
import {
  addEmptyAttributeToVariant,
  buildProductPayload,
  calculateProductLineTotal,
  clearProductFormErrorsOnFieldChange,
  clearVariantErrorAtIndex,
  createInitialVariantForms,
  getExpandedVariantKeys,
  isProductFormChanged,
  mapProductDetailToForm,
  prepareProductVariants,
  removeVariantAttributeAt,
  removeVariantErrorAtIndex,
  splitPreparedProductVariantsForUpdate,
  updateVariantAttributeAt,
  validateProductStep1,
  validateProductVariants,
} from "@/components/products/form";

type UseProductDrawerFormOptions = {
  canTenantOnly: boolean;
  variantStatusFilter: IsActiveFilter;
  onRefreshProducts: () => Promise<void>;
  onRefreshTableVariants: (productId: string, status?: IsActiveFilter) => Promise<void>;
  onSuccess: (message: string) => void;
  clearFeedback?: () => void;
};

export function useProductDrawerForm({
  canTenantOnly,
  variantStatusFilter,
  onRefreshProducts,
  onRefreshTableVariants,
  onSuccess,
  clearFeedback,
}: UseProductDrawerFormOptions) {
  const { t } = useLang();
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

  const calculatedLineTotal = useMemo(() => calculateProductLineTotal(form), [form]);

  const onOpenDrawer = useCallback(() => {
    clearFeedback?.();
    setForm(EMPTY_PRODUCT_FORM);
    setVariants([]);
    setErrors({});
    setVariantErrors({});
    clearStringError(formError, setFormError);
    setEditingProductId(null);
    setCreatedProductId(null);
    setExpandedVariantKeys([]);
    setOriginalVariantMap({});
    setStep(1);
    setStep1ProductInfoOpen(false);
    setStep1StoreScopeOpen(true);
    setDrawerOpen(true);
  }, [clearFeedback, formError]);

  const onCloseDrawer = useCallback(() => {
    if (submitting || loadingDetail) return;
    setDrawerOpen(false);
  }, [loadingDetail, submitting]);

  const onFormChange = useCallback((field: keyof ProductForm, value: string) => {
    setErrors((prev) => clearProductFormErrorsOnFieldChange(prev, field));
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onFormPatch = useCallback((patch: Partial<ProductForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const onClearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => clearFieldError(prev, field, undefined));
  }, []);

  const onEditProduct = useCallback(async (id: string) => {
    clearFeedback?.();
    clearStringError(formError, setFormError);
    setErrors({});
    setVariantErrors({});
    setOriginalVariantMap({});
    setLoadingDetail(true);
    setStep(1);

    try {
      const detail = await getProductById(id);
      const formData = mapProductDetailToForm(detail);

      setForm(formData);
      setOriginalForm(formData);
      setVariants([]);
      setStep1ProductInfoOpen(true);
      setStep1StoreScopeOpen(true);
      setEditingProductId(detail.id);
      setDrawerOpen(true);
    } catch {
      setFormError(t("products.detailLoadError"));
    } finally {
      setLoadingDetail(false);
    }
  }, [clearFeedback, formError, t]);

  const validateStep1 = useCallback((): boolean => {
    const nextErrors = validateProductStep1(form, { calculatedLineTotal, canTenantOnly, t });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [calculatedLineTotal, canTenantOnly, form, t]);

  const validateVariants = useCallback((): boolean => {
    const result = validateProductVariants(variants, t);
    setFormError(result.formError);
    setVariantErrors(result.variantErrors);
    return result.isValid;
  }, [t, variants]);

  const isFormChanged = useCallback((): boolean => {
    return isProductFormChanged(originalForm, form);
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

      setOriginalVariantMap({});
      const seededVariants = createInitialVariantForms(productAttributes);
      setVariants(seededVariants);
      setExpandedVariantKeys(getExpandedVariantKeys(seededVariants));
    } catch {
      setOriginalVariantMap({});
      const seededVariants = createInitialVariantForms();
      setVariants(seededVariants);
      setExpandedVariantKeys(getExpandedVariantKeys(seededVariants));
    }
  }, []);

  const goToStep2 = useCallback(async () => {
    if (!validateStep1()) return;

    setSubmitting(true);
    clearStringError(formError, setFormError);

    try {
      const productPayload = buildProductPayload(form, canTenantOnly);

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
      setFormError(editingProductId ? t("products.updateError") : t("products.createError"));
    } finally {
      setSubmitting(false);
    }
  }, [
    canTenantOnly,
    editingProductId,
    fetchVariants,
    formError,
    form,
    isFormChanged,
    t,
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

    const preparedVariants = prepareProductVariants(variants);

    const targetProductId = editingProductId ?? createdProductId;
    const successMessage = editingProductId ? t("products.updateSuccess") : t("products.createSuccess");

    if (preparedVariants.length === 0) {
      await closeAndReset();
      onSuccess(successMessage);
      return;
    }

    setSubmitting(true);
    clearStringError(formError, setFormError);

    try {
      if (editingProductId) {
        const { variantsToUpdate, variantsToCreate, hasChanges } =
          splitPreparedProductVariantsForUpdate(preparedVariants, originalVariantMap);

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
      onSuccess(successMessage);
    } catch {
      setFormError(t("products.variantsCreateError"));
    } finally {
      setSubmitting(false);
    }
  }, [
    closeAndReset,
    createdProductId,
    editingProductId,
    formError,
    goToStep2,
    onSuccess,
    onRefreshTableVariants,
    originalVariantMap,
    step,
    t,
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
    setVariantErrors((prev) => removeVariantErrorAtIndex(prev, index));
  }, [variants]);

  const toggleVariantPanel = useCallback((clientKey: string) => {
    setExpandedVariantKeys((prev) =>
      prev.includes(clientKey)
        ? prev.filter((key) => key !== clientKey)
        : [...prev, clientKey],
    );
  }, []);

  const addAttribute = useCallback((variantIndex: number) => {
    setVariantErrors((prev) => clearVariantErrorAtIndex(prev, variantIndex));
    setVariants((prev) => addEmptyAttributeToVariant(prev, variantIndex));
  }, []);

  const removeAttribute = useCallback((variantIndex: number, attrIndex: number) => {
    setVariantErrors((prev) => clearVariantErrorAtIndex(prev, variantIndex));
    setVariants((prev) => removeVariantAttributeAt(prev, variantIndex, attrIndex));
  }, []);

  const updateVariantAttribute = useCallback(
    (variantIndex: number, attrIndex: number, field: "id" | "values", value: string | string[]) => {
      setVariantErrors((prev) => clearVariantErrorAtIndex(prev, variantIndex));
      setVariants((prev) => updateVariantAttributeAt(prev, variantIndex, attrIndex, field, value));
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
