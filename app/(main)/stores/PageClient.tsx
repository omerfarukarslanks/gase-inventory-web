"use client";

import StoresPageView from "@/components/stores/StoresPageView";
import { useStoresPageState } from "@/components/stores/useStoresPageState";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSession } from "@/hooks/useSession";
import { useLang } from "@/context/LangContext";

export default function StoresPage() {
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("STORE_READ");
  const { token, isHydrated } = useSession();
  const isMobile = !useMediaQuery();
  const { t } = useLang();
  const canCreate = can("STORE_CREATE");
  const canUpdate = can("STORE_UPDATE");
  const state = useStoresPageState({
    canReadPage,
    token,
    isHydrated,
    messages: {
      sessionNotFound: t("common.sessionNotFound"),
      loadError: t("stores.loadError"),
      detailLoadError: t("stores.detailLoadError"),
      nameRequired: t("stores.nameRequired"),
      nameMinLength: t("stores.nameMinLength"),
      updateError: t("stores.updateError"),
      createError: t("stores.createError"),
      toggleError: t("stores.toggleError"),
    },
  });
  const storeTypeOptions = [
    { value: "RETAIL", label: t("stores.storeTypeRetail") },
    { value: "WHOLESALE", label: t("stores.storeTypeWholesale") },
  ] as const;

  if (!canReadPage) return null;

  return (
    <StoresPageView
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
        stores: state.stores,
        canUpdate,
        togglingStoreIds: state.togglingStoreIds,
        onEditStore: (id) => void state.onEditStore(id),
        onToggleStoreActive: (store, next) => void state.onToggleStoreActive(store, next),
      }}
      paginationProps={
        state.meta
          ? {
              page: state.pagination.page,
              totalPages: state.pagination.totalPages,
              total: state.meta.total,
              pageSize: state.pagination.pageSize,
              pageSizeId: "stores-page-size",
              loading: state.loading,
              onPageChange: state.pagination.onPageChange,
              onPageSizeChange: state.pagination.onPageSizeChange,
            }
          : null
      }
      drawerProps={{
        open: state.drawerOpen,
        editingStoreId: state.editingStoreId,
        submitting: state.submitting,
        loadingStoreDetail: state.loadingStoreDetail,
        isMobile,
        form: state.form,
        formError: state.formError,
        nameError: state.nameError,
        storeTypeOptions,
        onClose: state.onCloseDrawer,
        onSubmit: state.onSubmitStore,
        onFormChange: state.onFormChange,
        normalizeCurrency: state.normalizeCurrency,
        normalizeStoreType: state.normalizeStoreType,
      }}
    />
  );
}
