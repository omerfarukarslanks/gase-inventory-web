"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FormFieldProps = {
  label?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

export default function FormField({
  label,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <label className={cn("text-xs font-semibold text-muted", labelClassName)}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}
