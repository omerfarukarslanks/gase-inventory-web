"use client";

import { useCallback, useState } from "react";
import type { ProductActionParams } from "@/components/stock/StockTable";
import type {
  ProductInventoryOperation,
  ProductInventoryTarget,
} from "@/components/stock/ProductInventoryDrawer";

type UseStockProductDrawerOptions = {
  onRefreshSummary: () => Promise<void>;
  onSuccess: (message: string) => void;
};

export function useStockProductDrawer({
  onRefreshSummary,
  onSuccess,
}: UseStockProductDrawerOptions) {
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [productDrawerOperation, setProductDrawerOperation] = useState<ProductInventoryOperation | null>(null);
  const [productDrawerTarget, setProductDrawerTarget] = useState<ProductInventoryTarget | null>(null);

  const openProductDrawer = useCallback((operation: ProductInventoryOperation, params: ProductActionParams) => {
    setProductDrawerOperation(operation);
    setProductDrawerTarget({
      productId: params.productId,
      productName: params.productName,
      variants: params.variants,
    });
    setProductDrawerOpen(true);
  }, []);

  const closeProductDrawer = useCallback(() => {
    setProductDrawerOpen(false);
    setProductDrawerOperation(null);
    setProductDrawerTarget(null);
  }, []);

  const handleProductSuccess = useCallback(async (message: string) => {
    onSuccess(message);
    closeProductDrawer();
    await onRefreshSummary();
  }, [closeProductDrawer, onRefreshSummary, onSuccess]);

  return {
    productDrawerOpen,
    productDrawerOperation,
    productDrawerTarget,
    openProductDrawer,
    closeProductDrawer,
    handleProductSuccess,
  };
}
