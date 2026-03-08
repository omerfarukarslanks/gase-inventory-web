export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export type PermissionName =
    // Stok
  | "STOCK_LIST_READ"
  | "STOCK_MOVEMENTS_READ"
  | "STOCK_LOW_ALERTS_READ"
  | "STOCK_SUMMARY_READ"
  | "STOCK_RECEIVE"
  | "STOCK_TRANSFER"
  | "STOCK_ADJUST"
  /// Satış
  | "SALE_CREATE"
  | "SALE_READ"
  | "SALE_UPDATE"
  | "SALE_CANCEL"
  | "SALE_PAYMENT_CREATE"
  | "SALE_PAYMENT_READ"
  | "SALE_PAYMENT_UPDATE"
  | "SALE_LINE_CREATE"
  | "SALE_LINE_UPDATE"
  | "SALE_RETURN_CREATE"
  | "SALE_RETURN_READ"
  | "SALE_RECEIPT_READ"
  // Ürün
  | "PRODUCT_DELETE"
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_READ"
  | "PRODUCT_VARIANT_CREATE"
  | "PRODUCT_VARIANT_UPDATE"
  | "PRODUCT_BARCODE_LOOKUP"
  | "PRODUCT_CATEGORY_READ"
  | "PRODUCT_CATEGORY_CREATE"
  | "PRODUCT_CATEGORY_UPDATE"
  | "PRODUCT_PACKAGE_READ"
  | "PRODUCT_PACKAGE_CREATE"
  | "PRODUCT_PACKAGE_UPDATE"
  | "PRODUCT_ATTRIBUTE_READ"
  | "PRODUCT_ATTRIBUTE_UPDATE"
  | "PRODUCT_ATTRIBUTE_CREATE"
  // Fiyat
  | "PRICE_READ"
  | "PRICE_MANAGE"
  // Mağaza
  | "STORE_READ"
  | "STORE_CREATE"
  | "STORE_UPDATE"
  | "STORE_DELETE"
  // legacy alias, normalize to STORE_READ at session boundary
  | "STORE_VIEW"
  // Tedarikçi
  | "SUPPLIER_READ"
  | "SUPPLIER_CREATE"
  | "SUPPLIER_UPDATE"
  // Müşteri
  | "CUSTOMER_READ"
  | "CUSTOMER_CREATE"
  | "CUSTOMER_UPDATE"
  // Kullanıcı
  | "USER_READ"
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "USER_STORE_ASSIGN"
  // Raporlar
  | "REPORT_STOCK_READ"
  | "REPORT_SALES_READ"
  | "REPORT_FINANCIAL_READ"
  | "REPORT_EMPLOYEE_READ"
  | "REPORT_CUSTOMER_READ"
  | "REPORT_INVENTORY_READ"
  // Sistem
  | "EXCHANGE_RATE_READ"
  | "AI_CHAT"
  | "PERMISSION_MANAGE"
  // Tenant
  | 'TENANT_ONLY';

export function normalizePermissionName(permission: string): string {
  if (permission === "STORE_VIEW") return "STORE_READ";
  return permission;
}

export function normalizePermissionNames(permissions: string[] | null | undefined): string[] {
  if (!Array.isArray(permissions)) return [];

  const normalized = new Set<string>();
  for (const permission of permissions) {
    if (typeof permission !== "string" || !permission.trim()) continue;
    normalized.add(normalizePermissionName(permission));
  }

  return [...normalized];
}
