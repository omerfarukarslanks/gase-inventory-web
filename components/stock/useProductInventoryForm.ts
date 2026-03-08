"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Store } from "@/lib/stores";
import type { Supplier } from "@/lib/suppliers";
import type { Currency } from "@/lib/products";
import type { ProductInventoryMultiVariantSectionProps } from "@/components/stock/ProductInventoryMultiVariantSection";
import type { ProductInventorySingleVariantSectionProps } from "@/components/stock/ProductInventorySingleVariantSection";
import type {
  ProductInventoryOperation,
  ProductInventoryTarget,
} from "@/components/stock/product-inventory-types";
import { useProductInventorySubmitActions } from "@/components/stock/useProductInventorySubmitActions";

type TranslateFn = (key: string) => string;

type UseProductInventoryFormOptions = {
  open: boolean;
  operation: ProductInventoryOperation | null;
  target: ProductInventoryTarget | null;
  stores: Store[];
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: (message: string) => void;
  t: TranslateFn;
};

type InventoryFormState = {
  applyToAllVariants: boolean;
  supplierId: string;
  storeId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: string;
  newQuantity: string;
  unitPrice: string;
  currency: Currency;
  applyToAllStores: boolean;
  reason: string;
  note: string;
  variantQtys: Record<string, string>;
  variantNewQtys: Record<string, string>;
  variantStoreIds: Record<string, string>;
};

type SingleVariantSectionFormProps = Omit<
  ProductInventorySingleVariantSectionProps,
  "canTenantOnly" | "submitting" | "t"
>;

type MultiVariantSectionFormProps = Omit<ProductInventoryMultiVariantSectionProps, "t">;

function createInitialInventoryFormState(): InventoryFormState {
  return {
    applyToAllVariants: true,
    supplierId: "",
    storeId: "",
    fromStoreId: "",
    toStoreId: "",
    quantity: "",
    newQuantity: "",
    unitPrice: "",
    currency: "TRY",
    applyToAllStores: false,
    reason: "",
    note: "",
    variantQtys: {},
    variantNewQtys: {},
    variantStoreIds: {},
  };
}

export function useProductInventoryForm({
  open,
  operation,
  target,
  stores,
  suppliers,
  onClose,
  onSuccess,
  t,
}: UseProductInventoryFormOptions) {
  const [formState, setFormState] = useState<InventoryFormState>(createInitialInventoryFormState);

  const resetFormState = useCallback(() => {
    setFormState(createInitialInventoryFormState());
  }, []);

  const updateFormField = useCallback(
    <K extends keyof InventoryFormState>(field: K, value: InventoryFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    resetFormState();
  }, [open, operation, resetFormState]);

  const storeOptions = useMemo(
    () =>
      stores
        .filter((store) => store.isActive)
        .map((store) => ({ value: store.id, label: store.name })),
    [stores],
  );

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.surname ? `${supplier.name} ${supplier.surname}` : supplier.name,
      })),
    [suppliers],
  );

  const toStoreOptions = useMemo(
    () => storeOptions.filter((store) => store.value !== formState.fromStoreId),
    [formState.fromStoreId, storeOptions],
  );

  const variants = target?.variants ?? [];

  const title = operation
    ? {
        receive: t("stock.receive"),
        adjust: t("stock.adjust"),
        transfer: t("stock.transfer"),
      }[operation]
    : "";

  const {
    submitting,
    formError,
    resetSubmissionState,
    handleSubmit,
  } = useProductInventorySubmitActions({
    operation,
    target,
    applyToAllVariants: formState.applyToAllVariants,
    supplierId: formState.supplierId,
    storeId: formState.storeId,
    fromStoreId: formState.fromStoreId,
    toStoreId: formState.toStoreId,
    quantity: formState.quantity,
    newQuantity: formState.newQuantity,
    unitPrice: formState.unitPrice,
    currency: formState.currency,
    applyToAllStores: formState.applyToAllStores,
    reason: formState.reason,
    note: formState.note,
    variantQtys: formState.variantQtys,
    variantNewQtys: formState.variantNewQtys,
    variantStoreIds: formState.variantStoreIds,
    onClose,
    onSuccess,
    t,
  });

  useEffect(() => {
    if (!open) return;
    resetSubmissionState();
  }, [open, resetSubmissionState]);

  const handleVariantQtyChange = useCallback((variantId: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      variantQtys: { ...prev.variantQtys, [variantId]: value },
    }));
  }, []);

  const handleVariantNewQtyChange = useCallback((variantId: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      variantNewQtys: { ...prev.variantNewQtys, [variantId]: value },
    }));
  }, []);

  const singleVariantSectionProps = useMemo<SingleVariantSectionFormProps>(
    () => ({
      operation: operation ?? "receive",
      storeOptions,
      toStoreOptions,
      storeId: formState.storeId,
      onStoreIdChange: (value) => updateFormField("storeId", value),
      fromStoreId: formState.fromStoreId,
      onFromStoreIdChange: (value) => updateFormField("fromStoreId", value),
      toStoreId: formState.toStoreId,
      onToStoreIdChange: (value) => updateFormField("toStoreId", value),
      quantity: formState.quantity,
      onQuantityChange: (value) => updateFormField("quantity", value),
      newQuantity: formState.newQuantity,
      onNewQuantityChange: (value) => updateFormField("newQuantity", value),
      unitPrice: formState.unitPrice,
      onUnitPriceChange: (value) => updateFormField("unitPrice", value),
      currency: formState.currency,
      onCurrencyChange: (value) => updateFormField("currency", value),
      applyToAllStores: formState.applyToAllStores,
      onApplyToAllStoresChange: (checked) => updateFormField("applyToAllStores", checked),
      reason: formState.reason,
      onReasonChange: (value) => updateFormField("reason", value),
      note: formState.note,
      onNoteChange: (value) => updateFormField("note", value),
    }),
    [formState, operation, storeOptions, toStoreOptions, updateFormField],
  );

  const multiVariantSectionProps = useMemo<MultiVariantSectionFormProps>(
    () => ({
      operation: operation ?? "receive",
      variants,
      storeOptions,
      toStoreOptions,
      storeId: formState.storeId,
      onStoreIdChange: (value) => updateFormField("storeId", value),
      fromStoreId: formState.fromStoreId,
      onFromStoreIdChange: (value) => updateFormField("fromStoreId", value),
      toStoreId: formState.toStoreId,
      onToStoreIdChange: (value) => updateFormField("toStoreId", value),
      unitPrice: formState.unitPrice,
      onUnitPriceChange: (value) => updateFormField("unitPrice", value),
      currency: formState.currency,
      onCurrencyChange: (value) => updateFormField("currency", value),
      reason: formState.reason,
      onReasonChange: (value) => updateFormField("reason", value),
      note: formState.note,
      onNoteChange: (value) => updateFormField("note", value),
      variantQtys: formState.variantQtys,
      onVariantQtyChange: handleVariantQtyChange,
      variantNewQtys: formState.variantNewQtys,
      onVariantNewQtyChange: handleVariantNewQtyChange,
    }),
    [
      formState,
      handleVariantNewQtyChange,
      handleVariantQtyChange,
      operation,
      storeOptions,
      toStoreOptions,
      updateFormField,
      variants,
    ],
  );

  return {
    title,
    supplierOptions,
    supplierId: formState.supplierId,
    setSupplierId: (value: string) => updateFormField("supplierId", value),
    applyToAllVariants: formState.applyToAllVariants,
    setApplyToAllVariants: (value: boolean) => updateFormField("applyToAllVariants", value),
    singleVariantSectionProps,
    multiVariantSectionProps,
    submitting,
    formError,
    handleSubmit,
  };
}
