"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLang } from "@/context/LangContext";

type SaleDeleteLineDialogProps = {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function SaleDeleteLineDialog({
  open,
  loading,
  onConfirm,
  onClose,
}: SaleDeleteLineDialogProps) {
  const { t } = useLang();

  return (
    <ConfirmDialog
      open={open}
      title={t("sales.deleteLineTitle")}
      description={t("sales.deleteLineDescription")}
      confirmLabel={t("sales.deleteLineConfirm")}
      cancelLabel={t("common.cancel")}
      loading={loading}
      loadingLabel={t("sales.deleting")}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
