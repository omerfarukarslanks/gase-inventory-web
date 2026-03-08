"use client";

import FormField from "@/components/ui/FormField";

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
};

export default function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
  className,
  textareaClassName,
}: TextareaFieldProps) {
  return (
    <FormField label={label} className={className}>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={
          textareaClassName ??
          "min-h-[92px] w-full rounded-xl2 border border-border bg-surface2 px-3 py-2.5 text-sm text-text outline-none focus:border-primary/60"
        }
      />
    </FormField>
  );
}
