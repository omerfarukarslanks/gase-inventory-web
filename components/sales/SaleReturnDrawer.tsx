"use client";

import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import FormField from "@/components/ui/FormField";
import TextareaField from "@/components/ui/TextareaField";
import { useLang } from "@/context/LangContext";
import type { SaleListItem } from "@/lib/sales";
import type { ReturnLineForm } from "@/components/sales/types";

type SaleReturnDrawerProps = {
  open: boolean;
  returnTargetSale: SaleListItem | null;
  returnSubmitting: boolean;
  returnDetailLoading: boolean;
  returnLines: ReturnLineForm[];
  returnNotes: string;
  returnFormError: string;
  onClose: () => void;
  onSubmit: () => void;
  onReturnModeChange: (lineIndex: number, value: "quantity" | "variants") => void;
  onReturnQuantityChange: (lineIndex: number, value: string) => void;
  onRefundAmountChange: (lineIndex: number, value: string) => void;
  onPackageVariantReturnQuantityChange: (lineIndex: number, variantIndex: number, value: string) => void;
  onReturnNotesChange: (value: string) => void;
};

function getReturnLimit(line: ReturnLineForm) {
  return line.isPackageLine
    ? (line.completePackagesRemaining ?? line.originalQuantity)
    : line.originalQuantity - line.returnedQuantity;
}

export default function SaleReturnDrawer({
  open,
  returnTargetSale,
  returnSubmitting,
  returnDetailLoading,
  returnLines,
  returnNotes,
  returnFormError,
  onClose,
  onSubmit,
  onReturnModeChange,
  onReturnQuantityChange,
  onRefundAmountChange,
  onPackageVariantReturnQuantityChange,
  onReturnNotesChange,
}: SaleReturnDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={t("sales.createReturn")}
      description={
        returnTargetSale
          ? `${t("sales.receiptLabel")}: ${returnTargetSale.receiptNo ?? returnTargetSale.id}`
          : t("sales.returnDescription")
      }
      closeDisabled={returnSubmitting}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            onClick={onClose}
            variant="secondary"
            disabled={returnSubmitting}
          />
          <Button
            label={returnSubmitting ? t("sales.returnSubmitting") : t("sales.confirmReturn")}
            onClick={onSubmit}
            variant="primarySolid"
            loading={returnSubmitting}
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        {returnDetailLoading ? (
          <p className="text-sm text-muted">{t("sales.linesLoading")}</p>
        ) : returnLines.length === 0 && !returnFormError ? (
          <p className="text-sm text-muted">{t("sales.noSaleLines")}</p>
        ) : (
          <>
            <div className="space-y-3">
              {returnLines.map((line, idx) => {
                const returnLimit = getReturnLimit(line);

                return (
                  <div
                    key={line.saleLineId}
                    className="space-y-2 rounded-xl border border-border bg-surface2/40 p-3"
                  >
                    <p className="text-sm font-medium text-text">
                      {line.lineName}
                      {!line.isPackageLine && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          ({t("sales.soldLabel")}: {line.originalQuantity}
                          {line.returnedQuantity > 0 && `, ${t("sales.returnedLabel")}: ${line.returnedQuantity}`})
                        </span>
                      )}
                      {line.isPackageLine && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          ({line.completePackagesRemaining ?? 0} {t("sales.fullPackage")}
                          {line.partialPackage?.exists &&
                            `, ${line.partialPackage.incompletePackageCount ?? 1} ${t("sales.partialPackage")}`}
                          )
                        </span>
                      )}
                    </p>

                    {line.isPackageLine && line.partialPackage?.exists && (
                      <div className="space-y-1 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                        <p className="text-xs font-semibold text-warning">{t("sales.partialPackage")}</p>
                        {line.partialPackage.presentVariants.length > 0 && (
                          <p className="text-xs text-muted">
                            <span className="font-medium text-text">{t("sales.presentLabel")}:</span>{" "}
                            {line.partialPackage.presentVariants.join(", ")}
                          </p>
                        )}
                        {line.partialPackage.missingVariants.length > 0 && (
                          <p className="text-xs text-muted">
                            <span className="font-medium text-text">{t("sales.missingLabel")}:</span>{" "}
                            {line.partialPackage.missingVariants.join(", ")}
                          </p>
                        )}
                      </div>
                    )}

                    {line.isPackageLine && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onReturnModeChange(idx, "quantity")}
                          className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                            line.returnMode === "quantity"
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-surface2 text-muted"
                          }`}
                        >
                          {t("sales.fullPackageQuantityMode")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReturnModeChange(idx, "variants")}
                          className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                            line.returnMode === "variants"
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-surface2 text-muted"
                          }`}
                        >
                          {t("sales.variantMode")}
                        </button>
                      </div>
                    )}

                    {(!line.isPackageLine || line.returnMode === "quantity") && (
                      <div className="grid grid-cols-2 gap-2">
                        <FormField label={`${t("sales.returnQuantity")} (${t("sales.maxLabel")} ${returnLimit})`}>
                          <input
                            type="number"
                            min={0}
                            max={returnLimit}
                            step={1}
                            value={line.returnQuantity}
                            onChange={(event) => onReturnQuantityChange(idx, event.target.value)}
                            placeholder="0"
                            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </FormField>
                        <FormField label={t("sales.refundAmountOptional")}>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={line.refundAmount}
                            onChange={(event) => onRefundAmountChange(idx, event.target.value)}
                            placeholder="0.00"
                            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </FormField>
                      </div>
                    )}

                    {line.isPackageLine && line.returnMode === "variants" && (
                      <div className="space-y-2">
                        {line.packageVariantReturns.length === 0 ? (
                          <p className="text-xs text-muted">{t("sales.noPackageVariantInfo")}</p>
                        ) : (
                          line.packageVariantReturns.map((variant, variantIndex) => (
                            <div key={variant.productVariantId} className="flex items-center gap-2">
                              <span className="flex-1 truncate text-xs text-text">
                                {variant.name}
                                {variant.qtyPerPackage != null && (
                                  <span className="ml-1 font-normal text-muted">(x{variant.qtyPerPackage})</span>
                                )}
                                {variant.remaining != null && (
                                  <span className="ml-1 text-xs font-normal text-muted">
                                    ({t("sales.remainingLabel")}: {variant.remaining})
                                  </span>
                                )}
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={variant.remaining ?? undefined}
                                step={1}
                                value={variant.returnQuantity}
                                onChange={(event) =>
                                  onPackageVariantReturnQuantityChange(idx, variantIndex, event.target.value)
                                }
                                placeholder="0"
                                className="h-9 w-24 rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          ))
                        )}

                        <FormField label={t("sales.refundAmountOptional")} className="pt-1">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={line.refundAmount}
                            onChange={(event) => onRefundAmountChange(idx, event.target.value)}
                            placeholder="0.00"
                            className="h-10 w-full rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </FormField>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <TextareaField
              label={t("sales.returnNotes")}
              value={returnNotes}
              onChange={onReturnNotesChange}
              placeholder={t("sales.returnNotesPlaceholder")}
              textareaClassName="min-h-20 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </>
        )}

        {returnFormError && <p className="text-sm text-error">{returnFormError}</p>}
      </div>
    </Drawer>
  );
}
