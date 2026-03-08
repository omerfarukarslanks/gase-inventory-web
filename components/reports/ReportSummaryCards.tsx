"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ReportSummaryCardItem = {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  className?: string;
};

type ReportSummaryCardsProps = {
  items: ReportSummaryCardItem[];
  gridClassName?: string;
  cardClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  descriptionClassName?: string;
};

export default function ReportSummaryCards({
  items,
  gridClassName,
  cardClassName,
  labelClassName,
  valueClassName,
  descriptionClassName,
}: ReportSummaryCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", gridClassName)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-2xl border border-border bg-surface p-5",
            cardClassName,
            item.className,
          )}
        >
          <p className={cn("text-xs font-semibold uppercase tracking-wide text-muted", labelClassName)}>
            {item.label}
          </p>
          <p className={cn("mt-2 text-2xl font-bold text-text", valueClassName)}>
            {item.value}
          </p>
          {item.description ? (
            <p className={cn("text-sm text-muted", descriptionClassName)}>
              {item.description}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
