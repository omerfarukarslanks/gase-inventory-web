"use client";

import type { InventoryVariantStockItem } from "@/lib/inventory";

export type ProductInventoryOperation = "receive" | "adjust" | "transfer";

export type ProductInventoryTarget = {
  productId: string;
  productName: string;
  variants: InventoryVariantStockItem[];
};
