"use client";

import type { InventoryStoreStockItem } from "@/lib/inventory";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import TextareaField from "@/components/ui/TextareaField";
import { cn } from "@/lib/cn";
import { useLang } from "@/context/LangContext";

function formatNumber(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return "0";
  return numeric.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
}

export type TransferTarget = {
  productVariantId: string;
  productName: string;
  variantName: string;
  stores: InventoryStoreStockItem[];
};

export type TransferFormState = {
  fromStoreId: string;
  toStoreId: string;
  quantity: string;
  reason: string;
  note: string;
};

type TransferDrawerProps = {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  formError: string;
  target: TransferTarget | null;
  form: TransferFormState;
  allStoreOptions: { value: string; label: string }[];
  isMobile: boolean;
  onClose: () => void;
  onFormChange: (patch: Partial<TransferFormState>) => void;
  onSubmit: () => void;
};

export default function TransferDrawer({
  open,
  loading,
  submitting,
  formError,
  target,
  form,
  allStoreOptions,
  isMobile,
  onClose,
  onFormChange,
  onSubmit,
}: TransferDrawerProps) {
  const { t } = useLang();

  const fromStoreOptions = (target?.stores ?? []).map((store) => ({
    value: store.storeId,
    label: store.storeName,
  }));

  const toStoreOptions = allStoreOptions.filter((store) => store.value !== form.fromStoreId);

  const selectedFromStore = target?.stores.find((store) => store.storeId === form.fromStoreId) ?? null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={t("stock.transfer")}
      description={target ? `${target.productName} / ${target.variantName}` : ""}
      closeDisabled={submitting}
      className={cn(isMobile ? "!max-w-none" : "!max-w-[560px]")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={submitting}
            variant="secondary"
          />
          <Button
            label={submitting ? t("common.saving") : t("common.save")}
            type="button"
            onClick={onSubmit}
            loading={submitting}
            variant="primarySolid"
          />
        </div>
      }
    >
      <div className="space-y-3 p-5">
        {loading ? (
          <p className="text-sm text-muted">{t("stock.loadingTransfer")}</p>
        ) : (
          <>
            <FormField label={`${t("stock.sourceStore")} *`}>
              <SearchableDropdown
                options={fromStoreOptions}
                value={form.fromStoreId}
                onChange={(value) => onFormChange({ fromStoreId: value })}
                placeholder={t("stock.sourceStorePlaceholder")}
                showEmptyOption={false}
              />
            </FormField>

            <FormField label={`${t("stock.targetStore")} *`}>
              <SearchableDropdown
                options={toStoreOptions}
                value={form.toStoreId}
                onChange={(value) => onFormChange({ toStoreId: value })}
                placeholder={t("stock.targetStorePlaceholder")}
                showEmptyOption={false}
              />
            </FormField>

            {selectedFromStore && (
              <div className="rounded-xl border border-border bg-surface2/20 px-3 py-2 text-xs text-muted">
                {t("stock.sourceStoreStock")}: <span className="font-semibold text-text">{formatNumber(selectedFromStore.quantity)}</span>
              </div>
            )}

            <FormField label={`${t("stock.quantity")} *`}>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) => onFormChange({ quantity: event.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("stock.reason")}>
              <input
                type="text"
                value={form.reason}
                onChange={(event) => onFormChange({ reason: event.target.value })}
                placeholder={t("stock.reasonPlaceholder")}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <TextareaField
              label={t("stock.note")}
              value={form.note}
              onChange={(value) => onFormChange({ note: value })}
              placeholder={t("stock.notePlaceholder")}
              textareaClassName="min-h-[90px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </>
        )}

        {formError && <p className="text-sm text-error">{formError}</p>}
      </div>
    </Drawer>
  );
}
