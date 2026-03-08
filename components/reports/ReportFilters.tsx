"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ReportFiltersProps = {
  children: ReactNode;
  className?: string;
};

export function ReportFilters({ children, className }: ReportFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4", className)}>
      {children}
    </div>
  );
}

type ReportFilterFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function ReportFilterField({ label, children, className }: ReportFilterFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-semibold text-muted">{label}</label>
      {children}
    </div>
  );
}

type ReportInputProps = InputHTMLAttributes<HTMLInputElement>;

function baseInputClassName(className?: string) {
  return cn(
    "h-10 rounded-xl border border-border bg-surface2 px-3 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary",
    className,
  );
}

export function ReportDateInput({ className, ...props }: ReportInputProps) {
  return <input type="date" className={baseInputClassName(className)} {...props} />;
}

export function ReportMonthInput({ className, ...props }: ReportInputProps) {
  return <input type="month" className={baseInputClassName(className)} {...props} />;
}

export function ReportTextInput({ className, ...props }: ReportInputProps) {
  return <input type="text" className={baseInputClassName(className)} {...props} />;
}

export function ReportNumberInput({ className, ...props }: ReportInputProps) {
  return <input type="number" className={baseInputClassName(className)} {...props} />;
}

type ReportFilterButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
};

export function ReportFilterButton({
  onClick,
  disabled = false,
  loading = false,
  label = "Filtrele",
  loadingLabel = "Yukleniyor...",
  className,
}: ReportFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50",
        className,
      )}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
