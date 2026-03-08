"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import CustomerInfinityDropdown from "@/components/sales/CustomerInfinityDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { trimText, trimToUndefined } from "@/lib/payload";
import type {
  CreateCustomerRequest,
  Customer,
  CustomerGender,
} from "@/lib/customers";
import { getGenderOptions } from "@/components/customers/types";
import { useLang } from "@/context/LangContext";
import { clearStringError } from "@/lib/form-errors";

type SaleQuickCustomerCreateProps = {
  drawerOpen: boolean;
  customerId: string;
  customerName: string;
  customerSurname: string;
  customerPhoneNumber: string;
  customerEmail: string;
  customerError?: string;
  customerDropdownRefreshKey: number;
  onCustomerIdChange: (value: string) => void;
  onCustomerSelected: (customer: Customer) => void;
  onQuickCreateCustomer: (payload: CreateCustomerRequest) => Promise<Customer>;
};

type QuickCustomerForm = {
  name: string;
  surname: string;
  address: string;
  country: string;
  city: string;
  district: string;
  phoneNumber: string;
  email: string;
  gender: string;
  birthDate: string;
};

const EMPTY_QUICK_CUSTOMER_FORM: QuickCustomerForm = {
  name: "",
  surname: "",
  address: "",
  country: "",
  city: "",
  district: "",
  phoneNumber: "",
  email: "",
  gender: "",
  birthDate: "",
};

export default function SaleQuickCustomerCreate({
  drawerOpen,
  customerId,
  customerName,
  customerSurname,
  customerPhoneNumber,
  customerEmail,
  customerError,
  customerDropdownRefreshKey,
  onCustomerIdChange,
  onCustomerSelected,
  onQuickCreateCustomer,
}: SaleQuickCustomerCreateProps) {
  const { t } = useLang();
  const genderOptions = getGenderOptions(t);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateSubmitting, setQuickCreateSubmitting] = useState(false);
  const [quickCreateError, setQuickCreateError] = useState("");
  const [quickForm, setQuickForm] = useState<QuickCustomerForm>(EMPTY_QUICK_CUSTOMER_FORM);

  useEffect(() => {
    if (drawerOpen) return;
    setQuickCreateOpen(false);
    setQuickCreateError("");
    setQuickForm(EMPTY_QUICK_CUSTOMER_FORM);
  }, [drawerOpen]);

  const onChangeQuickField = (field: keyof QuickCustomerForm, value: string) => {
    clearStringError(quickCreateError, setQuickCreateError);
    setQuickForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCloseQuickCreate = () => {
    if (quickCreateSubmitting) return;
    setQuickCreateOpen(false);
    clearStringError(quickCreateError, setQuickCreateError);
    setQuickForm(EMPTY_QUICK_CUSTOMER_FORM);
  };

  const onSubmitQuickCreate = async () => {
    const trimmedName = trimText(quickForm.name);
    const trimmedSurname = trimText(quickForm.surname);

    if (!trimmedName || !trimmedSurname) {
      setQuickCreateError(t("sales.quickCustomerRequired"));
      return;
    }

    setQuickCreateSubmitting(true);
    clearStringError(quickCreateError, setQuickCreateError);
    try {
      const created = await onQuickCreateCustomer({
        name: trimmedName,
        surname: trimmedSurname,
        address: trimToUndefined(quickForm.address),
        country: trimToUndefined(quickForm.country),
        city: trimToUndefined(quickForm.city),
        district: trimToUndefined(quickForm.district),
        phoneNumber: trimToUndefined(quickForm.phoneNumber),
        email: trimToUndefined(quickForm.email),
        gender: (trimToUndefined(quickForm.gender) as CustomerGender | undefined) ?? undefined,
        birthDate: trimToUndefined(quickForm.birthDate),
      });

      onCustomerSelected(created);
      setQuickCreateOpen(false);
      clearStringError(quickCreateError, setQuickCreateError);
      setQuickForm(EMPTY_QUICK_CUSTOMER_FORM);
    } catch {
      setQuickCreateError(t("sales.quickCustomerError"));
    } finally {
      setQuickCreateSubmitting(false);
    }
  };

  return (
    <div className="md:col-span-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-muted">{t("sales.customerLabel")} *</label>
        <button
          type="button"
          onClick={() => setQuickCreateOpen((prev) => !prev)}
          disabled={quickCreateSubmitting}
          className="rounded-lg border border-border bg-surface2 px-2 py-1 text-[11px] font-semibold text-text2 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-60"
        >
          {quickCreateOpen ? t("sales.closeCustomerCreate") : `+ ${t("sales.addCustomer")}`}
        </button>
      </div>

      <CustomerInfinityDropdown
        value={customerId}
        onChange={onCustomerIdChange}
        onSelectCustomer={onCustomerSelected}
        refreshKey={customerDropdownRefreshKey}
        placeholder={t("sales.customerPlaceholder")}
      />
      {customerError && <p className="mt-1 text-xs text-error">{customerError}</p>}

      {customerId && (
        <div className="mt-2 rounded-xl border border-border bg-surface2/40 p-2 text-xs text-text2">
          <div>{t("sales.fullNameLabel")}: {[customerName, customerSurname].filter(Boolean).join(" ") || "-"}</div>
          <div>{t("customers.colPhone")}: {customerPhoneNumber || "-"}</div>
          <div>{t("customers.colEmail")}: {customerEmail || "-"}</div>
        </div>
      )}

      {quickCreateOpen && (
        <div className="mt-3 rounded-xl border border-border bg-surface2/40 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <FormField label={`${t("customers.colName")} *`}>
              <input
                type="text"
                value={quickForm.name}
                onChange={(event) => onChangeQuickField("name", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={`${t("customers.surname")} *`}>
              <input
                type="text"
                value={quickForm.surname}
                onChange={(event) => onChangeQuickField("surname", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={t("customers.colPhone")}>
              <input
                type="text"
                value={quickForm.phoneNumber}
                onChange={(event) => onChangeQuickField("phoneNumber", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={t("customers.colEmail")}>
              <input
                type="email"
                value={quickForm.email}
                onChange={(event) => onChangeQuickField("email", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={t("customers.country")}>
              <input
                type="text"
                value={quickForm.country}
                onChange={(event) => onChangeQuickField("country", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={t("customers.city")}>
              <input
                type="text"
                value={quickForm.city}
                onChange={(event) => onChangeQuickField("city", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={t("customers.district")}>
              <input
                type="text"
                value={quickForm.district}
                onChange={(event) => onChangeQuickField("district", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label={t("customers.gender")}>
              <SearchableDropdown
                options={genderOptions}
                value={quickForm.gender}
                onChange={(value) => onChangeQuickField("gender", value)}
                placeholder={t("customers.genderPlaceholder")}
                emptyOptionLabel={t("customers.genderPlaceholder")}
              />
            </FormField>
            <FormField label={t("customers.birthDate")}>
              <input
                type="date"
                value={quickForm.birthDate}
                onChange={(event) => onChangeQuickField("birthDate", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <div className="md:col-span-2">
              <TextareaField
                label={t("customers.address")}
                value={quickForm.address}
                onChange={(value) => onChangeQuickField("address", value)}
                placeholder={t("customers.addressPlaceholder")}
                rows={3}
                textareaClassName="min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {quickCreateError && <p className="mt-2 text-xs text-error">{quickCreateError}</p>}

          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              label={t("common.cancel")}
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={onCloseQuickCreate}
              disabled={quickCreateSubmitting}
            />
            <Button
              label={quickCreateSubmitting ? t("sales.quickCustomerCreating") : t("sales.addCustomer")}
              variant="primarySolid"
              className="px-2 py-1 text-xs"
              onClick={onSubmitQuickCreate}
              disabled={quickCreateSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
