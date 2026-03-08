"use client";

import type { ComponentProps } from "react";
import TablePagination from "@/components/ui/TablePagination";
import PermissionsFilters from "@/components/permissions/PermissionsFilters";
import PermissionsTable from "@/components/permissions/PermissionsTable";
import RolesTable from "@/components/permissions/RolesTable";
import PermissionDrawer from "@/components/permissions/PermissionDrawer";
import RolePermissionsDrawer from "@/components/permissions/RolePermissionsDrawer";
import type { PermissionsTab } from "@/components/permissions/types";
import { cn } from "@/lib/cn";

type PermissionsPageViewProps = {
  activeTab: PermissionsTab;
  onTabChange: (tab: PermissionsTab) => void;
  filtersProps: ComponentProps<typeof PermissionsFilters>;
  permissionsTableProps: Omit<ComponentProps<typeof PermissionsTable>, "footer">;
  paginationProps?: ComponentProps<typeof TablePagination> | null;
  rolesTableProps: ComponentProps<typeof RolesTable>;
  permissionDrawerProps: ComponentProps<typeof PermissionDrawer>;
  rolePermissionsDrawerProps: ComponentProps<typeof RolePermissionsDrawer>;
};

export default function PermissionsPageView({
  activeTab,
  onTabChange,
  filtersProps,
  permissionsTableProps,
  paginationProps,
  rolesTableProps,
  permissionDrawerProps,
  rolePermissionsDrawerProps,
}: PermissionsPageViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text">Yetki Yönetimi</h1>
        <p className="text-sm text-muted">Sistem yetkilerini ve rol atamalarını yönetin.</p>
      </div>

      <div className="w-fit rounded-xl border border-border bg-surface p-1">
        <div className="flex gap-1">
          <button
            onClick={() => onTabChange("permissions")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === "permissions" ? "bg-primary text-white" : "text-muted hover:text-text",
            )}
          >
            Yetkiler
          </button>
          <button
            onClick={() => onTabChange("roles")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === "roles" ? "bg-primary text-white" : "text-muted hover:text-text",
            )}
          >
            Roller
          </button>
        </div>
      </div>

      {activeTab === "permissions" ? (
        <>
          <PermissionsFilters {...filtersProps} />
          <PermissionsTable
            {...permissionsTableProps}
            footer={paginationProps ? <TablePagination {...paginationProps} /> : null}
          />
        </>
      ) : (
        <RolesTable {...rolesTableProps} />
      )}

      <PermissionDrawer {...permissionDrawerProps} />
      <RolePermissionsDrawer {...rolePermissionsDrawerProps} />
    </div>
  );
}
