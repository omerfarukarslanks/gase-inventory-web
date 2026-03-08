"use client";

import SuppliersPageView from "@/components/suppliers/SuppliersPageView";
import { useSuppliersPageState } from "@/components/suppliers/useSuppliersPageState";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLang } from "@/context/LangContext";

export default function SuppliersPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("SUPPLIER_READ");
  const isMobile = !useMediaQuery();
  const canCreate = can("SUPPLIER_CREATE");
  const canUpdate = can("SUPPLIER_UPDATE");
  const state = useSuppliersPageState({
    canReadPage,
    loadErrorMessage: t("common.loadError"),
    detailLoadErrorMessage: t("suppliers.loadingDetail"),
  });

  if (!canReadPage) return null;

  return (
    <SuppliersPageView
      filtersProps={{
        searchTerm: state.searchTerm,
        onSearchTermChange: state.setSearchTerm,
        showAdvancedFilters: state.showAdvancedFilters,
        onToggleAdvancedFilters: () => state.setShowAdvancedFilters((prev) => !prev),
        canCreate,
        onCreate: state.onOpenDrawer,
        statusFilter: state.statusFilter,
        onStatusFilterChange: state.setStatusFilter,
        onClearFilters: state.clearAdvancedFilters,
      }}
      tableProps={{
        loading: state.loading,
        error: state.error,
        suppliers: state.suppliers,
        canUpdate,
        togglingSupplierIds: state.togglingSupplierIds,
        onEditSupplier: (id) => void state.onEditSupplier(id),
        onToggleSupplierActive: (supplier, next) => void state.onToggleSupplierActive(supplier, next),
      }}
      paginationProps={
        state.meta
          ? {
              page: state.pagination.page,
              totalPages: state.pagination.totalPages,
              total: state.meta.total,
              pageSize: state.pagination.pageSize,
              pageSizeId: "suppliers-page-size",
              loading: state.loading,
              onPageChange: state.pagination.onPageChange,
              onPageSizeChange: state.pagination.onPageSizeChange,
            }
          : null
      }
      drawerProps={{
        open: state.drawerOpen,
        editingSupplierId: state.editingSupplierId,
        submitting: state.submitting,
        loadingSupplierDetail: state.loadingSupplierDetail,
        isMobile,
        form: state.form,
        formError: state.formError,
        nameError: state.nameError,
        emailError: state.emailError,
        editingSupplierIsActive: state.editingSupplierIsActive,
        onClose: state.onCloseDrawer,
        onSubmit: state.onSubmitSupplier,
        onFormChange: state.onFormChange,
        onEditingSupplierIsActiveChange: state.setEditingSupplierIsActive,
      }}
    />
  );
}
