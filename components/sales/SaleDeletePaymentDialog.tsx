"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  return (
    <ConfirmDialog
      open={open}
      title="Odeme Kaydini Sil"
      description="Bu odeme kaydini silmek istiyor musunuz?"
      confirmLabel="Evet"
      cancelLabel="Hayir"
      loading={loading}
      loadingLabel="Siliniyor..."
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
