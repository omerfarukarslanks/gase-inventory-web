"use client";

import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import TextareaField from "@/components/ui/TextareaField";
import SaleQuickCustomerCreate from "@/components/sales/SaleQuickCustomerCreate";
import { getPaymentMethodOptions, type FieldErrors } from "@/components/sales/types";
import type { CreateCustomerRequest, Customer } from "@/lib/customers";
import type { PaymentMethod } from "@/lib/sales";
import { useLang } from "@/context/LangContext";

type SaleDrawerDetailsSectionProps = {
  drawerOpen: boolean;
  editMode: boolean;
  canTenantOnly: boolean;
  storeOptions: Array<{ value: string; label: string }>;
  storeId: string;
  onStoreIdChange: (value: string) => void;
  customerId: string;
  customerName: string;
  customerSurname: string;
  customerPhoneNumber: string;
  customerEmail: string;
  onCustomerIdChange: (value: string) => void;
  onCustomerSelected: (customer: Customer) => void;
  customerDropdownRefreshKey: number;
  onQuickCreateCustomer: (payload: CreateCustomerRequest) => Promise<Customer>;
  paymentMethod: PaymentMethod | "";
  onPaymentMethodChange: (value: PaymentMethod | "") => void;
  initialPaymentAmount: string;
  onInitialPaymentAmountChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  errors: FieldErrors;
  onClearError: (field: keyof FieldErrors) => void;
};

export default function SaleDrawerDetailsSection({
  drawerOpen,
  editMode,
  canTenantOnly,
  storeOptions,
  storeId,
  onStoreIdChange,
  customerId,
  customerName,
  customerSurname,
  customerPhoneNumber,
  customerEmail,
  onCustomerIdChange,
  onCustomerSelected,
  customerDropdownRefreshKey,
  onQuickCreateCustomer,
  paymentMethod,
  onPaymentMethodChange,
  initialPaymentAmount,
  onInitialPaymentAmountChange,
  note,
  onNoteChange,
  errors,
  onClearError,
}: SaleDrawerDetailsSectionProps) {
  const { t } = useLang();
  const paymentMethodOptions = getPaymentMethodOptions(t);

  return (
    <section className="rounded-xl2 border border-border bg-surface p-4">
      <div className="grid gap-3 md:grid-cols-2">
        {!editMode && canTenantOnly && (
          <FormField label={`${t("common.storeFilter")} *`}>
            <SearchableDropdown
              options={storeOptions}
              value={storeId}
              onChange={(value) => {
                onClearError("storeId");
                onStoreIdChange(value);
              }}
              placeholder={t("stock.storePlaceholder")}
              showEmptyOption={false}
            />
            {errors.storeId && <p className="mt-1 text-xs text-error">{errors.storeId}</p>}
          </FormField>
        )}

        <SaleQuickCustomerCreate
          drawerOpen={drawerOpen}
          customerId={customerId}
          customerName={customerName}
          customerSurname={customerSurname}
          customerPhoneNumber={customerPhoneNumber}
          customerEmail={customerEmail}
          customerError={errors.customerId}
          customerDropdownRefreshKey={customerDropdownRefreshKey}
          onCustomerIdChange={onCustomerIdChange}
          onCustomerSelected={onCustomerSelected}
          onQuickCreateCustomer={onQuickCreateCustomer}
        />

        {!editMode && (
          <>
            <FormField label={`${t("sales.paymentMethod")} *`}>
              <SearchableDropdown
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={(value) => {
                  onClearError("paymentMethod");
                  onPaymentMethodChange((value || "") as PaymentMethod | "");
                }}
                placeholder={t("sales.paymentMethodPlaceholder")}
                showEmptyOption={false}
                allowClear={false}
              />
              {errors.paymentMethod && <p className="mt-1 text-xs text-error">{errors.paymentMethod}</p>}
            </FormField>

            <FormField label={`${t("sales.initialPaymentAmount")} *`}>
              <input
                type="number"
                min={0}
                step="0.01"
                value={initialPaymentAmount}
                onChange={(event) => {
                  onClearError("initialPaymentAmount");
                  onInitialPaymentAmountChange(event.target.value);
                }}
                className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.initialPaymentAmount && <p className="mt-1 text-xs text-error">{errors.initialPaymentAmount}</p>}
            </FormField>
          </>
        )}

        <div className="md:col-span-2">
          <TextareaField
            label={t("stock.note")}
            value={note}
            onChange={onNoteChange}
            placeholder={t("stock.notePlaceholder")}
            textareaClassName="min-h-[72px] w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </section>
  );
}
