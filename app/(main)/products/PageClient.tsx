"use client";

import { useMemo } from "react";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionScope } from "@/hooks/useSessionScope";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStores } from "@/hooks/useStores";
import { useLang } from "@/context/LangContext";
import ProductsPageView from "@/components/products/ProductsPageView";
import { useProductMetadata } from "@/components/products/useProductMetadata";
import { useProductsListState } from "@/components/products/useProductsListState";
import { useProductDrawerForm } from "@/components/products/useProductDrawerForm";
import { useStatusFeedback } from "@/hooks/useStatusFeedback";

export default function ProductsPageClient() {
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("PRODUCT_READ");
  const { scopeReady, scopedStoreId } = useSessionScope();
  const { t } = useLang();
  const canTenantOnly = can("TENANT_ONLY");
  const allStores = useStores();
  const stores = canTenantOnly ? allStores : [];
  const isMobile = !useMediaQuery();
  const feedback = useStatusFeedback({ errorDurationMs: 4500 });

  const listState = useProductsListState({
    canReadPage,
    scopeReady,
    loadErrorMessage: t("products.loadError"),
    onActionError: feedback.showError,
  });

  const { attributeDefinitions, categoryOptions } = useProductMetadata({ canReadPage });

  const formState = useProductDrawerForm({
    canTenantOnly,
    variantStatusFilter: listState.variantStatusFilter,
    onRefreshProducts: listState.fetchProducts,
    onRefreshTableVariants: listState.fetchTableVariants,
    onSuccess: feedback.showSuccess,
    clearFeedback: feedback.clearAll,
  });

  const storeOptions = useMemo(
    () => stores.map((store) => ({ value: store.id, label: store.name })),
    [stores],
  );

  if (!canReadPage) return null;

  return (
    <ProductsPageView
      success={feedback.success}
      actionError={feedback.error}
      filtersProps={{
        searchTerm: listState.searchTerm,
        onSearchChange: (value) => listState.setSearchTerm(value),
        showAdvancedFilters: listState.showAdvancedFilters,
        onToggleAdvancedFilters: () => listState.setShowAdvancedFilters((prev) => !prev),
        onNewProduct: formState.onOpenDrawer,
        canCreate: can("PRODUCT_CREATE"),
        currencyFilter: listState.currencyFilter,
        onCurrencyFilterChange: (value) => listState.setCurrencyFilter(value),
        productStatusFilter: listState.productStatusFilter,
        onProductStatusFilterChange: (value) => listState.setProductStatusFilter(value),
        variantStatusFilter: listState.variantStatusFilter,
        onVariantStatusFilterChange: (value) => listState.setVariantStatusFilter(value),
        salePriceMin: listState.defaultSalePriceMinFilter,
        onSalePriceMinChange: (value) => listState.setDefaultSalePriceMinFilter(value),
        salePriceMax: listState.defaultSalePriceMaxFilter,
        onSalePriceMaxChange: (value) => listState.setDefaultSalePriceMaxFilter(value),
        purchasePriceMin: listState.defaultPurchasePriceMinFilter,
        onPurchasePriceMinChange: (value) => listState.setDefaultPurchasePriceMinFilter(value),
        purchasePriceMax: listState.defaultPurchasePriceMaxFilter,
        onPurchasePriceMaxChange: (value) => listState.setDefaultPurchasePriceMaxFilter(value),
        onClearAdvancedFilters: listState.clearAdvancedFilters,
      }}
      tableProps={{
        products: listState.products,
        loading: listState.loading,
        error: listState.error,
        expandedProductIds: listState.expandedProductIds,
        productVariantsById: listState.productVariantsById,
        productVariantsLoadingById: listState.productVariantsLoadingById,
        productVariantsErrorById: listState.productVariantsErrorById,
        togglingProductIds: listState.togglingProductIds,
        togglingVariantIds: listState.togglingVariantIds,
        onToggleExpand: listState.toggleExpandedProduct,
        onEdit: formState.onEditProduct,
        onToggleActive: listState.onToggleProductActive,
        onToggleVariantActive: listState.onToggleVariantActive,
        onProductPrice: listState.openProductPriceDrawer,
        canUpdate: can("PRODUCT_UPDATE"),
        canPriceUpdate: can("PRICE_MANAGE"),
      }}
      paginationProps={
        listState.meta && !listState.loading && !listState.error
          ? {
              page: listState.currentPage,
              totalPages: listState.totalPages,
              pageSize: listState.pageSize,
              pageSizeId: "products-page-size",
              total: listState.meta.total,
              loading: listState.loading,
              onPageChange: listState.onPageChange,
              onPageSizeChange: listState.onChangePageSize,
            }
          : null
      }
      drawerProps={{
        open: formState.drawerOpen,
        onClose: formState.onCloseDrawer,
        step: formState.step,
        editingProductId: formState.editingProductId,
        submitting: formState.submitting,
        loadingDetail: formState.loadingDetail,
        isMobile,
        onSubmit: formState.onSubmitProduct,
        onBack: formState.goToStep1,
        step1Props: {
          form: formState.form,
          errors: formState.errors,
          calculatedLineTotal: formState.calculatedLineTotal,
          storeOptions,
          categoryOptions,
          productInfoOpen: formState.step1ProductInfoOpen,
          onToggleProductInfo: () => formState.setStep1ProductInfoOpen((prev) => !prev),
          storeScopeOpen: formState.step1StoreScopeOpen,
          onToggleStoreScope: () => formState.setStep1StoreScopeOpen((prev) => !prev),
          formError: formState.formError,
          onFormChange: formState.onFormChange,
          onFormPatch: formState.onFormPatch,
          onClearError: formState.onClearError,
          canTenantOnly,
        },
        step2Props: {
          variants: formState.variants,
          expandedVariantKeys: formState.expandedVariantKeys,
          variantErrors: formState.variantErrors,
          attributeDefinitions,
          formError: formState.formError,
          onToggleVariantPanel: formState.toggleVariantPanel,
          onRemoveVariant: formState.removeVariant,
          onAddAttribute: formState.addAttribute,
          onRemoveAttribute: formState.removeAttribute,
          onUpdateAttribute: formState.updateVariantAttribute,
        },
      }}
      priceDrawerProps={{
        open: listState.priceOpen,
        target: listState.priceTarget,
        allStoreOptions: storeOptions,
        isMobile,
        showStoreScopeControls: !canTenantOnly,
        fixedStoreId: canTenantOnly ? scopedStoreId : undefined,
        onClose: listState.closePriceDrawer,
        onSuccess: (message) => {
          feedback.showSuccess(message);
          if (listState.priceTarget?.mode === "product") {
            void listState.fetchProducts();
            if (
              listState.priceProductId &&
              listState.expandedProductIds.includes(listState.priceProductId)
            ) {
              void listState.fetchTableVariants(listState.priceProductId, listState.variantStatusFilter);
            }
          } else if (listState.priceProductId) {
            void listState.fetchTableVariants(listState.priceProductId, listState.variantStatusFilter);
          }
        },
      }}
    />
  );
}
