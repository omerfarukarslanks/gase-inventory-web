"use client";

import AttributesPageView from "@/components/attributes/AttributesPageView";
import { useAttributesPageState } from "@/components/attributes/useAttributesPageState";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useLang } from "@/context/LangContext";

export default function AttributesPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("PRODUCT_ATTRIBUTE_READ");
  const canCreate = can("PRODUCT_ATTRIBUTE_CREATE");
  const canUpdate = can("PRODUCT_ATTRIBUTE_UPDATE");
  const state = useAttributesPageState({
    canReadPage,
    loadErrorMessage: t("attributes.loadError"),
  });

  if (!canReadPage) return null;

  return (
    <AttributesPageView
      success={state.success}
      error={state.error}
      filtersProps={{
        searchTerm: state.searchTerm,
        onSearchTermChange: state.setSearchTerm,
        showAdvancedFilters: state.showAdvancedFilters,
        onToggleAdvancedFilters: () => state.setShowAdvancedFilters((prev) => !prev),
        canCreate,
        onCreate: state.openCreateDrawer,
        statusFilter: state.statusFilter,
        onStatusFilterChange: state.setStatusFilter,
        onClearFilters: () => state.setStatusFilter("all"),
      }}
      tableProps={{
        loading: state.loading,
        attributes: state.attributes,
        expandedAttributeIds: state.expandedAttributeIds,
        togglingAttributeIds: state.togglingAttributeIds,
        togglingValueIds: state.togglingValueIds,
        canUpdate,
        onToggleExpand: state.toggleExpand,
        onEditAttribute: state.openEditDrawer,
        onToggleAttributeStatus: state.toggleAttributeStatus,
        onToggleValueStatus: state.toggleAttributeValueStatus,
      }}
      paginationProps={
        state.meta
          ? {
              page: state.pagination.page,
              totalPages: state.pagination.totalPages,
              total: state.meta.total,
              pageSize: state.pagination.pageSize,
              pageSizeId: "attributes-page-size",
              loading: state.loading,
              onPageChange: state.pagination.onPageChange,
              onPageSizeChange: state.pagination.onPageSizeChange,
            }
          : null
      }
      drawerProps={{
        open: state.drawerOpen,
        editingId: state.editingId,
        drawerStep: state.drawerStep,
        submitting: state.submitting,
        detailLoading: state.detailLoading,
        formName: state.formName,
        originalName: state.originalName,
        existingValues: state.existingValues,
        newValuesInput: state.newValuesInput,
        formError: state.formError,
        onClose: state.closeDrawer,
        onPrevStep: state.goPrevStep,
        onNextStep: state.goNextStep,
        onSave: state.handleSave,
        onFormNameChange: state.setFormName,
        onNewValuesInputChange: state.setNewValuesInput,
        onUpdateEditableValue: state.updateEditableValue,
      }}
    />
  );
}
