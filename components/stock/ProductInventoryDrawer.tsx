"use client";

import type { Store } from "@/lib/stores";
import type { Supplier } from "@/lib/suppliers";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { cn } from "@/lib/cn";
import ProductInventorySingleVariantSection from "@/components/stock/ProductInventorySingleVariantSection";
import ProductInventoryMultiVariantSection from "@/components/stock/ProductInventoryMultiVariantSection";
import { useProductInventoryForm } from "@/components/stock/useProductInventoryForm";
import type {
  ProductInventoryOperation,
  ProductInventoryTarget,
} from "@/components/stock/product-inventory-types";
import { useLang } from "@/context/LangContext";

type Props = {
  open: boolean;
  operation: ProductInventoryOperation | null;
  target: ProductInventoryTarget | null;
  stores: Store[];
  suppliers: Supplier[];
  isMobile: boolean;
  canTenantOnly: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
};

export type { ProductInventoryOperation, ProductInventoryTarget };

export default function ProductInventoryDrawer({
  open,
  operation,
  target,
  stores,
  suppliers,
  isMobile,
  canTenantOnly,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useLang();
  const form = useProductInventoryForm({
    open,
    operation,
    target,
    stores,
    suppliers,
    onClose,
    onSuccess,
    t,
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={form.title}
      description={target?.productName ?? ""}
      closeDisabled={form.submitting}
      className={cn(isMobile ? "!max-w-none" : "!max-w-[560px]")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={form.submitting}
            variant="secondary"
          />
          <Button
            label={form.submitting ? t("common.saving") : t("common.save")}
            type="button"
            onClick={form.handleSubmit}
            loading={form.submitting}
            variant="primarySolid"
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface2/40 px-3 py-2.5">
          <span className="text-xs font-semibold text-muted">{t("stock.allVariantsToggle")}</span>
          <ToggleSwitch
            checked={form.applyToAllVariants}
            onChange={form.setApplyToAllVariants}
            disabled={form.submitting}
          />
        </div>

        {operation === "receive" && (
          <FormField label={t("stock.supplier")}>
            <SearchableDropdown
              options={form.supplierOptions}
              value={form.supplierId}
              onChange={form.setSupplierId}
              placeholder={t("stock.supplierPlaceholder")}
              showEmptyOption
            />
          </FormField>
        )}

        {operation && form.applyToAllVariants ? (
          <ProductInventorySingleVariantSection
            canTenantOnly={canTenantOnly}
            submitting={form.submitting}
            {...form.singleVariantSectionProps}
            t={t}
          />
        ) : operation ? (
          <ProductInventoryMultiVariantSection
            {...form.multiVariantSectionProps}
            t={t}
          />
        ) : null}

        {form.formError && <p className="text-sm text-error">{form.formError}</p>}
      </div>
    </Drawer>
  );
}
