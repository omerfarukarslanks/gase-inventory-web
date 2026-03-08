"use client";

import CustomersPageView from "@/components/customers/CustomersPageView";
import { useCustomersPageState } from "@/components/customers/useCustomersPageState";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLang } from "@/context/LangContext";

export default function CustomersPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("CUSTOMER_READ");
  const canCreate = can("CUSTOMER_CREATE");
  const canUpdate = can("CUSTOMER_UPDATE");
  const isMobile = !useMediaQuery();
  const state = useCustomersPageState({
    canReadPage,
    loadErrorMessage: t("common.loadError"),
  });

  if (!canReadPage) return null;

  return (
    <CustomersPageView
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
        customers: state.customers,
        togglingCustomerIds: state.togglingCustomerIds,
        canUpdate,
        onOpenBalanceDrawer: (customer) => void state.onOpenBalanceDrawer(customer),
        onEditCustomer: (id) => void state.onEditCustomer(id),
        onToggleCustomerActive: (customer, next) => void state.onToggleCustomerActive(customer, next),
      }}
      paginationProps={
        state.meta
          ? {
              page: state.pagination.page,
              totalPages: state.pagination.totalPages,
              total: state.meta.total,
              pageSize: state.pagination.pageSize,
              pageSizeId: "customers-page-size",
              loading: state.loading,
              onPageChange: state.pagination.onPageChange,
              onPageSizeChange: state.pagination.onPageSizeChange,
            }
          : null
      }
      drawerProps={{
        open: state.drawerOpen,
        editingCustomerId: state.editingCustomerId,
        submitting: state.submitting,
        loadingCustomerDetail: state.loadingCustomerDetail,
        isMobile,
        form: state.form,
        formError: state.formError,
        nameError: state.nameError,
        surnameError: state.surnameError,
        emailError: state.emailError,
        editingCustomerIsActive: state.editingCustomerIsActive,
        onClose: state.onCloseDrawer,
        onSubmit: state.onSubmitCustomer,
        onFormChange: state.onFormChange,
        onEditingCustomerIsActiveChange: state.setEditingCustomerIsActive,
      }}
      balanceDrawerProps={{
        open: state.balanceDrawerOpen,
        onClose: state.onCloseBalanceDrawer,
        isMobile,
        customerBalanceLoading: state.customerBalanceLoading,
        customerBalanceError: state.customerBalanceError,
        customerBalance: state.customerBalance,
        selectedBalanceCustomerId: state.selectedBalanceCustomerId,
        selectedBalanceCustomerName: state.selectedBalanceCustomerName,
        onRefresh: () => {
          if (!state.selectedBalanceCustomerId) return;
          void state.loadCustomerBalance(state.selectedBalanceCustomerId);
        },
      }}
    />
  );
}
