"use client";

import { useMemo } from "react";
import UsersPageView from "@/components/users/UsersPageView";
import { USER_ROLE_OPTIONS } from "@/components/users/types";
import { useUsersPageState } from "@/components/users/useUsersPageState";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStores } from "@/hooks/useStores";

export default function UsersPage() {
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("USER_READ");
  const isMobile = !useMediaQuery();
  const stores = useStores();
  const state = useUsersPageState({ canReadPage });
  const canCreate = can("USER_CREATE");
  const canUpdate = can("USER_UPDATE");

  const storeFilterOptions = useMemo(
    () => stores.map((store) => ({ value: store.id, label: store.name })),
    [stores],
  );

  if (!canReadPage) return null;

  return (
    <UsersPageView
      filtersProps={{
        searchTerm: state.searchTerm,
        onSearchTermChange: state.setSearchTerm,
        showAdvancedFilters: state.showAdvancedFilters,
        onToggleAdvancedFilters: () => state.setShowAdvancedFilters((prev) => !prev),
        canCreate,
        onCreate: state.openCreate,
        storeFilter: state.storeFilter,
        onStoreFilterChange: state.setStoreFilter,
        storeFilterOptions,
        statusFilter: state.statusFilter,
        onStatusFilterChange: state.setStatusFilter,
        onClearFilters: state.clearAdvancedFilters,
      }}
      tableProps={{
        users: state.users,
        loading: state.loading,
        canUpdate,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        togglingUserIds: state.togglingUserIds,
        onSort: state.handleSort,
        onEdit: state.openEdit,
        onToggleUserActive: (user, next) => void state.onToggleUserActive(user, next),
      }}
      paginationProps={
        state.meta
          ? {
              page: state.pagination.page,
              totalPages: state.pagination.totalPages,
              total: state.meta.total,
              pageSize: state.pagination.pageSize,
              pageSizeId: "users-page-size",
              loading: state.loading,
              onPageChange: state.pagination.onPageChange,
              onPageSizeChange: state.pagination.onPageSizeChange,
            }
          : null
      }
      drawerProps={{
        open: state.isDrawerOpen,
        mode: state.mode,
        selectedUser: state.selectedUser,
        saving: state.saving,
        isMobile,
        form: state.form,
        errors: state.formErrors,
        roleOptions: [...USER_ROLE_OPTIONS],
        storeOptions: storeFilterOptions,
        onClose: state.closeDrawer,
        onSave: state.handleSave,
        onFormChange: state.onFormChange,
      }}
    />
  );
}
