"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FormField from "@/components/ui/FormField";
import TextareaField from "@/components/ui/TextareaField";
import { useLang } from "@/context/LangContext";

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
  const { t } = useLang();

  return (
    <ConfirmDialog
      open={open}
      title={t("sales.cancelSaleTitle")}
      description={t("sales.cancelSaleDescription")}
      confirmLabel={t("sales.cancelSale")}
      cancelLabel={t("common.cancel")}
      loading={loading}
      loadingLabel={t("sales.cancelling")}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <div className="space-y-2">
        <FormField label={t("sales.cancelReason")}>
          <input
            type="text"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder={t("sales.cancelReasonPlaceholder")}
            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>
        <TextareaField
          label={t("stock.note")}
          value={note}
          onChange={onNoteChange}
          placeholder={t("sales.cancelNotePlaceholder")}
          textareaClassName="min-h-18 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </ConfirmDialog>
  );
}
