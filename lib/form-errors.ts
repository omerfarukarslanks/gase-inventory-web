import type { Dispatch, SetStateAction } from "react";

export function clearFieldError<T extends Record<string, TValue>, TValue>(
  prev: T,
  field: keyof T,
  emptyValue: TValue,
): T {
  if (!prev[field]) {
    return prev;
  }

  return {
    ...prev,
    [field]: emptyValue,
  };
}

export function clearStringError(
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
) {
  if (!value) {
    return;
  }

  setValue("");
}

export function clearStringRecordError<
  TKey extends string,
  TValue extends string | undefined,
>(
  prev: Record<TKey, TValue>,
  key: TKey,
): Record<TKey, TValue> {
  if (!prev[key]) {
    return prev;
  }

  return {
    ...prev,
    [key]: "" as TValue,
  };
}

export function resetStringErrors(
  ...setters: Array<Dispatch<SetStateAction<string>>>
) {
  setters.forEach((setValue) => setValue(""));
}
