"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  return (
    <ConfirmDialog
      open={open}
      title="Satiri Sil"
      description="Bu satir silinecek. Bu islem geri alinamaz."
      confirmLabel="Evet, Sil"
      cancelLabel="Vazgec"
      loading={loading}
      loadingLabel="Siliniyor..."
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
