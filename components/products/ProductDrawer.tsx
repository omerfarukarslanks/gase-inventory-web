"use client";

import type { ComponentProps, FormEventHandler } from "react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useLang } from "@/context/LangContext";
import ProductDrawerStep1 from "@/components/products/ProductDrawerStep1";
import ProductDrawerStep2 from "@/components/products/ProductDrawerStep2";

type ProductDrawerProps = {
  open: boolean;
  onClose: () => void;
  step: 1 | 2;
  editingProductId: string | null;
  submitting: boolean;
  loadingDetail: boolean;
  isMobile: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBack: () => void;
  step1Props: ComponentProps<typeof ProductDrawerStep1>;
  step2Props: ComponentProps<typeof ProductDrawerStep2>;
};

export default function ProductDrawer({
  open,
  onClose,
  step,
  editingProductId,
  submitting,
  loadingDetail,
  isMobile,
  onSubmit,
  onBack,
  step1Props,
  step2Props,
}: ProductDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingProductId ? t("products.update") : t("products.create")}
      description={step === 1 ? `1/2 - ${t("products.step1")}` : `2/2 - ${t("products.step2")}`}
      closeDisabled={submitting || loadingDetail}
      className={cn(isMobile ? "!max-w-none" : "!max-w-[540px]")}
      footer={
        <div className="flex items-center justify-between">
          <div>
            {step === 2 && (
              <Button
                label={t("common.back")}
                type="button"
                onClick={onBack}
                disabled={submitting}
                variant="secondary"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={t("common.cancel")}
              type="button"
              onClick={onClose}
              disabled={submitting || loadingDetail}
              variant="secondary"
            />
            {step === 1 ? (
              <Button
                label={t("common.continue")}
                type="submit"
                form="product-form"
                disabled={submitting || loadingDetail}
                variant="primarySolid"
              />
            ) : (
              <Button
                label={
                  submitting
                    ? editingProductId
                      ? t("common.updating")
                      : t("common.creating")
                    : t("common.save")
                }
                type="submit"
                form="product-form"
                disabled={submitting || loadingDetail}
                loading={submitting}
                variant="primarySolid"
              />
            )}
          </div>
        </div>
      }
    >
      <form id="product-form" onSubmit={onSubmit} className="space-y-4 p-5">
        {loadingDetail ? (
          <div className="text-sm text-muted">{t("common.loading")}</div>
        ) : step === 1 ? (
          <ProductDrawerStep1 {...step1Props} />
        ) : (
          <ProductDrawerStep2 {...step2Props} />
        )}
      </form>
    </Drawer>
  );
}
