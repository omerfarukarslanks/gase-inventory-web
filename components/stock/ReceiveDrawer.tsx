"use client";

import type { Store } from "@/lib/stores";
import type { Currency, ProductVariant } from "@/lib/products";
import type { Supplier } from "@/lib/suppliers";
import type { InventoryReceiveItem } from "@/lib/inventory";
import type { StockEntryInitialEntry } from "@/components/inventory/StockEntryForm";
import Drawer from "@/components/ui/Drawer";
import FormField from "@/components/ui/FormField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import StockEntryForm from "@/components/inventory/StockEntryForm";
import { cn } from "@/lib/cn";
import { useLang } from "@/context/LangContext";

export type ReceiveTarget = {
  productVariantId?: string;
  productName: string;
  variantName?: string;
};

type ReceiveDrawerProps = {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  formError: string;
  target: ReceiveTarget | null;
  variants: ProductVariant[];
  currency: Currency;
  stores: Store[];
  suppliers: Supplier[];
  supplierId: string;
  onSupplierChange: (id: string) => void;
  initialEntriesByVariant: Record<string, StockEntryInitialEntry[]>;
  isMobile: boolean;
  canTenantOnly?: boolean;
  fixedStoreId?: string;
  onClose: () => void;
  onSubmit: (items: InventoryReceiveItem[]) => Promise<void>;
};

export default function ReceiveDrawer({
  open,
  loading,
  submitting,
  formError,
  target,
  variants,
  currency,
  stores,
  suppliers,
  supplierId,
  onSupplierChange,
  initialEntriesByVariant,
  isMobile,
  canTenantOnly = true,
  fixedStoreId,
  onClose,
  onSubmit,
}: ReceiveDrawerProps) {
  const { t } = useLang();

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.surname ? `${supplier.name} ${supplier.surname}` : supplier.name,
  }));

  const handleSubmit = async (items: InventoryReceiveItem[]) => {
    const itemsWithSupplier = supplierId
      ? items.map((item) => ({ ...item, supplierId }))
      : items;
    await onSubmit(itemsWithSupplier);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={t("stock.receive")}
      description={target ? `${target.productName}${target.variantName ? ` / ${target.variantName}` : ""}` : ""}
      closeDisabled={submitting}
      className={cn(isMobile ? "!max-w-none" : "!max-w-[600px]")}
    >
      <div className="space-y-3 p-5">
        {loading ? (
          <p className="text-sm text-muted">{t("stock.loadingReceive")}</p>
        ) : (
          <>
            <FormField label={t("stock.supplier")}>
              <SearchableDropdown
                options={supplierOptions}
                value={supplierId}
                onChange={onSupplierChange}
                placeholder={t("stock.supplierPlaceholder")}
                showEmptyOption
              />
            </FormField>

            <StockEntryForm
              variants={variants}
              productCurrency={currency}
              stores={stores}
              initialEntriesByVariant={initialEntriesByVariant}
              mode="receive"
              showStoreSelector={canTenantOnly}
              fixedStoreId={fixedStoreId}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </>
        )}

        {formError && <p className="text-sm text-error">{formError}</p>}
      </div>
    </Drawer>
  );
}
