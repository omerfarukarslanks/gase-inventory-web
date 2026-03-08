"use client";

import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { useLang } from "@/context/LangContext";
import type { ManagedLineEditForm, SaleLineForm } from "@/components/sales/types";
import type { SaleDetailLine, SaleListItem } from "@/lib/sales";
import SaleLineFormFields from "@/components/sales/SaleLineFormFields";

type SaleLinesDrawerProps = {
  open: boolean;
  sale: SaleListItem | null;
  managedLines: SaleDetailLine[];
  loading: boolean;
  error: string;
  editingLineId: string | null;
  editLineForm: ManagedLineEditForm;
  lineOpSubmitting: boolean;
  lineOpError: string;
  deletingLine: boolean;
  addLineExpanded: boolean;
  addLineForm: SaleLineForm;
  isWholesaleStoreType: boolean;
  variantOptions: Array<{ value: string; label: string; secondaryLabel?: string }>;
  onClose: () => void;
  onStartEditLine: (line: SaleDetailLine) => void;
  onRequestDeleteLine: (lineId: string) => void;
  onCancelEditLine: () => void;
  onSubmitEditLine: (lineId: string) => void;
  onEditLineFormChange: (patch: Partial<ManagedLineEditForm>) => void;
  onToggleAddLineExpanded: () => void;
  onAddLineFormChange: (patch: Partial<SaleLineForm>) => void;
  onSubmitAddLine: () => void;
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function SaleLinesDrawer({
  open,
  sale,
  managedLines,
  loading,
  error,
  editingLineId,
  editLineForm,
  lineOpSubmitting,
  lineOpError,
  deletingLine,
  addLineExpanded,
  addLineForm,
  isWholesaleStoreType,
  variantOptions,
  onClose,
  onStartEditLine,
  onRequestDeleteLine,
  onCancelEditLine,
  onSubmitEditLine,
  onEditLineFormChange,
  onToggleAddLineExpanded,
  onAddLineFormChange,
  onSubmitAddLine,
}: SaleLinesDrawerProps) {
  const { t } = useLang();
  const addLineSelectLabel = isWholesaleStoreType
    ? `${t("sales.packageLabel")} *`
    : `${t("sales.variantLabel")} *`;
  const addLinePlaceholder = isWholesaleStoreType
    ? t("sales.packagePlaceholder")
    : t("sales.variantPlaceholder");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={t("sales.manageLines")}
      description={
        sale
          ? `${t("sales.receiptLabel")}: ${sale.receiptNo ?? sale.id}`
          : t("sales.manageLinesDescription")
      }
      closeDisabled={lineOpSubmitting || deletingLine}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.close")}
            onClick={onClose}
            variant="secondary"
            disabled={lineOpSubmitting || deletingLine}
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        {loading ? (
          <p className="text-sm text-muted">{t("sales.linesLoading")}</p>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : (
          <>
            <div className="space-y-2">
              {managedLines.length === 0 && (
                <p className="text-sm text-muted">{t("sales.noSaleLines")}</p>
              )}

              {managedLines.map((line) => {
                const isEditing = editingLineId === line.id;
                const lineName =
                  line.productVariantName ?? line.productPackageName ?? line.productName ?? line.id;

                return (
                  <div key={line.id} className="space-y-2 rounded-xl border border-border bg-surface2/30 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-text">{lineName}</p>
                        <p className="text-xs text-muted">
                          {t("sales.lineSummaryQuantity")}: {line.quantity ?? "-"} · {t("sales.lineSummaryUnitPrice")}: {line.unitPrice != null ? line.unitPrice : "-"} · {t("sales.lineSummaryTotal")}: {line.lineTotal != null ? line.lineTotal : "-"}
                        </p>
                      </div>

                      {!isEditing && (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onStartEditLine(line)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                            title={t("common.edit")}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDeleteLine(line.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-error/10 hover:text-error"
                            title={t("sales.deleteLine")}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="space-y-3 border-t border-border pt-2">
                        <SaleLineFormFields
                          form={editLineForm}
                          onChange={(patch) => onEditLineFormChange(patch as Partial<ManagedLineEditForm>)}
                        />

                        <div className="flex items-center gap-2">
                          <Button
                            label={lineOpSubmitting ? t("common.saving") : t("common.save")}
                            onClick={() => onSubmitEditLine(line.id)}
                            variant="primarySolid"
                            loading={lineOpSubmitting}
                          />
                          <Button
                            label={t("sales.cancelEdit")}
                            onClick={onCancelEditLine}
                            variant="secondary"
                            disabled={lineOpSubmitting}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border">
              <button
                type="button"
                onClick={onToggleAddLineExpanded}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface2/40"
              >
                <span>{t("sales.addLine")}</span>
                <ChevronIcon expanded={addLineExpanded} />
              </button>

              {addLineExpanded && (
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                  <SaleLineFormFields
                    form={addLineForm}
                    onChange={(patch) => onAddLineFormChange(patch as Partial<SaleLineForm>)}
                    selectField={{
                      label: addLineSelectLabel,
                      placeholder: addLinePlaceholder,
                      value: addLineForm.productVariantId,
                      options: variantOptions,
                      onChange: (value) => onAddLineFormChange({ productVariantId: value }),
                    }}
                  />

                  <Button
                    label={lineOpSubmitting ? t("sales.addingLine") : t("sales.addLine")}
                    onClick={onSubmitAddLine}
                    variant="primarySolid"
                    loading={lineOpSubmitting}
                  />
                </div>
              )}
            </div>

            {lineOpError && <p className="text-sm text-error">{lineOpError}</p>}
          </>
        )}
      </div>
    </Drawer>
  );
}
