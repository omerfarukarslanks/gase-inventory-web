import type { PermissionName } from "@/lib/authz";
import type { SessionStoreType } from "@/lib/session-user";

export type AppNavItem = {
  href: string;
  labelKey: string;
  icon: string;
  badge?: string;
  permission?: PermissionName;
  anyPermission?: PermissionName[];
  requiredStoreType?: SessionStoreType;
};

export const MAIN_NAV_ITEMS: AppNavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: "D" },
  { href: "/products", labelKey: "nav.products", icon: "U", permission: "PRODUCT_READ" },
  {
    href: "/product-packages",
    labelKey: "nav.packages",
    icon: "PK",
    permission: "PRODUCT_PACKAGE_READ",
    requiredStoreType: "WHOLESALE",
  },
  { href: "/stock", labelKey: "nav.stock", icon: "S", badge: "3", permission: "STOCK_LIST_READ" },
  { href: "/sales", labelKey: "nav.sales", icon: "TL", permission: "SALE_READ" },
  { href: "/chat", labelKey: "nav.chat", icon: "AI", permission: "AI_CHAT" },
];

export const MANAGEMENT_NAV_ITEMS: AppNavItem[] = [
  { href: "/attributes", labelKey: "nav.attributes", icon: "O", permission: "PRODUCT_ATTRIBUTE_READ" },
  { href: "/product-categories", labelKey: "nav.productCategories", icon: "UK", permission: "PRODUCT_CATEGORY_READ" },
  { href: "/stores", labelKey: "nav.stores", icon: "M", permission: "STORE_READ" },
  { href: "/suppliers", labelKey: "nav.suppliers", icon: "T", permission: "SUPPLIER_READ" },
  { href: "/customers", labelKey: "nav.customers", icon: "C", permission: "CUSTOMER_READ" },
  { href: "/users", labelKey: "nav.users", icon: "K", permission: "USER_READ" },
  { href: "/permissions", labelKey: "nav.permissions", icon: "YT", permission: "PERMISSION_MANAGE" },
  {
    href: "/reports",
    labelKey: "nav.reports",
    icon: "R",
    anyPermission: [
      "REPORT_SALES_READ",
      "REPORT_STOCK_READ",
      "REPORT_FINANCIAL_READ",
      "REPORT_EMPLOYEE_READ",
      "REPORT_CUSTOMER_READ",
      "REPORT_INVENTORY_READ",
    ],
  },
];

export function canAccessNavItem(
  item: AppNavItem,
  params: { permissions: string[]; storeType: SessionStoreType | null },
): boolean {
  if (item.permission && !params.permissions.includes(item.permission)) return false;
  if (item.anyPermission && !item.anyPermission.some((permission) => params.permissions.includes(permission))) {
    return false;
  }
  if (item.requiredStoreType && params.storeType !== item.requiredStoreType) return false;
  return true;
}
