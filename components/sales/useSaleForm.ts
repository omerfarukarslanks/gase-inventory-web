"use client";

import { useCallback, useState } from "react";
import { createCustomer, type CreateCustomerRequest, type Customer } from "@/lib/customers";
import { toNumberOrNull } from "@/lib/format";
import {
  createSale,
  getSaleById,
  updateSale,
  type CreateSaleLinePayload,
  type CreateSalePayload,
  type PaymentMethod,
  type SaleListItem,
  type UpdateSalePayload,
} from "@/lib/sales";
import { normalizeSaleDetail } from "@/lib/sales-normalize";
import {
  createLineRow,
  type FieldErrors,
  type SaleLineForm,
  type VariantPreset,
} from "@/components/sales/types";

type UseSaleFormOptions = {
  canTenantOnly: boolean;
  scopedStoreId: string;
  isWholesaleStoreType: boolean;
  variantPresetsById: Record<string, VariantPreset>;
  onRefreshSales: () => Promise<void>;
};

export function useSaleForm({
  canTenantOnly,
  scopedStoreId,
  isWholesaleStoreType,
  variantPresetsById,
  onRefreshSales,
}: UseSaleFormOptions) {
  const [saleDrawerOpen, setSaleDrawerOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerDropdownRefreshKey, setCustomerDropdownRefreshKey] = useState(0);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("CASH");
  const [initialPaymentAmount, setInitialPaymentAmount] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<SaleLineForm[]>([createLineRow()]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const resetSaleForm = useCallback(() => {
    setEditingSaleId(null);
    setStoreId(canTenantOnly ? scopedStoreId : "");
    setCustomerId("");
    setName("");
    setSurname("");
    setPhoneNumber("");
    setEmail("");
    setPaymentMethod("CASH");
    setInitialPaymentAmount("");
    setNote("");
    setLines([createLineRow()]);
    setErrors({});
    setFormError("");
  }, [canTenantOnly, scopedStoreId]);

  const handleCustomerIdChange = useCallback((value: string) => {
    clearFieldError("customerId");
    setCustomerId(value);

    if (!value) {
      setName("");
      setSurname("");
      setPhoneNumber("");
      setEmail("");
    }
  }, [clearFieldError]);

  const onSelectCustomer = useCallback((customer: Customer) => {
    setCustomerId(customer.id);
    setName(customer.name ?? "");
    setSurname(customer.surname ?? "");
    setPhoneNumber(customer.phoneNumber ?? "");
    setEmail(customer.email ?? "");
  }, []);

  const onQuickCreateCustomer = useCallback(async (payload: CreateCustomerRequest) => {
    const created = await createCustomer(payload);
    setCustomerDropdownRefreshKey((prev) => prev + 1);
    return created;
  }, []);

  const onChangeLine = useCallback((rowId: string, patch: Partial<SaleLineForm>) => {
    setErrors((prev) => ({ ...prev, lines: undefined }));
    setLines((prev) => prev.map((line) => (line.rowId === rowId ? { ...line, ...patch } : line)));
  }, []);

  const applyVariantPreset = useCallback((rowId: string, variantId: string) => {
    const preset = variantPresetsById[variantId];
    if (!preset) {
      onChangeLine(rowId, { productVariantId: variantId });
      return;
    }

    const storePreset = storeId
      ? preset.stores.find((store) => store.storeId === storeId) ?? preset.stores[0]
      : preset.stores[0];
    const selected = storePreset ?? preset;

    onChangeLine(rowId, {
      productVariantId: variantId,
      currency: selected.currency,
      unitPrice:
        selected.unitPrice != null
          ? String(selected.unitPrice)
          : selected.lineTotal != null
            ? String(selected.lineTotal)
            : "",
      discountMode: selected.discountAmount != null ? "amount" : "percent",
      discountPercent: selected.discountPercent != null ? String(selected.discountPercent) : "",
      discountAmount: selected.discountAmount != null ? String(selected.discountAmount) : "",
      taxMode: selected.taxAmount != null ? "amount" : "percent",
      taxPercent: selected.taxPercent != null ? String(selected.taxPercent) : "",
      taxAmount: selected.taxAmount != null ? String(selected.taxAmount) : "",
    });
  }, [onChangeLine, storeId, variantPresetsById]);

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, createLineRow()]);
  }, []);

  const removeLine = useCallback((rowId: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.rowId !== rowId)));
  }, []);

  const openSaleDrawer = useCallback(() => {
    resetSaleForm();
    setSuccess("");
    setSaleDrawerOpen(true);
  }, [resetSaleForm]);

  const closeSaleDrawer = useCallback(() => {
    if (submitting) return;
    setFormError("");
    setSaleDrawerOpen(false);
  }, [submitting]);

  const openEditDrawer = useCallback(async (sale: SaleListItem) => {
    resetSaleForm();
    setSuccess("");
    setFormError("");
    setSaleDrawerOpen(true);
    setEditingSaleId(sale.id);
    setSubmitting(true);

    try {
      const response = await getSaleById(sale.id);
      const detail = normalizeSaleDetail(response);
      if (!detail) {
        setFormError("Satis detayi alinamadi.");
        return;
      }

      setName(detail.name ?? "");
      setSurname(detail.surname ?? "");
      setPhoneNumber(detail.phoneNumber ?? "");
      setEmail(detail.email ?? "");
      setCustomerId(detail.customerId ?? "");
      setNote(detail.note ?? "");
      if (detail.storeId) setStoreId(detail.storeId);
      setLines(
        detail.lines.length > 0
          ? detail.lines.map((line) => ({
              rowId: `line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              productVariantId: line.productVariantId ?? line.productPackageId ?? "",
              quantity: line.quantity != null ? String(line.quantity) : "1",
              currency: line.currency ?? "TRY",
              unitPrice: line.unitPrice != null ? String(line.unitPrice) : "",
              discountMode: line.discountAmount != null ? ("amount" as const) : ("percent" as const),
              discountPercent: line.discountPercent != null ? String(line.discountPercent) : "",
              discountAmount: line.discountAmount != null ? String(line.discountAmount) : "",
              taxMode: line.taxAmount != null ? ("amount" as const) : ("percent" as const),
              taxPercent: line.taxPercent != null ? String(line.taxPercent) : "",
              taxAmount: line.taxAmount != null ? String(line.taxAmount) : "",
              campaignCode: line.campaignCode ?? "",
            }))
          : [createLineRow()],
      );
    } catch {
      setFormError("Satis detayi yuklenemedi.");
    } finally {
      setSubmitting(false);
    }
  }, [resetSaleForm]);

  const validate = useCallback((): boolean => {
    const nextErrors: FieldErrors = {};

    if (!customerId) nextErrors.customerId = "Musteri secimi zorunludur.";

    if (!editingSaleId && canTenantOnly && !storeId) {
      nextErrors.storeId = "Magaza secimi zorunludur.";
    }

    if (!editingSaleId && !paymentMethod) {
      nextErrors.paymentMethod = "Odeme yontemi zorunludur.";
    }

    if (!editingSaleId) {
      const amount = toNumberOrNull(initialPaymentAmount);
      if (amount == null || amount < 0) {
        nextErrors.initialPaymentAmount = "Gecerli bir odenen tutar girin.";
      }
    }

    if (!editingSaleId) {
      if (lines.length === 0) {
        nextErrors.lines = "En az bir satis satiri eklemelisiniz.";
      } else {
        const invalidLine = lines.some((line) => {
          const quantity = toNumberOrNull(line.quantity);
          const unitPrice = toNumberOrNull(line.unitPrice);
          return !line.productVariantId || quantity == null || quantity <= 0 || unitPrice == null || unitPrice < 0;
        });

        if (invalidLine) {
          nextErrors.lines = isWholesaleStoreType
            ? "Tum satirlarda paket, adet ve birim fiyat alanlari gecerli olmalidir."
            : "Tum satirlarda varyant, adet ve birim fiyat alanlari gecerli olmalidir.";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [
    canTenantOnly,
    customerId,
    editingSaleId,
    initialPaymentAmount,
    isWholesaleStoreType,
    lines,
    paymentMethod,
    storeId,
  ]);

  const buildLinePayloads = useCallback((): CreateSaleLinePayload[] => (
    lines.map((line) => {
      const common = {
        quantity: Number(line.quantity),
        currency: line.currency,
        unitPrice: Number(line.unitPrice),
        ...(line.discountMode === "percent" && line.discountPercent
          ? { discountPercent: Number(line.discountPercent) }
          : {}),
        ...(line.discountMode === "amount" && line.discountAmount
          ? { discountAmount: Number(line.discountAmount) }
          : {}),
        ...(line.taxMode === "percent" && line.taxPercent
          ? { taxPercent: Number(line.taxPercent) }
          : {}),
        ...(line.taxMode === "amount" && line.taxAmount
          ? { taxAmount: Number(line.taxAmount) }
          : {}),
        ...(line.campaignCode.trim() ? { campaignCode: line.campaignCode.trim() } : {}),
      };

      if (isWholesaleStoreType) {
        return {
          productPackageId: line.productVariantId,
          ...common,
        };
      }

      return {
        productVariantId: line.productVariantId,
        ...common,
      };
    })
  ), [isWholesaleStoreType, lines]);

  const onSubmit = useCallback(async () => {
    setFormError("");
    setSuccess("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingSaleId) {
        const payload: UpdateSalePayload = {
          customerId,
          ...(note.trim() ? { meta: { note: note.trim() } } : {}),
        };
        await updateSale(editingSaleId, payload);
        setSuccess("Satis kaydi guncellendi.");
      } else {
        const normalizedStoreId = storeId.trim();
        const payload: CreateSalePayload = {
          ...(canTenantOnly || !normalizedStoreId ? {} : { storeId: normalizedStoreId }),
          customerId,
          meta: {
            note: note.trim() || undefined,
          },
          lines: buildLinePayloads(),
          initialPayment: {
            amount: Number(initialPaymentAmount),
            paymentMethod: paymentMethod as PaymentMethod,
          },
        };
        await createSale(payload);
        setSuccess("Satis kaydi olusturuldu.");
      }

      resetSaleForm();
      setSaleDrawerOpen(false);
      await onRefreshSales();
    } catch {
      setFormError(
        editingSaleId
          ? "Satis guncellenemedi. Lutfen tekrar deneyin."
          : "Satis olusturulamadi. Lutfen tekrar deneyin.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    buildLinePayloads,
    canTenantOnly,
    customerId,
    editingSaleId,
    initialPaymentAmount,
    note,
    onRefreshSales,
    paymentMethod,
    resetSaleForm,
    storeId,
    validate,
  ]);

  return {
    saleDrawerOpen,
    editingSaleId,
    storeId,
    customerId,
    customerDropdownRefreshKey,
    name,
    surname,
    phoneNumber,
    email,
    paymentMethod,
    initialPaymentAmount,
    note,
    lines,
    errors,
    submitting,
    formError,
    success,
    setSuccess,
    clearFieldError,
    handleCustomerIdChange,
    onSelectCustomer,
    onQuickCreateCustomer,
    onChangeLine,
    applyVariantPreset,
    addLine,
    removeLine,
    openSaleDrawer,
    closeSaleDrawer,
    openEditDrawer,
    onSubmit,
    setStoreId,
    setPaymentMethod,
    setInitialPaymentAmount,
    setNote,
  };
}
