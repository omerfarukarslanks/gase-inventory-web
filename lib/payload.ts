export function trimText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function trimToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = trimText(value);
  return trimmed ? trimmed : undefined;
}

export function trimToNull(value: string | null | undefined): string | null {
  const trimmed = trimText(value);
  return trimmed ? trimmed : null;
}

export function nullishToUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}
