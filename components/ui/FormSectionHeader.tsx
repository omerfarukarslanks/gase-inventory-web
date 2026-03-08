"use client";

import { cn } from "@/lib/cn";

type FormSectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function FormSectionHeader({
  title,
  description,
  className,
}: FormSectionHeaderProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {description ? <p className="text-xs text-muted">{description}</p> : null}
    </div>
  );
}
