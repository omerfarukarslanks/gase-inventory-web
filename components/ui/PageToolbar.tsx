import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import PageHeader from "@/components/ui/PageHeader";

type PageToolbarProps = {
  title: string;
  description?: string;
  actions: ReactNode;
  className?: string;
  actionsClassName?: string;
};

export function PageToolbar({
  title,
  description,
  actions,
  className,
  actionsClassName,
}: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <PageHeader title={title} description={description} />
      <div
        className={cn(
          "flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center",
          actionsClassName,
        )}
      >
        {actions}
      </div>
    </div>
  );
}

type FilterActionsRowProps = {
  children: ReactNode;
  className?: string;
};

export function FilterActionsRow({
  children,
  className,
}: FilterActionsRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
      {children}
    </div>
  );
}

type AdvancedFiltersPanelProps = {
  children: ReactNode;
  className?: string;
};

export function AdvancedFiltersPanel({
  children,
  className,
}: AdvancedFiltersPanelProps) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl2 border border-border bg-surface p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
