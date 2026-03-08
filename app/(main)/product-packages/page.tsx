"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useStoreTypeGuard } from "@/hooks/useStoreTypeGuard";
import ProductPackagesPageView from "@/components/product-packages/ProductPackagesPageView";
import { useProductPackagesListState } from "@/components/product-packages/useProductPackagesListState";
import { useProductPackageForm } from "@/components/product-packages/useProductPackageForm";

export default function ProductPackagesPage() {
  const hasReadPermission = usePermissionGuard("PRODUCT_PACKAGE_READ");
  const accessChecked = useStoreTypeGuard("WHOLESALE");
  const canReadPage = hasReadPermission && accessChecked;
  const isMobile = !useMediaQuery();

  const listState = useProductPackagesListState(canReadPage);
  const formState = useProductPackageForm({
    canReadPage,
    onRefreshPackages: listState.fetchPackages,
  });

  if (!canReadPage) return null;

  return (
    <ProductPackagesPageView
      filtersProps={{
        searchTerm: listState.searchTerm,
        onSearchChange: (value) => listState.setSearchTerm(value),
        showAdvancedFilters: listState.showAdvancedFilters,
        onToggleAdvancedFilters: () => listState.setShowAdvancedFilters((prev) => !prev),
        statusFilter: listState.statusFilter,
        onStatusFilterChange: (value) => listState.setStatusFilter(value),
        onClearAdvancedFilters: listState.clearAdvancedFilters,
        onNewPackage: formState.onOpenDrawer,
      }}
      tableProps={{
        packages: listState.packages,
        expandedPackageIds: listState.expandedPackageIds,
        loading: listState.loading,
        error: listState.error,
        togglingIds: listState.togglingIds,
        onToggleExpand: listState.onToggleExpand,
        onEditPackage: formState.onEditPackage,
        onToggleActive: listState.onToggleActive,
      }}
      paginationProps={
        listState.meta
          ? {
              page: listState.currentPage,
              totalPages: listState.totalPages,
              total: listState.meta.total,
              pageSize: listState.pageSize,
              pageSizeId: "product-packages-page-size",
              loading: listState.loading,
              onPageChange: listState.goToPage,
              onPageSizeChange: listState.onChangePageSize,
            }
          : null
      }
      drawerProps={{
        open: formState.drawerOpen,
        editingId: formState.editingId,
        loadingDetail: formState.loadingDetail,
        submitting: formState.submitting,
        isMobile,
        formError: formState.formError,
        form: formState.form,
        errors: formState.errors,
        items: formState.items,
        variantSearchTerm: formState.variantSearchTerm,
        variantSearchLoading: formState.variantSearchLoading,
        variantSearchProducts: formState.variantSearchProducts,
        selectedProductForVariant: formState.selectedProductForVariant,
        variantOptions: formState.variantOptions,
        variantsLoading: formState.variantsLoading,
        selectedVariantIds: formState.selectedVariantIds,
        addItemQuantity: formState.addItemQuantity,
        addItemError: formState.addItemError,
        onClose: formState.onCloseDrawer,
        onSubmit: formState.onSubmit,
        onFormChange: formState.onFormChange,
        onVariantSearchTermChange: formState.onVariantSearchTermChange,
        onSelectProductForVariant: formState.onSelectProductForVariant,
        onSelectedVariantIdsChange: formState.onSelectedVariantIdsChange,
        onAddItemQuantityChange: formState.onAddItemQuantityChange,
        onAddItem: formState.onAddItem,
        onRemoveItem: formState.onRemoveItem,
        onItemQuantityChange: formState.onItemQuantityChange,
      }}
    />
  );
}
