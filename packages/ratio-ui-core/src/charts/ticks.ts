// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Nice numbers for an axis: a step of 1, 2, 2.5 or 5 times a power of ten,
// and a domain widened to whole steps, so the axis reads 0, 0.5, 1.0 and
// not 0, 0.37, 0.74.

export interface NiceTicks {
  /** The domain, widened to whole steps. */
  min: number;
  max: number;
  step: number;
  /** Every tick from `min` to `max`, both included. */
  ticks: number[];
}

const MULTIPLES = [1, 2, 2.5, 5, 10];

/** The nice step for a span cut into about `count` parts. */
export function niceStep(span: number, count = 5): number {
  if (!(span > 0) || !Number.isFinite(span)) return 1;
  const raw = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const multiple = MULTIPLES.find((m) => m * power >= raw - 1e-12) ?? 10;
  return multiple * power;
}

/** Rounds away the floating-point dust a step leaves (0.30000000000000004). */
const clean = (value: number, step: number): number => {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 2);
  return Number(value.toFixed(decimals));
};

/**
 * Ticks for the domain `[min, max]`, about `count` of them, on nice
 * numbers. The domain is widened outward to the nearest whole step; an
 * empty domain (`min === max`) is widened to one step around the value.
 */
export function niceTicks(min: number, max: number, count = 5): NiceTicks {
  let lo = Math.min(min, max);
  let hi = Math.max(min, max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    lo = 0;
    hi = 1;
  }
  if (lo === hi) {
    if (lo === 0) hi = 1;
    else if (lo > 0) lo = 0;
    else hi = 0;
  }
  const step = niceStep(hi - lo, count);
  const start = clean(Math.floor(lo / step + 1e-9) * step, step);
  const end = clean(Math.ceil(hi / step - 1e-9) * step, step);
  const ticks: number[] = [];
  for (let i = 0, t = start; t <= end + step / 2; i++, t = clean(start + i * step, step)) {
    ticks.push(t);
  }
  return { min: start, max: end, step, ticks };
}
