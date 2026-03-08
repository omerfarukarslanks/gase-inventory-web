"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { clearFieldError } from "@/lib/form-errors";
import {
  createProductPackage,
  getProductPackageById,
  updateProductPackage,
} from "@/lib/product-packages";
import { getProducts, getProductVariants, type Product } from "@/lib/products";
import { toNumberOrNull } from "@/lib/format";
import { useDebounceStr } from "@/hooks/useDebounce";
import { useCrudFormDrawerState } from "@/hooks/useCrudFormDrawerState";
import {
  buildCreateProductPackagePayload,
  buildUpdateProductPackagePayload,
} from "@/components/product-packages/payload";
import {
  createPackageRowId,
  EMPTY_FORM,
  type FormErrors,
  type PackageForm,
  type PackageItemRow,
} from "@/components/product-packages/types";

type UseProductPackageFormOptions = {
  canReadPage: boolean;
  onRefreshPackages: () => Promise<void>;
};

export function useProductPackageForm({
  canReadPage,
  onRefreshPackages,
}: UseProductPackageFormOptions) {
  const [editingIsActive, setEditingIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [items, setItems] = useState<PackageItemRow[]>([]);
  const [variantSearchTerm, setVariantSearchTerm] = useState("");
  const [variantSearchLoading, setVariantSearchLoading] = useState(false);
  const [variantSearchProducts, setVariantSearchProducts] = useState<Product[]>([]);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState("");
  const [variantOptions, setVariantOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [addItemQuantity, setAddItemQuantity] = useState("1");
  const [addItemError, setAddItemError] = useState("");
  const drawerState = useCrudFormDrawerState<PackageForm>(EMPTY_FORM);
  const {
    drawerOpen,
    submitting,
    loadingDetail,
    editingId,
    form,
    setDrawerOpen,
    setSubmitting,
    setLoadingDetail,
    setEditingId,
    setForm,
    openCreate,
    closeDrawer,
    completeSubmit,
  } = drawerState;

  const debouncedVariantSearch = useDebounceStr(variantSearchTerm, 400);

  useEffect(() => {
    if (!canReadPage) {
      setVariantSearchProducts([]);
      return;
    }
    if (!debouncedVariantSearch.trim()) {
      setVariantSearchProducts([]);
      return;
    }

    let cancelled = false;
    setVariantSearchLoading(true);
    getProducts({ search: debouncedVariantSearch, limit: 20 })
      .then((response) => {
        if (!cancelled) setVariantSearchProducts(response.data);
      })
      .catch(() => {
        if (!cancelled) setVariantSearchProducts([]);
      })
      .finally(() => {
        if (!cancelled) setVariantSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canReadPage, debouncedVariantSearch]);

  useEffect(() => {
    if (!canReadPage) {
      setVariantOptions([]);
      setSelectedVariantIds([]);
      return;
    }
    if (!selectedProductForVariant) {
      setVariantOptions([]);
      setSelectedVariantIds([]);
      return;
    }

    setVariantsLoading(true);
    getProductVariants(selectedProductForVariant)
      .then((variants) => {
        setVariantOptions(
          variants
            .filter((variant) => variant.isActive !== false)
            .map((variant) => ({ value: variant.id, label: `${variant.name} (${variant.code})` })),
        );
      })
      .catch(() => setVariantOptions([]))
      .finally(() => setVariantsLoading(false));
  }, [canReadPage, selectedProductForVariant]);

  const resetItemSearch = useCallback(() => {
    setVariantSearchTerm("");
    setVariantSearchProducts([]);
    setSelectedProductForVariant("");
    setVariantOptions([]);
    setSelectedVariantIds([]);
    setAddItemQuantity("1");
    setAddItemError("");
  }, []);

  const onOpenDrawer = useCallback(() => {
    openCreate(() => {
      setFormError("");
      setErrors({});
      setItems([]);
      setEditingIsActive(true);
      resetItemSearch();
    });
  }, [openCreate, resetItemSearch]);

  const onCloseDrawer = useCallback(() => {
    closeDrawer(() => {
      setFormError("");
      setErrors({});
      resetItemSearch();
    });
  }, [closeDrawer, resetItemSearch]);

  const onEditPackage = useCallback(async (id: string) => {
    setFormError("");
    setErrors({});
    setLoadingDetail(true);
    resetItemSearch();
    try {
      const detail = await getProductPackageById(id);
      setForm({
        name: detail.name ?? "",
        code: detail.code ?? "",
        description: detail.description ?? "",
      });
      setItems(
        (detail.items ?? []).map((item) => ({
          rowId: createPackageRowId(),
          productVariantId: item.productVariant.id,
          variantLabel: `${item.productVariant.name} (${item.productVariant.code})`,
          quantity: String(item.quantity),
        })),
      );
      setEditingId(detail.id);
      setEditingIsActive(detail.isActive ?? true);
      setDrawerOpen(true);
    } catch {
      setFormError("Paket detayi yuklenemedi. Lutfen tekrar deneyin.");
    } finally {
      setLoadingDetail(false);
    }
  }, [resetItemSearch]);

  const onFormChange = useCallback((field: keyof PackageForm, value: string) => {
    setErrors((prev) => clearFieldError(prev, field, undefined));
    setForm((prev) => ({ ...prev, [field]: value }));
  }, [setForm]);

  const onVariantSearchTermChange = useCallback((value: string) => {
    setVariantSearchTerm(value);
    setSelectedProductForVariant("");
    setSelectedVariantIds([]);
  }, []);

  const onSelectProductForVariant = useCallback((product: Product) => {
    setSelectedProductForVariant(product.id);
    setVariantSearchTerm(product.name);
    setVariantSearchProducts([]);
  }, []);

  const onAddItem = useCallback(() => {
    setAddItemError("");
    if (selectedVariantIds.length === 0) {
      setAddItemError("Lutfen en az bir varyant secin.");
      return;
    }

    const quantity = toNumberOrNull(addItemQuantity);
    if (!quantity || quantity <= 0) {
      setAddItemError("Gecerli bir miktar girin (en az 1).");
      return;
    }

    const existingVariantIds = new Set(items.map((item) => item.productVariantId));
    const variantIdsToAdd = selectedVariantIds.filter((id) => !existingVariantIds.has(id));
    if (variantIdsToAdd.length === 0) {
      setAddItemError("Secilen varyantlar pakete zaten eklendi.");
      return;
    }

    setItems((prev) => {
      const nextItems = [...prev];
      for (const variantId of variantIdsToAdd) {
        const label = variantOptions.find((option) => option.value === variantId)?.label ?? variantId;
        nextItems.push({
          rowId: createPackageRowId(),
          productVariantId: variantId,
          variantLabel: label,
          quantity: String(quantity),
        });
      }
      return nextItems;
    });

    setErrors((prev) => clearFieldError(prev, "items", undefined));
    setSelectedVariantIds([]);
    setAddItemQuantity("1");
  }, [addItemQuantity, items, selectedVariantIds, variantOptions]);

  const onRemoveItem = useCallback((rowId: string) => {
    setItems((prev) => prev.filter((item) => item.rowId !== rowId));
  }, []);

  const onItemQuantityChange = useCallback((rowId: string, value: string) => {
    setItems((prev) => prev.map((item) => (item.rowId === rowId ? { ...item, quantity: value } : item)));
  }, []);

  const validate = useCallback((): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Paket adi zorunludur.";
    if (!form.code.trim()) nextErrors.code = "Paket kodu zorunludur.";
    if (items.length === 0) nextErrors.items = "En az bir urun kalemi eklenmeli.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form.code, form.name, items.length]);

  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProductPackage(
          editingId,
          buildUpdateProductPackagePayload(form, items, editingIsActive),
        );
      } else {
        await createProductPackage(buildCreateProductPackagePayload(form, items));
      }

      completeSubmit(() => {
        setFormError("");
        setErrors({});
        setItems([]);
        setEditingIsActive(true);
        resetItemSearch();
      });
      await onRefreshPackages();
    } catch {
      setFormError(
        editingId
          ? "Paket guncellenemedi. Lutfen tekrar deneyin."
          : "Paket olusturulamadi. Lutfen tekrar deneyin.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    completeSubmit,
    editingId,
    editingIsActive,
    form,
    items,
    onRefreshPackages,
    resetItemSearch,
    validate,
  ]);

  return {
    drawerOpen,
    editingId,
    loadingDetail,
    submitting,
    formError,
    form,
    errors,
    items,
    variantSearchTerm,
    variantSearchLoading,
    variantSearchProducts,
    selectedProductForVariant,
    variantOptions,
    variantsLoading,
    selectedVariantIds,
    addItemQuantity,
    addItemError,
    onVariantSearchTermChange,
    onSelectProductForVariant,
    onSelectedVariantIdsChange: setSelectedVariantIds,
    onAddItemQuantityChange: setAddItemQuantity,
    onOpenDrawer,
    onCloseDrawer,
    onEditPackage,
    onFormChange,
    onAddItem,
    onRemoveItem,
    onItemQuantityChange,
    onSubmit,
  };
}
