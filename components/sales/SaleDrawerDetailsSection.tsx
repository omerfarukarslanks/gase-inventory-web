"use client";

import SearchableDropdown from "@/components/ui/SearchableDropdown";
import SaleQuickCustomerCreate from "@/components/sales/SaleQuickCustomerCreate";
import { PAYMENT_METHOD_OPTIONS, type FieldErrors } from "@/components/sales/types";
import type { CreateCustomerRequest, Customer } from "@/lib/customers";
import type { PaymentMethod } from "@/lib/sales";

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
  return (
    <section className="rounded-xl2 border border-border bg-surface p-4">
      <div className="grid gap-3 md:grid-cols-2">
        {!editMode && canTenantOnly && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Magaza *</label>
            <SearchableDropdown
              options={storeOptions}
              value={storeId}
              onChange={(value) => {
                onClearError("storeId");
                onStoreIdChange(value);
              }}
              placeholder="Magaza secin"
              showEmptyOption={false}
            />
            {errors.storeId && <p className="mt-1 text-xs text-error">{errors.storeId}</p>}
          </div>
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
          onClearCustomerError={() => onClearError("customerId")}
        />

        {!editMode && (
          <>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Odeme Yontemi *</label>
              <SearchableDropdown
                options={PAYMENT_METHOD_OPTIONS}
                value={paymentMethod}
                onChange={(value) => {
                  onClearError("paymentMethod");
                  onPaymentMethodChange((value || "") as PaymentMethod | "");
                }}
                placeholder="Odeme yontemi secin"
                showEmptyOption={false}
                allowClear={false}
              />
              {errors.paymentMethod && <p className="mt-1 text-xs text-error">{errors.paymentMethod}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Odenen Tutar *</label>
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
              {errors.initialPaymentAmount && (
                <p className="mt-1 text-xs text-error">{errors.initialPaymentAmount}</p>
              )}
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-muted">Not</label>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            className="min-h-[72px] w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </section>
  );
}
