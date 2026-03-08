"use client";

type ProductInventoryNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
};

export default function ProductInventoryNumberInput({
  value,
  onChange,
  placeholder,
  min,
}: ProductInventoryNumberInputProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      min={min}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (nextValue === "" || /^[0-9]*[.,]?[0-9]*$/.test(nextValue)) {
          onChange(nextValue.replace(",", "."));
        }
      }}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
    />
  );
}
