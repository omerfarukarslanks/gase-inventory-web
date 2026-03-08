"use client";

import { useState } from "react";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import PermissionsPageView from "@/components/permissions/PermissionsPageView";
import { usePermissionsTabState } from "@/components/permissions/usePermissionsTabState";
import { useRolesTabState } from "@/components/permissions/useRolesTabState";
import type { PermissionsTab } from "@/components/permissions/types";

export default function PermissionsPage() {
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("PERMISSION_MANAGE");
  const isMobile = !useMediaQuery();
  const canManage = can("PERMISSION_MANAGE");
  const [activeTab, setActiveTab] = useState<PermissionsTab>("permissions");

  const permissionsTab = usePermissionsTabState({
    canReadPage,
    active: activeTab === "permissions",
  });

  const rolesTab = useRolesTabState({
    canReadPage,
    active: activeTab === "roles",
  });

  if (!canReadPage) return null;

  return (
    <PermissionsPageView
      activeTab={activeTab}
      onTabChange={setActiveTab}
      filtersProps={{
        permSearch: permissionsTab.permSearch,
        onPermSearchChange: (value) => permissionsTab.setPermSearch(value),
        showPermFilters: permissionsTab.showPermFilters,
        onTogglePermFilters: () => permissionsTab.setShowPermFilters((prev) => !prev),
        canManage,
        onCreatePermission: permissionsTab.openCreatePermDrawer,
        permStatusFilter: permissionsTab.permStatusFilter,
        onPermStatusFilterChange: (value) => permissionsTab.setPermStatusFilter(value),
        onClearFilters: () => permissionsTab.setPermStatusFilter("all"),
      }}
      permissionsTableProps={{
        permissions: permissionsTab.permissions,
        permLoading: permissionsTab.permLoading,
        permError: permissionsTab.permError,
        canManage,
        togglingPermIds: permissionsTab.togglingPermIds,
        onEditPermission: permissionsTab.openEditPermDrawer,
        onTogglePermActive: permissionsTab.onTogglePermActive,
      }}
      paginationProps={
        permissionsTab.permMeta
          ? {
              page: permissionsTab.permPage,
              totalPages: permissionsTab.permTotalPages,
              total: permissionsTab.permMeta.total,
              pageSize: permissionsTab.permPageSize,
              pageSizeId: "permissions-page-size",
              loading: permissionsTab.permLoading,
              onPageChange: (page) => permissionsTab.setPermPage(page),
              onPageSizeChange: permissionsTab.onPermPageSizeChange,
            }
          : null
      }
      rolesTableProps={{
        roles: rolesTab.roles,
        rolesLoading: rolesTab.rolesLoading,
        rolesError: rolesTab.rolesError,
        canManage,
        onEditRole: rolesTab.openRoleDrawer,
      }}
      permissionDrawerProps={{
        open: permissionsTab.permDrawerOpen,
        editingPermId: permissionsTab.editingPermId,
        permSubmitting: permissionsTab.permSubmitting,
        isMobile,
        permForm: permissionsTab.permForm,
        permFormError: permissionsTab.permFormError,
        permNameError: permissionsTab.permNameError,
        permDescError: permissionsTab.permDescError,
        permGroupError: permissionsTab.permGroupError,
        onClose: permissionsTab.onClosePermDrawer,
        onFormChange: permissionsTab.onPermFormChange,
        onSubmit: permissionsTab.onSubmitPermForm,
      }}
      rolePermissionsDrawerProps={{
        open: rolesTab.roleDrawerOpen,
        editingRole: rolesTab.editingRole,
        roleSubmitting: rolesTab.roleSubmitting,
        roleLoading: rolesTab.roleLoading,
        roleFormError: rolesTab.roleFormError,
        groupedPerms: rolesTab.groupedPerms,
        selectedPermNames: rolesTab.selectedPermNames,
        isMobile,
        onClose: rolesTab.onCloseRoleDrawer,
        onToggleRolePerm: rolesTab.onToggleRolePerm,
        onSaveRolePerms: rolesTab.onSaveRolePerms,
      }}
    />
  );
}
