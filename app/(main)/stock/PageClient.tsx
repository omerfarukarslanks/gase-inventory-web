"use client";

import { useMemo } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useSessionScope } from "@/hooks/useSessionScope";
import { useStores } from "@/hooks/useStores";
import { usePermissions } from "@/hooks/usePermissions";
import { useLang } from "@/context/LangContext";
import StockPageView from "@/components/stock/StockPageView";
import { useStockListState } from "@/components/stock/useStockListState";
import { useStockReceiveFlow } from "@/components/stock/useStockReceiveFlow";
import { useStockAdjustFlow } from "@/components/stock/useStockAdjustFlow";
import { useStockTransferFlow } from "@/components/stock/useStockTransferFlow";
import { useStockProductDrawer } from "@/components/stock/useStockProductDrawer";

export default function StockPage() {
  const { t } = useLang();
  const canReadPage = usePermissionGuard("STOCK_LIST_READ");
  const { scopeReady, scopedStoreId } = useSessionScope();
  const { can } = usePermissions();
  const canTenantOnly = can("TENANT_ONLY");
  const stores = useStores();
  const isMobile = !useMediaQuery();

  const listState = useStockListState({
    canReadPage,
    scopeReady,
    scopedStoreId,
    loadErrorMessage: t("stock.loadError"),
  });

  const receiveFlow = useStockReceiveFlow({
    onRefreshSummary: listState.fetchTenantSummary,
    onRefreshVariantStores: listState.fetchVariantStores,
    resolveVariantStores: listState.resolveVariantStores,
    onSuccess: listState.setSuccess,
    atLeastOneStoreRowMessage: t("stock.atLeastOneStoreRow"),
    receiveSuccessMessage: t("stock.receiveSuccess"),
    receiveErrorMessage: t("stock.receiveError"),
  });

  const adjustFlow = useStockAdjustFlow({
    canTenantOnly,
    isStoreScopedUser: listState.isStoreScopedUser,
    scopedStoreId,
    onRefreshSummary: listState.fetchTenantSummary,
    onRefreshVariantStores: listState.fetchVariantStores,
    resolveVariantStores: listState.resolveVariantStores,
    onSuccess: listState.setSuccess,
    atLeastOneStoreRowMessage: t("stock.atLeastOneStoreRow"),
    sameStoreTwiceMessage: t("stock.sameStoreTwice"),
    adjustSuccessMessage: t("stock.adjustSuccess"),
    adjustErrorMessage: t("stock.adjustError"),
  });

  const transferFlow = useStockTransferFlow({
    onRefreshSummary: listState.fetchTenantSummary,
    onRefreshVariantStores: listState.fetchVariantStores,
    resolveVariantStores: listState.resolveVariantStores,
    onSuccess: listState.setSuccess,
    sourceStoreRequiredMessage: t("stock.sourceStoreRequired"),
    targetStoreRequiredMessage: t("stock.targetStoreRequired"),
    sameStoreErrorMessage: t("stock.sameStoreError"),
    quantityPositiveMessage: t("stock.quantityPositive"),
    transferExceedsStockMessage: t("stock.transferExceedsStock"),
    transferSuccessMessage: t("stock.transferSuccess"),
    transferErrorMessage: t("stock.transferError"),
  });

  const productDrawer = useStockProductDrawer({
    onRefreshSummary: listState.fetchTenantSummary,
    onSuccess: listState.setSuccess,
  });

  const storeOptions = useMemo(
    () => stores.map((store) => ({ value: store.id, label: store.name })),
    [stores],
  );

  if (!canReadPage) return null;

  return (
    <StockPageView
      success={listState.success}
      filtersProps={{
        searchTerm: listState.searchTerm,
        onSearchChange: (value) => listState.setSearchTerm(value),
        storeFilterIds: listState.storeFilterIds,
        onStoreFilterChange: (ids) => listState.setStoreFilterIds(ids),
        storeOptions,
        canTenantOnly,
      }}
      tableProps={{
        products: listState.filteredProducts,
        loading: listState.loading,
        error: listState.error,
        getVariantStores: listState.getVariantStores,
        onReceive: receiveFlow.openReceiveDrawer,
        onAdjust: adjustFlow.openAdjustDrawer,
        onTransfer: transferFlow.openTransferDrawer,
        onProductReceive: (params) => productDrawer.openProductDrawer("receive", params),
        onProductAdjust: (params) => productDrawer.openProductDrawer("adjust", params),
        onProductTransfer: (params) => productDrawer.openProductDrawer("transfer", params),
        canReceive: can("STOCK_RECEIVE"),
        canAdjust: can("STOCK_ADJUST"),
        canTransfer: can("STOCK_TRANSFER"),
      }}
      paginationProps={
        !listState.loading && !listState.error
          ? {
              page: listState.page,
              totalPages: listState.totalPages,
              pageSize: listState.limit,
              pageSizeId: "stock-page-size",
              total: listState.total,
              loading: listState.loading,
              onPageChange: listState.onPageChange,
              onPageSizeChange: listState.onPageSizeChange,
            }
          : null
      }
      adjustDrawerProps={{
        open: adjustFlow.adjustOpen,
        loading: adjustFlow.adjustLoading,
        submitting: adjustFlow.adjustSubmitting,
        formError: adjustFlow.adjustFormError,
        target: adjustFlow.adjustTarget,
        variants: adjustFlow.adjustVariants,
        currency: adjustFlow.adjustCurrency,
        stores,
        initialEntriesByVariant: adjustFlow.adjustInitial,
        isMobile,
        showStoreSelector: adjustFlow.showStoreSelector,
        canTenantOnly,
        applyToAllStores: adjustFlow.adjustApplyToAllStores,
        onApplyToAllStoresChange: adjustFlow.setAdjustApplyToAllStores,
        fixedStoreId: adjustFlow.fixedStoreId,
        onClose: adjustFlow.closeAdjustDrawer,
        onSubmit: adjustFlow.submitAdjust,
      }}
      transferDrawerProps={{
        open: transferFlow.transferOpen,
        loading: transferFlow.transferLoading,
        submitting: transferFlow.transferSubmitting,
        formError: transferFlow.transferFormError,
        target: transferFlow.transferTarget,
        form: transferFlow.transferForm,
        allStoreOptions: storeOptions,
        isMobile,
        onClose: transferFlow.closeTransferDrawer,
        onFormChange: transferFlow.patchTransferForm,
        onSubmit: transferFlow.submitTransfer,
      }}
      receiveDrawerProps={{
        open: receiveFlow.receiveOpen,
        loading: receiveFlow.receiveLoading,
        submitting: receiveFlow.receiveSubmitting,
        formError: receiveFlow.receiveFormError,
        target: receiveFlow.receiveTarget,
        variants: receiveFlow.receiveVariants,
        currency: receiveFlow.receiveCurrency,
        stores,
        suppliers: listState.suppliers,
        supplierId: receiveFlow.receiveSupplierId,
        onSupplierChange: receiveFlow.setReceiveSupplierId,
        initialEntriesByVariant: receiveFlow.receiveInitial,
        isMobile,
        canTenantOnly,
        fixedStoreId: listState.isStoreScopedUser ? scopedStoreId : undefined,
        onClose: receiveFlow.closeReceiveDrawer,
        onSubmit: receiveFlow.submitReceive,
      }}
      productInventoryDrawerProps={{
        open: productDrawer.productDrawerOpen,
        operation: productDrawer.productDrawerOperation,
        target: productDrawer.productDrawerTarget,
        stores,
        suppliers: listState.suppliers,
        isMobile,
        canTenantOnly,
        onClose: productDrawer.closeProductDrawer,
        onSuccess: (message) => void productDrawer.handleProductSuccess(message),
      }}
    />
  );
}
