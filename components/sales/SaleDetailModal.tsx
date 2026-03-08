"use client";

import { useLang } from "@/context/LangContext";
import type { SaleDetail } from "@/lib/sales";
import SaleDetailLinesTable from "@/components/sales/SaleDetailLinesTable";
import SaleDetailSummaryCards from "@/components/sales/SaleDetailSummaryCards";

type SaleDetailModalProps = {
  open: boolean;
  loading: boolean;
  error: string;
  detail: SaleDetail | null;
  onClose: () => void;
};

export default function SaleDetailModal({
  open,
  loading,
  error,
  detail,
  onClose,
}: SaleDetailModalProps) {
  const { t } = useLang();

  if (!open) return null;

  const content = loading ? (
    <p className="text-sm text-muted">{t("sales.detailLoading")}</p>
  ) : error ? (
    <p className="text-sm text-error">{error}</p>
  ) : !detail ? (
    <p className="text-sm text-muted">{t("sales.detailNotFound")}</p>
  ) : (
    <div className="space-y-4">
      <SaleDetailSummaryCards detail={detail} t={t} />

      {detail.note && (
        <div className="rounded-xl border border-border bg-surface2/30 p-3">
          <p className="text-xs font-semibold text-muted">{t("stock.note")}</p>
          <p className="mt-1 text-sm text-text2">{detail.note}</p>
        </div>
      )}

      <SaleDetailLinesTable lines={detail.lines} t={t} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-5xl rounded-xl2 border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text">{t("sales.detailTitle")}</h3>
            <p className="text-xs text-muted">{detail?.receiptNo ?? "-"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border px-2 py-1 text-xs text-muted transition-colors hover:bg-surface2 hover:text-text"
          >
            {t("common.close")}
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">{content}</div>
      </div>
    </div>
  );
}
