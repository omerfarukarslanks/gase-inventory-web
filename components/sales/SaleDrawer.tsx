"use client";

import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import {
  type SaleLineForm,
  type FieldErrors,
  type VariantOption,
} from "@/components/sales/types";
import type { CreateCustomerRequest, Customer } from "@/lib/customers";
import type { PaymentMethod } from "@/lib/sales";
import SaleDrawerDetailsSection from "@/components/sales/SaleDrawerDetailsSection";
import SaleDrawerLinesSection from "@/components/sales/SaleDrawerLinesSection";
import { useLang } from "@/context/LangContext";

type SaleDrawerProps = {
  open: boolean;
  editMode: boolean;
  submitting: boolean;
  scopeReady: boolean;
  loadingVariants: boolean;
  canTenantOnly: boolean;
  storeOptions: Array<{ value: string; label: string }>;
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  onCustomerSelected: (customer: Customer) => void;
  customerDropdownRefreshKey: number;
  onQuickCreateCustomer: (payload: CreateCustomerRequest) => Promise<Customer>;
  variantOptions: VariantOption[];
  variantFieldLabel?: string;
  variantPlaceholder?: string;
  loadingMoreVariants: boolean;
  variantHasMore: boolean;
  onLoadMoreVariants: () => void;
  storeId: string;
  onStoreIdChange: (value: string) => void;
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  paymentMethod: PaymentMethod | "";
  onPaymentMethodChange: (value: PaymentMethod | "") => void;
  initialPaymentAmount: string;
  onInitialPaymentAmountChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  lines: SaleLineForm[];
  onChangeLine: (rowId: string, patch: Partial<SaleLineForm>) => void;
  onApplyVariantPreset: (rowId: string, variantId: string) => void;
  onAddLine: () => void;
  onRemoveLine: (rowId: string) => void;
  errors: FieldErrors;
  onClearError: (field: keyof FieldErrors) => void;
  formError: string;
  onClose: () => void;
  onSubmit: () => void;
};

export default function SaleDrawer({
  open,
  editMode,
  submitting,
  scopeReady,
  loadingVariants,
  canTenantOnly,
  storeOptions,
  customerId,
  onCustomerIdChange,
  onCustomerSelected,
  customerDropdownRefreshKey,
  onQuickCreateCustomer,
  variantOptions,
  variantFieldLabel,
  variantPlaceholder,
  loadingMoreVariants,
  variantHasMore,
  onLoadMoreVariants,
  storeId,
  onStoreIdChange,
  name,
  surname,
  phoneNumber,
  email,
  paymentMethod,
  onPaymentMethodChange,
  initialPaymentAmount,
  onInitialPaymentAmountChange,
  note,
  onNoteChange,
  lines,
  onChangeLine,
  onApplyVariantPreset,
  onAddLine,
  onRemoveLine,
  errors,
  onClearError,
  formError,
  onClose,
  onSubmit,
}: SaleDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="top"
      title={editMode ? t("sales.drawerEditTitle") : t("sales.new")}
      description={editMode ? t("sales.drawerEditDescription") : t("sales.drawerCreateDescription")}
      closeDisabled={submitting}
      className="!max-h-[90vh]"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            onClick={onClose}
            variant="secondary"
            className="px-3 py-1.5"
            disabled={submitting}
          />
          <Button
            label={submitting ? t("common.saving") : editMode ? t("common.update") : t("sales.saveSale")}
            onClick={onSubmit}
            loading={submitting}
            variant="primarySolid"
            className="px-3 py-1.5"
            disabled={!scopeReady || (!editMode && loadingVariants)}
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <SaleDrawerDetailsSection
          drawerOpen={open}
          editMode={editMode}
          canTenantOnly={canTenantOnly}
          storeOptions={storeOptions}
          storeId={storeId}
          onStoreIdChange={onStoreIdChange}
          customerId={customerId}
          customerName={name}
          customerSurname={surname}
          customerPhoneNumber={phoneNumber}
          customerEmail={email}
          onCustomerIdChange={onCustomerIdChange}
          onCustomerSelected={onCustomerSelected}
          customerDropdownRefreshKey={customerDropdownRefreshKey}
          onQuickCreateCustomer={onQuickCreateCustomer}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
          initialPaymentAmount={initialPaymentAmount}
          onInitialPaymentAmountChange={onInitialPaymentAmountChange}
          note={note}
          onNoteChange={onNoteChange}
          errors={errors}
          onClearError={onClearError}
        />

        {!editMode && (
          <SaleDrawerLinesSection
            loadingVariants={loadingVariants}
            variantOptions={variantOptions}
            variantFieldLabel={variantFieldLabel ?? t("sales.variantLabel")}
            variantPlaceholder={variantPlaceholder ?? t("sales.variantPlaceholder")}
            loadingMoreVariants={loadingMoreVariants}
            variantHasMore={variantHasMore}
            onLoadMoreVariants={onLoadMoreVariants}
            lines={lines}
            onChangeLine={onChangeLine}
            onApplyVariantPreset={onApplyVariantPreset}
            onAddLine={onAddLine}
            onRemoveLine={onRemoveLine}
            errors={errors}
          />
        )}

        {formError && (
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-sm text-error">{formError}</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
