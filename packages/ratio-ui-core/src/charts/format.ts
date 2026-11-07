// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** How the numbers on a chart are written: the locale and `Intl.NumberFormat`'s options. */
export interface ChartNumberFormat extends Intl.NumberFormatOptions {
  /** A BCP 47 tag; `'nb'` writes 0,5. @default the runtime's */
  locale?: string;
}

/**
 * A formatter for a chart's numbers. Given the axis `step`, it writes as
 * many decimals as the step has, on every tick alike: a step of 0.25 gives
 * 0.00, 0.25, 0.50; a step of 5 gives none. Without a step, at most two.
 * Explicit fraction digits in `format` win over both.
 */
export function numberFormatter(
  format: ChartNumberFormat = {},
  step?: number,
): (value: number) => string {
  const { locale, ...options } = format;
  const explicit =
    options.minimumFractionDigits !== undefined || options.maximumFractionDigits !== undefined;
  const decimals =
    step !== undefined && step > 0 ? Math.min(6, (String(step).split('.')[1] ?? '').length) : undefined;
  const digits: Intl.NumberFormatOptions = explicit
    ? {}
    : decimals === undefined
      ? { maximumFractionDigits: 2 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  const intl = new Intl.NumberFormat(locale, { ...digits, ...options });
  return (value) => intl.format(Object.is(value, -0) ? 0 : value);
}
