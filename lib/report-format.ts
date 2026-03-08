type NumberFormatOptions = {
  locale?: string;
  fallback?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

const DEFAULT_LOCALE = "tr-TR";

export function formatReportNumber(
  value?: number | null,
  options: NumberFormatOptions = {},
) {
  if (value == null || Number.isNaN(value)) {
    return options.fallback ?? "-";
  }

  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  return value.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

type PercentFormatOptions = {
  multiplyBy100?: boolean;
  fractionDigits?: number;
  fallback?: string;
};

export function formatReportPercent(
  value?: number | null,
  options: PercentFormatOptions = {},
) {
  if (value == null || Number.isNaN(value)) {
    return options.fallback ?? "-";
  }

  const {
    multiplyBy100 = false,
    fractionDigits = 1,
  } = options;

  const normalizedValue = multiplyBy100 ? value * 100 : value;
  return `${normalizedValue.toFixed(fractionDigits)}%`;
}

export function formatReportDecimal(
  value?: number | null,
  fractionDigits = 2,
  fallback = "-",
) {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return value.toFixed(fractionDigits);
}

export function formatReportDays(
  value?: number | null,
  fallback = "-",
) {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return `${formatReportNumber(value, { fallback })} gun`;
}
