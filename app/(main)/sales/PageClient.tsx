"use client";

import { useMemo } from "react";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useSession } from "@/hooks/useSession";
import { useSessionScope } from "@/hooks/useSessionScope";
import { useStores } from "@/hooks/useStores";
import { usePermissions } from "@/hooks/usePermissions";
import { useSalesListState } from "@/components/sales/useSalesListState";
import { useSalePayments } from "@/components/sales/useSalePayments";
import { useSaleReturns } from "@/components/sales/useSaleReturns";
import { useSaleLines } from "@/components/sales/useSaleLines";
import { useSaleCancellation } from "@/components/sales/useSaleCancellation";
import { useSaleDetailDialog } from "@/components/sales/useSaleDetailDialog";
import { useSaleVariantOptions } from "@/components/sales/useSaleVariantOptions";
import { useSaleForm } from "@/components/sales/useSaleForm";
import { useSaleReceiptDownload } from "@/components/sales/useSaleReceiptDownload";
import SalesPageView from "@/components/sales/SalesPageView";
import { useLang } from "@/context/LangContext";

export default function SalesPage() {
  const { t } = useLang();
  const { can } = usePermissions();
  const canReadPage = usePermissionGuard("SALE_READ");
  const { token } = useSession();
  const { scopeReady, scopedStoreId, isWholesaleStoreType } = useSessionScope();
  const canTenantOnly = can("TENANT_ONLY");
  const allStores = useStores();
  const stores = canTenantOnly ? allStores : [];

  const {
    salesReceipts,
    salesMeta,
    salesLoading,
    salesError,
    setSalesError,
    salesPage,
    salesLimit,
    salesStoreIds,
    setSalesStoreIds,
    salesIncludeLines,
    setSalesIncludeLines,
    showSalesAdvancedFilters,
    setShowSalesAdvancedFilters,
    salesReceiptNoFilter,
    setSalesReceiptNoFilter,
    salesNameFilter,
    setSalesNameFilter,
    salesSurnameFilter,
    setSalesSurnameFilter,
    salesStatusFilters,
    setSalesStatusFilters,
    salesPaymentStatusFilter,
    setSalesPaymentStatusFilter,
    salesMinUnitPriceFilter,
    setSalesMinUnitPriceFilter,
    salesMaxUnitPriceFilter,
    setSalesMaxUnitPriceFilter,
    salesMinLineTotalFilter,
    setSalesMinLineTotalFilter,
    salesMaxLineTotalFilter,
    setSalesMaxLineTotalFilter,
    fetchSalesReceipts,
    salesTotalPages,
    salesTotal,
    resetSalesPage,
    onSalesPageChange,
    onSalesLimitChange,
  } = useSalesListState({
    canReadPage,
    scopeReady,
    canTenantOnly,
    loadErrorMessage: t("sales.loadError"),
  });

  const {
    variantOptions,
    variantPresetsById,
    loadingVariants,
    loadingMoreVariants,
    variantHasMore,
    loadMoreVariants,
  } = useSaleVariantOptions({
    canReadPage,
    scopeReady,
    isWholesaleStoreType,
    variantNoInfoLabel: t("sales.variantNoInfo"),
  });

  const {
    saleDrawerOpen,
    editingSaleId,
    storeId,
    customerId,
    customerDropdownRefreshKey,
    name,
    surname,
    phoneNumber,
    email,
    paymentMethod,
    initialPaymentAmount,
    note,
    lines,
    errors,
    submitting,
    formError,
    success,
    setSuccess,
    clearFieldError,
    handleCustomerIdChange,
    onSelectCustomer,
    onQuickCreateCustomer,
    onChangeLine,
    applyVariantPreset,
    addLine,
    removeLine,
    openSaleDrawer,
    closeSaleDrawer,
    openEditDrawer,
    onSubmit,
    setStoreId,
    setPaymentMethod,
    setInitialPaymentAmount,
    setNote,
  } = useSaleForm({
    canTenantOnly,
    scopedStoreId,
    isWholesaleStoreType,
    variantPresetsById,
    onRefreshSales: fetchSalesReceipts,
  });

  const {
    expandedPaymentSaleIds,
    paymentsBySaleId,
    paymentLoadingBySaleId,
    paymentErrorBySaleId,
    paymentDeleteDialogOpen,
    deletingPayment,
    paymentDrawerOpen,
    editingPaymentId,
    paymentAmount,
    paymentPaidAtInput,
    paymentMethodInput,
    paymentCurrency,
    paymentNoteInput,
    paymentSubmitting,
    paymentFormError,
    togglePaymentsCollapse,
    openAddPaymentDrawer,
    openEditPaymentDrawer,
    closePaymentDrawer,
    submitPayment,
    openDeletePaymentDialog,
    closeDeletePaymentDialog,
    confirmDeletePayment,
    handlePaymentAmountChange,
    handlePaymentPaidAtInputChange,
    handlePaymentMethodInputChange,
    handlePaymentCurrencyChange,
    handlePaymentNoteInputChange,
  } = useSalePayments({
    paymentsLoadErrorMessage: t("sales.paymentsLoadError"),
    onRefreshSales: fetchSalesReceipts,
    onSuccess: setSuccess,
    onError: setSalesError,
  });

  const {
    cancelDialogOpen,
    cancellingSale,
    cancelReason,
    cancelNote,
    openCancelDialog,
    closeCancelDialog,
    confirmCancelSale,
    setCancelReason,
    setCancelNote,
  } = useSaleCancellation({
    onRefreshSales: fetchSalesReceipts,
    onSuccess: setSuccess,
    onError: setSalesError,
  });

  const {
    saleDetailOpen,
    saleDetailLoading,
    saleDetailError,
    saleDetail,
    openSaleDetailDialog,
    closeSaleDetailDialog,
  } = useSaleDetailDialog();

  const {
    returnDrawerOpen,
    returnTargetSale,
    returnLines,
    returnNotes,
    returnSubmitting,
    returnFormError,
    returnDetailLoading,
    openReturnDrawer,
    closeReturnDrawer,
    submitReturn,
    handleReturnModeChange,
    handleReturnQuantityChange,
    handleRefundAmountChange,
    handlePackageVariantReturnQuantityChange,
    handleReturnNotesChange,
  } = useSaleReturns({
    onRefreshSales: fetchSalesReceipts,
    onSuccess: setSuccess,
  });

  const {
    linesDrawerOpen,
    linesDrawerSale,
    managedLines,
    linesDrawerLoading,
    linesDrawerError,
    editingLineId,
    editLineForm,
    lineOpSubmitting,
    lineOpError,
    deleteLineDialogOpen,
    deletingLine,
    addLineExpanded,
    addLineForm,
    openManageLinesDrawer,
    closeManageLinesDrawer,
    startEditLine,
    cancelEditLine,
    submitEditLine,
    requestDeleteLine,
    closeDeleteLineDialog,
    confirmDeleteLine,
    toggleAddLineExpanded,
    handleEditLineFormChange,
    handleAddLineFormChange,
    submitAddLine,
  } = useSaleLines({
    isWholesaleStoreType,
    onRefreshSales: fetchSalesReceipts,
  });

  /* ── Derived ── */
  const storeOptions = useMemo(
    () => stores.filter((s) => s.isActive).map((s) => ({ value: s.id, label: s.name })),
    [stores],
  );

  const { handleDownloadReceipt } = useSaleReceiptDownload({
    token,
    onError: setSalesError,
  });

  /* ── Render ── */
  if (!canReadPage) return null;

  return (
    <SalesPageView
      title="Satislar"
      description="Satis fisleri ve yeni satis olusturma"
      success={success}
      filtersProps={{
        showAdvancedFilters: showSalesAdvancedFilters,
        onToggleAdvancedFilters: () => setShowSalesAdvancedFilters((prev) => !prev),
        onNewSale: openSaleDrawer,
        canCreate: can("SALE_CREATE"),
        canTenantOnly,
        storeOptions,
        salesStoreIds,
        onSalesStoreIdsChange: setSalesStoreIds,
        receiptNoFilter: salesReceiptNoFilter,
        onReceiptNoFilterChange: setSalesReceiptNoFilter,
        nameFilter: salesNameFilter,
        onNameFilterChange: setSalesNameFilter,
        surnameFilter: salesSurnameFilter,
        onSurnameFilterChange: setSalesSurnameFilter,
        statusFilters: salesStatusFilters,
        onStatusFiltersChange: setSalesStatusFilters,
        paymentStatusFilter: salesPaymentStatusFilter,
        onPaymentStatusFilterChange: setSalesPaymentStatusFilter,
        minUnitPriceFilter: salesMinUnitPriceFilter,
        onMinUnitPriceFilterChange: setSalesMinUnitPriceFilter,
        maxUnitPriceFilter: salesMaxUnitPriceFilter,
        onMaxUnitPriceFilterChange: setSalesMaxUnitPriceFilter,
        minLineTotalFilter: salesMinLineTotalFilter,
        onMinLineTotalFilterChange: setSalesMinLineTotalFilter,
        maxLineTotalFilter: salesMaxLineTotalFilter,
        onMaxLineTotalFilterChange: setSalesMaxLineTotalFilter,
        includeLines: salesIncludeLines,
        onIncludeLinesChange: setSalesIncludeLines,
        onResetPage: resetSalesPage,
      }}
      tableProps={{
        salesReceipts,
        salesLoading,
        salesError,
        expandedPaymentSaleIds,
        paymentsBySaleId,
        paymentLoadingBySaleId,
        paymentErrorBySaleId,
        onTogglePayments: togglePaymentsCollapse,
        onAddPayment: openAddPaymentDrawer,
        onEditPayment: openEditPaymentDrawer,
        onDeletePayment: openDeletePaymentDialog,
        onOpenDetail: (id) => void openSaleDetailDialog(id),
        onEdit: (sale) => void openEditDrawer(sale),
        onOpenCancel: openCancelDialog,
        onReturn: (sale) => void openReturnDrawer(sale),
        onDownloadReceipt: (id) => void handleDownloadReceipt(id),
        onManageLines: (sale) => void openManageLinesDrawer(sale),
        canUpdate: can("SALE_UPDATE"),
        canCancel: can("SALE_CANCEL"),
        canCreateLines: can("SALE_LINE_CREATE"),
        canUpdateLines: can("SALE_LINE_UPDATE"),
        canReturn: can("SALE_RETURN_READ"),
        canDownloadReceipt: can("SALE_RECEIPT_READ"),
        canCreatePayments: can("SALE_PAYMENT_CREATE"),
        canUpdatePayments: can("SALE_PAYMENT_UPDATE"),
      }}
      paginationProps={
        salesMeta && !salesLoading && !salesError
          ? {
              page: salesPage,
              totalPages: salesTotalPages,
              pageSize: salesLimit,
              pageSizeId: "sales-page-size",
              total: salesTotal,
              loading: salesLoading,
              onPageChange: onSalesPageChange,
              onPageSizeChange: onSalesLimitChange,
            }
          : null
      }
      saleDrawerProps={{
        open: saleDrawerOpen,
        editMode: !!editingSaleId,
        submitting,
        scopeReady,
        loadingVariants,
        canTenantOnly,
        storeOptions,
        customerId,
        onCustomerIdChange: handleCustomerIdChange,
        onCustomerSelected: onSelectCustomer,
        customerDropdownRefreshKey,
        onQuickCreateCustomer,
        variantOptions,
        variantFieldLabel: isWholesaleStoreType ? "Paket *" : "Varyant *",
        variantPlaceholder: isWholesaleStoreType ? "Paket secin" : "Varyant secin",
        loadingMoreVariants,
        variantHasMore,
        onLoadMoreVariants: loadMoreVariants,
        storeId,
        onStoreIdChange: setStoreId,
        name,
        surname,
        phoneNumber,
        email,
        paymentMethod,
        onPaymentMethodChange: setPaymentMethod,
        initialPaymentAmount,
        onInitialPaymentAmountChange: setInitialPaymentAmount,
        note,
        onNoteChange: setNote,
        lines,
        onChangeLine,
        onApplyVariantPreset: applyVariantPreset,
        onAddLine: addLine,
        onRemoveLine: removeLine,
        errors,
        onClearError: clearFieldError,
        formError,
        success,
        onClose: closeSaleDrawer,
        onSubmit,
      }}
      salePaymentDrawerProps={{
        open: paymentDrawerOpen,
        editingPaymentId,
        paymentSubmitting,
        paymentAmount,
        paymentPaidAtInput,
        paymentMethodInput,
        paymentCurrency,
        paymentNoteInput,
        paymentFormError,
        onClose: closePaymentDrawer,
        onSubmit: submitPayment,
        onPaymentAmountChange: handlePaymentAmountChange,
        onPaymentPaidAtInputChange: handlePaymentPaidAtInputChange,
        onPaymentMethodInputChange: handlePaymentMethodInputChange,
        onPaymentCurrencyChange: handlePaymentCurrencyChange,
        onPaymentNoteInputChange: handlePaymentNoteInputChange,
      }}
      saleCancelDialogProps={{
        open: cancelDialogOpen,
        loading: cancellingSale,
        reason: cancelReason,
        note: cancelNote,
        onReasonChange: setCancelReason,
        onNoteChange: setCancelNote,
        onConfirm: confirmCancelSale,
        onClose: closeCancelDialog,
      }}
      saleDeletePaymentDialogProps={{
        open: paymentDeleteDialogOpen,
        loading: deletingPayment,
        onConfirm: confirmDeletePayment,
        onClose: closeDeletePaymentDialog,
      }}
      saleDetailModalProps={{
        open: saleDetailOpen,
        loading: saleDetailLoading,
        error: saleDetailError,
        detail: saleDetail,
        onClose: closeSaleDetailDialog,
      }}
      saleReturnDrawerProps={{
        open: returnDrawerOpen,
        returnTargetSale,
        returnSubmitting,
        returnDetailLoading,
        returnLines,
        returnNotes,
        returnFormError,
        onClose: closeReturnDrawer,
        onSubmit: submitReturn,
        onReturnModeChange: handleReturnModeChange,
        onReturnQuantityChange: handleReturnQuantityChange,
        onRefundAmountChange: handleRefundAmountChange,
        onPackageVariantReturnQuantityChange: handlePackageVariantReturnQuantityChange,
        onReturnNotesChange: handleReturnNotesChange,
      }}
      saleLinesDrawerProps={{
        open: linesDrawerOpen,
        sale: linesDrawerSale,
        managedLines,
        loading: linesDrawerLoading,
        error: linesDrawerError,
        editingLineId,
        editLineForm,
        lineOpSubmitting,
        lineOpError,
        deletingLine,
        addLineExpanded,
        addLineForm,
        isWholesaleStoreType,
        variantOptions,
        onClose: closeManageLinesDrawer,
        onStartEditLine: startEditLine,
        onRequestDeleteLine: requestDeleteLine,
        onCancelEditLine: cancelEditLine,
        onSubmitEditLine: (lineId) => void submitEditLine(lineId),
        onEditLineFormChange: handleEditLineFormChange,
        onToggleAddLineExpanded: toggleAddLineExpanded,
        onAddLineFormChange: handleAddLineFormChange,
        onSubmitAddLine: () => void submitAddLine(),
      }}
      saleDeleteLineDialogProps={{
        open: deleteLineDialogOpen,
        loading: deletingLine,
        onConfirm: () => void confirmDeleteLine(),
        onClose: closeDeleteLineDialog,
      }}
    />
  );
}
