import type { SaleDetail } from "@/lib/sales";
import { createLineRow, type SaleLineForm } from "@/components/sales/types";
import {
  mapSaleDetailToCustomerPreview,
  type SaleCustomerPreview,
} from "@/components/sales/customer-preview";

export type SaleEditState = {
  customerPreview: SaleCustomerPreview;
  customerId: string;
  note: string;
  storeId: string;
  lines: SaleLineForm[];
};

export function mapSaleDetailLinesToForm(detail: SaleDetail): SaleLineForm[] {
  if (detail.lines.length === 0) {
    return [createLineRow()];
  }

  return detail.lines.map((line) => ({
    ...createLineRow(),
    productVariantId: line.productVariantId ?? line.productPackageId ?? "",
    quantity: line.quantity != null ? String(line.quantity) : "1",
    currency: line.currency ?? "TRY",
    unitPrice: line.unitPrice != null ? String(line.unitPrice) : "",
    discountMode: line.discountAmount != null ? "amount" : "percent",
    discountPercent: line.discountPercent != null ? String(line.discountPercent) : "",
    discountAmount: line.discountAmount != null ? String(line.discountAmount) : "",
    taxMode: line.taxAmount != null ? "amount" : "percent",
    taxPercent: line.taxPercent != null ? String(line.taxPercent) : "",
    taxAmount: line.taxAmount != null ? String(line.taxAmount) : "",
    campaignCode: line.campaignCode ?? "",
  }));
}

export function mapSaleDetailToEditState(detail: SaleDetail): SaleEditState {
  return {
    customerPreview: mapSaleDetailToCustomerPreview(detail),
    customerId: detail.customerId ?? "",
    note: detail.note ?? "",
    storeId: detail.storeId ?? "",
    lines: mapSaleDetailLinesToForm(detail),
  };
}
