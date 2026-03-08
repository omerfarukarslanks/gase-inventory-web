"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

type SaleCancelDialogProps = {
  open: boolean;
  loading: boolean;
  reason: string;
  note: string;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function SaleCancelDialog({
  open,
  loading,
  reason,
  note,
  onReasonChange,
  onNoteChange,
  onConfirm,
  onClose,
}: SaleCancelDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Satis Fisini Iptal Et"
      description="Bu satis fisini iptal etmek istiyor musunuz?"
      confirmLabel="Evet"
      cancelLabel="Hayir"
      loading={loading}
      loadingLabel="Iptal ediliyor..."
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Sebep</label>
          <input
            type="text"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Orn: Musteri vazgecti"
            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Not</label>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Orn: Telefon ile iptal"
            className="min-h-18 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
