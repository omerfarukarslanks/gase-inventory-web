"use client";

import { useCallback, useState } from "react";
import {
  appendSaleLine,
  buildSaleLinePresetPatch,
  patchSaleLine,
  removeSaleLine,
} from "@/components/sales/line-state";
import {
  createLineRow,
  type SaleLineForm,
  type VariantPreset,
} from "@/components/sales/types";

type UseSaleLineStateOptions = {
  storeId: string;
  variantPresetsById: Record<string, VariantPreset>;
  onLinesMutated?: () => void;
};

export function useSaleLineState({
  storeId,
  variantPresetsById,
  onLinesMutated,
}: UseSaleLineStateOptions) {
  const [lines, setLines] = useState<SaleLineForm[]>([createLineRow()]);

  const resetLines = useCallback(() => {
    setLines([createLineRow()]);
  }, []);

  const onChangeLine = useCallback((rowId: string, patch: Partial<SaleLineForm>) => {
    onLinesMutated?.();
    setLines((prev) => patchSaleLine(prev, rowId, patch));
  }, [onLinesMutated]);

  const applyVariantPreset = useCallback((rowId: string, variantId: string) => {
    onLinesMutated?.();
    setLines((prev) => patchSaleLine(
      prev,
      rowId,
      buildSaleLinePresetPatch(variantId, variantPresetsById[variantId], storeId),
    ));
  }, [onLinesMutated, storeId, variantPresetsById]);

  const addLine = useCallback(() => {
    setLines((prev) => appendSaleLine(prev));
  }, []);

  const removeLine = useCallback((rowId: string) => {
    onLinesMutated?.();
    setLines((prev) => removeSaleLine(prev, rowId));
  }, [onLinesMutated]);

  return {
    lines,
    setLines,
    resetLines,
    onChangeLine,
    applyVariantPreset,
    addLine,
    removeLine,
  };
}
