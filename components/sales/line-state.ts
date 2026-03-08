import {
  createLineRow,
  type SaleLineForm,
  type VariantPreset,
  type VariantStorePreset,
} from "@/components/sales/types";

function resolveStoreScopedVariantPreset(
  preset: VariantPreset,
  storeId: string,
): VariantStorePreset | VariantPreset {
  if (!storeId) {
    return preset.stores[0] ?? preset;
  }

  return preset.stores.find((store) => store.storeId === storeId) ?? preset.stores[0] ?? preset;
}

export function buildSaleLinePresetPatch(
  variantId: string,
  preset: VariantPreset | undefined,
  storeId: string,
): Partial<SaleLineForm> {
  if (!preset) {
    return { productVariantId: variantId };
  }

  const selected = resolveStoreScopedVariantPreset(preset, storeId);

  return {
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
  };
}

export function patchSaleLine(
  lines: SaleLineForm[],
  rowId: string,
  patch: Partial<SaleLineForm>,
): SaleLineForm[] {
  return lines.map((line) => (line.rowId === rowId ? { ...line, ...patch } : line));
}

export function appendSaleLine(lines: SaleLineForm[]): SaleLineForm[] {
  return [...lines, createLineRow()];
}

export function removeSaleLine(lines: SaleLineForm[], rowId: string): SaleLineForm[] {
  return lines.length <= 1 ? lines : lines.filter((line) => line.rowId !== rowId);
}
