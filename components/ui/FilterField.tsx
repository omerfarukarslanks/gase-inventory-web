"use client";

import type { ReactNode } from "react";
import FormField from "@/components/ui/FormField";

type FilterFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

export default function FilterField({
  label,
  children,
  className,
  labelClassName,
}: FilterFieldProps) {
  return (
    <FormField
      label={label}
      className={className}
      labelClassName={labelClassName}
    >
      {children}
    </FormField>
  );
}
