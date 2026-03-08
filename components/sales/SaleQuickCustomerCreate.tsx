"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import CustomerInfinityDropdown from "@/components/sales/CustomerInfinityDropdown";
import type {
  CreateCustomerRequest,
  Customer,
  CustomerGender,
} from "@/lib/customers";

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
  onClearCustomerError: () => void;
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

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

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
  onClearCustomerError,
}: SaleQuickCustomerCreateProps) {
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
    if (quickCreateError) setQuickCreateError("");
    setQuickForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCloseQuickCreate = () => {
    if (quickCreateSubmitting) return;
    setQuickCreateOpen(false);
    setQuickCreateError("");
    setQuickForm(EMPTY_QUICK_CUSTOMER_FORM);
  };

  const onSubmitQuickCreate = async () => {
    if (!quickForm.name.trim() || !quickForm.surname.trim()) {
      setQuickCreateError("Isim ve soyisim zorunludur.");
      return;
    }

    setQuickCreateSubmitting(true);
    setQuickCreateError("");
    try {
      const created = await onQuickCreateCustomer({
        name: quickForm.name.trim(),
        surname: quickForm.surname.trim(),
        address: quickForm.address.trim() || undefined,
        country: quickForm.country.trim() || undefined,
        city: quickForm.city.trim() || undefined,
        district: quickForm.district.trim() || undefined,
        phoneNumber: quickForm.phoneNumber.trim() || undefined,
        email: quickForm.email.trim() || undefined,
        gender: (quickForm.gender || undefined) as CustomerGender | undefined,
        birthDate: quickForm.birthDate || undefined,
      });

      onCustomerIdChange(created.id);
      onCustomerSelected(created);
      onClearCustomerError();
      setQuickCreateOpen(false);
      setQuickCreateError("");
      setQuickForm(EMPTY_QUICK_CUSTOMER_FORM);
    } catch {
      setQuickCreateError("Musteri olusturulamadi. Lutfen tekrar deneyin.");
    } finally {
      setQuickCreateSubmitting(false);
    }
  };

  return (
    <div className="md:col-span-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-muted">Musteri *</label>
        <button
          type="button"
          onClick={() => setQuickCreateOpen((prev) => !prev)}
          disabled={quickCreateSubmitting}
          className="rounded-lg border border-border bg-surface2 px-2 py-1 text-[11px] font-semibold text-text2 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-60"
        >
          {quickCreateOpen ? "Kapat" : "+ Musteri Ekle"}
        </button>
      </div>

      <CustomerInfinityDropdown
        value={customerId}
        onChange={(value) => {
          onClearCustomerError();
          onCustomerIdChange(value);
        }}
        onSelectCustomer={onCustomerSelected}
        refreshKey={customerDropdownRefreshKey}
        placeholder="Musteri secin"
      />
      {customerError && <p className="mt-1 text-xs text-error">{customerError}</p>}

      {customerId && (
        <div className="mt-2 rounded-xl border border-border bg-surface2/40 p-2 text-xs text-text2">
          <div>Ad Soyad: {[customerName, customerSurname].filter(Boolean).join(" ") || "-"}</div>
          <div>Telefon: {customerPhoneNumber || "-"}</div>
          <div>E-posta: {customerEmail || "-"}</div>
        </div>
      )}

      {quickCreateOpen && (
        <div className="mt-3 rounded-xl border border-border bg-surface2/40 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Isim *</label>
              <input
                type="text"
                value={quickForm.name}
                onChange={(event) => onChangeQuickField("name", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Soyisim *</label>
              <input
                type="text"
                value={quickForm.surname}
                onChange={(event) => onChangeQuickField("surname", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Telefon</label>
              <input
                type="text"
                value={quickForm.phoneNumber}
                onChange={(event) => onChangeQuickField("phoneNumber", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">E-posta</label>
              <input
                type="email"
                value={quickForm.email}
                onChange={(event) => onChangeQuickField("email", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Ulke</label>
              <input
                type="text"
                value={quickForm.country}
                onChange={(event) => onChangeQuickField("country", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Sehir</label>
              <input
                type="text"
                value={quickForm.city}
                onChange={(event) => onChangeQuickField("city", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Ilce</label>
              <input
                type="text"
                value={quickForm.district}
                onChange={(event) => onChangeQuickField("district", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Cinsiyet</label>
              <SearchableDropdown
                options={GENDER_OPTIONS}
                value={quickForm.gender}
                onChange={(value) => onChangeQuickField("gender", value)}
                placeholder="Cinsiyet secin"
                emptyOptionLabel="Cinsiyet secin"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Dogum Tarihi</label>
              <input
                type="date"
                value={quickForm.birthDate}
                onChange={(event) => onChangeQuickField("birthDate", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-muted">Adres</label>
              <input
                type="text"
                value={quickForm.address}
                onChange={(event) => onChangeQuickField("address", event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {quickCreateError && <p className="mt-2 text-xs text-error">{quickCreateError}</p>}

          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              label="Vazgec"
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={onCloseQuickCreate}
              disabled={quickCreateSubmitting}
            />
            <Button
              label={quickCreateSubmitting ? "Ekleniyor..." : "Musteri Ekle"}
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
