import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ReportTableSurfaceProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  shadow?: boolean;
};

export function ReportTableSurface({
  children,
  className,
  padded = false,
  shadow = true,
}: ReportTableSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface",
        padded && "p-6",
        shadow && "shadow-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ReportTableScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

export function ReportTable({
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return <table className={cn("w-full text-left text-sm", className)} {...props} />;
}

export function ReportTableHead({
  className,
  ...props
}: ComponentPropsWithoutRef<"thead">) {
  return <thead className={className} {...props} />;
}

export function ReportTableHeadRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-border text-xs font-semibold uppercase tracking-wide text-muted",
        className,
      )}
      {...props}
    />
  );
}

type ReportTableCellProps = ComponentPropsWithoutRef<"td"> & {
  align?: "left" | "right" | "center";
  compact?: boolean;
};

type ReportTableHeaderCellProps = ComponentPropsWithoutRef<"th"> & {
  align?: "left" | "right" | "center";
  compact?: boolean;
};

function getCellSpacingClassName(compact: boolean) {
  return compact ? "py-3 pr-4" : "px-4 py-3";
}

function getHeaderSpacingClassName(compact: boolean) {
  return compact ? "pb-3 pr-4" : "px-4 py-3";
}

function getAlignClassName(align: "left" | "right" | "center") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function ReportTableHeaderCell({
  align = "left",
  compact = false,
  className,
  ...props
}: ReportTableHeaderCellProps) {
  return (
    <th
      className={cn(
        getHeaderSpacingClassName(compact),
        getAlignClassName(align),
        className,
      )}
      {...props}
    />
  );
}

export function ReportTableBody({
  className,
  divided = false,
  ...props
}: ComponentPropsWithoutRef<"tbody"> & { divided?: boolean }) {
  return (
    <tbody
      className={cn(divided && "divide-y divide-border", className)}
      {...props}
    />
  );
}

export function ReportTableRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return <tr className={className} {...props} />;
}

export function ReportTableCell({
  align = "left",
  compact = false,
  className,
  ...props
}: ReportTableCellProps) {
  return (
    <td
      className={cn(
        getCellSpacingClassName(compact),
        getAlignClassName(align),
        className,
      )}
      {...props}
    />
  );
}
