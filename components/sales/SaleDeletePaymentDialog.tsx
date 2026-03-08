"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLang } from "@/context/LangContext";

type SaleDeletePaymentDialogProps = {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function SaleDeletePaymentDialog({
  open,
  loading,
  onConfirm,
  onClose,
}: SaleDeletePaymentDialogProps) {
  const { t } = useLang();

  return (
    <ConfirmDialog
      open={open}
      title={t("sales.deletePaymentTitle")}
      description={t("sales.deletePaymentDescription")}
      confirmLabel={t("sales.deletePaymentConfirm")}
      cancelLabel={t("common.cancel")}
      loading={loading}
      loadingLabel={t("sales.deleting")}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
