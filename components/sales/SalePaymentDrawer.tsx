"use client";

import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { CURRENCY_OPTIONS } from "@/components/products/types";
import { getPaymentMethodOptions } from "@/components/sales/types";
import type { Currency } from "@/lib/products";
import type { PaymentMethod } from "@/lib/sales";
import { useLang } from "@/context/LangContext";

type SalePaymentDrawerProps = {
  open: boolean;
  editingPaymentId: string | null;
  paymentSubmitting: boolean;
  paymentAmount: string;
  paymentPaidAtInput: string;
  paymentMethodInput: PaymentMethod;
  paymentCurrency: Currency;
  paymentNoteInput: string;
  paymentFormError: string;
  onClose: () => void;
  onSubmit: () => void;
  onPaymentAmountChange: (value: string) => void;
  onPaymentPaidAtInputChange: (value: string) => void;
  onPaymentMethodInputChange: (value: string) => void;
  onPaymentCurrencyChange: (value: string) => void;
  onPaymentNoteInputChange: (value: string) => void;
};

export default function SalePaymentDrawer({
  open,
  editingPaymentId,
  paymentSubmitting,
  paymentAmount,
  paymentPaidAtInput,
  paymentMethodInput,
  paymentCurrency,
  paymentNoteInput,
  paymentFormError,
  onClose,
  onSubmit,
  onPaymentAmountChange,
  onPaymentPaidAtInputChange,
  onPaymentMethodInputChange,
  onPaymentCurrencyChange,
  onPaymentNoteInputChange,
}: SalePaymentDrawerProps) {
  const { t } = useLang();
  const paymentMethodOptions = getPaymentMethodOptions(t);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingPaymentId ? t("sales.updatePayment") : t("sales.addPayment")}
      description={t("sales.paymentDrawerDescription")}
      closeDisabled={paymentSubmitting}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            onClick={onClose}
            variant="secondary"
            disabled={paymentSubmitting}
          />
          <Button
            label={paymentSubmitting ? t("common.saving") : t("common.save")}
            onClick={onSubmit}
            variant="primarySolid"
            loading={paymentSubmitting}
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <FormField label={`${t("sales.amount")} *`}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={paymentAmount}
            onChange={(event) => onPaymentAmountChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>

        <FormField label={t("sales.paymentDate")}>
          <input
            type="date"
            value={paymentPaidAtInput}
            onChange={(event) => onPaymentPaidAtInputChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>

        <FormField label={`${t("sales.paymentMethod")} *`}>
          <SearchableDropdown
            options={paymentMethodOptions}
            value={paymentMethodInput}
            onChange={onPaymentMethodInputChange}
            placeholder={t("sales.paymentMethodPlaceholder")}
            showEmptyOption={false}
            allowClear={false}
          />
        </FormField>

        <FormField label={`${t("sales.currency")} *`}>
          <SearchableDropdown
            options={CURRENCY_OPTIONS}
            value={paymentCurrency}
            onChange={onPaymentCurrencyChange}
            showEmptyOption={false}
            allowClear={false}
          />
        </FormField>

        <TextareaField
          label={t("stock.note")}
          value={paymentNoteInput}
          onChange={onPaymentNoteInputChange}
          placeholder={t("stock.notePlaceholder")}
          textareaClassName="min-h-22 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />

        {paymentFormError && <p className="text-sm text-error">{paymentFormError}</p>}
      </div>
    </Drawer>
  );
}
