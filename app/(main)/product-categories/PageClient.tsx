"use client";

import ProductCategoriesPageView from "@/components/product-categories/ProductCategoriesPageView";
import { useProductCategoriesPageState } from "@/components/product-categories/useProductCategoriesPageState";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLang } from "@/context/LangContext";

export default function ProductCategoriesPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("PRODUCT_CATEGORY_READ");
  const canCreate = can("PRODUCT_CATEGORY_CREATE");
  const canUpdate = can("PRODUCT_CATEGORY_UPDATE");
  const isMobile = !useMediaQuery();
  const state = useProductCategoriesPageState({
    canReadPage,
    loadErrorMessage: t("common.loadError"),
  });

  if (!canReadPage) return null;

  return (
    <ProductCategoriesPageView
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
        categories: state.categories,
        parentNameMap: state.parentNameMap,
        canUpdate,
        togglingCategoryIds: state.togglingCategoryIds,
        onEditCategory: (id) => void state.onEditCategory(id),
        onToggleCategoryActive: (category, next) => void state.onToggleCategoryActive(category, next),
      }}
      paginationProps={
        state.meta
          ? {
              page: state.pagination.page,
              totalPages: state.pagination.totalPages,
              total: state.meta.total,
              pageSize: state.pagination.pageSize,
              pageSizeId: "product-categories-page-size",
              loading: state.loading,
              onPageChange: state.pagination.onPageChange,
              onPageSizeChange: state.pagination.onPageSizeChange,
            }
          : null
      }
      drawerProps={{
        open: state.drawerOpen,
        editingCategoryId: state.editingCategoryId,
        submitting: state.submitting,
        loadingCategoryDetail: state.loadingCategoryDetail,
        isMobile,
        form: state.form,
        parentOptions: state.parentOptions,
        formError: state.formError,
        nameError: state.nameError,
        slugError: state.slugError,
        onClose: state.onCloseDrawer,
        onSubmit: state.onSubmitCategory,
        onFormChange: state.onFormChange,
      }}
    />
  );
}
