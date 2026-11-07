// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Scales map data to a fraction of the plot, 0 to 1, and every renderer
// multiplies by its own size: percentages on the web, points in an app,
// units in a baked SVG. One scale for the bars, the line, the grid and the
// axis, so they cannot disagree on where zero is.

/** A value's place along an axis, as a fraction 0–1 of the plot. */
export interface LinearScale {
  (value: number): number;
  domain: readonly [number, number];
  /** The value at a fraction: the inverse. */
  invert(fraction: number): number;
}

/**
 * Maps `domain` to 0–1: `domain[0]` to 0, `domain[1]` to 1. A vertical
 * axis reads it from the bottom; a renderer whose y grows downward uses
 * `1 - scale(v)`. Values outside the domain map outside 0–1.
 */
export function linearScale(domain: readonly [number, number]): LinearScale {
  const [d0, d1] = domain;
  const span = d1 - d0 || 1;
  const scale = ((value: number) => (value - d0) / span) as LinearScale;
  scale.domain = [d0, d1];
  scale.invert = (fraction: number) => d0 + fraction * span;
  return scale;
}

/** Where the `count` categories along an axis sit, as fractions 0–1. */
export interface BandScale {
  count: number;
  /** The distance from one band's start to the next. */
  step: number;
  /** A band's width: the step less the inner padding. */
  bandwidth: number;
  /** Where band `index` starts. */
  start(index: number): number;
  /** Band `index`'s centre. */
  center(index: number): number;
}

export interface BandOptions {
  /** The gap between bands, as a share of a step, 0–1. @default 0.3 */
  paddingInner?: number;
  /** The space before the first band and after the last, as a share of a step. @default paddingInner / 2 */
  paddingOuter?: number;
}

/**
 * `count` equal bands across 0–1, for the categories of a bar chart: the
 * hours of a day, the months of a year.
 */
export function bandScale(count: number, options: BandOptions = {}): BandScale {
  const inner = Math.min(Math.max(options.paddingInner ?? 0.3, 0), 0.95);
  const outer = Math.max(options.paddingOuter ?? inner / 2, 0);
  const n = Math.max(count, 0);
  const step = n === 0 ? 0 : 1 / (n - inner + 2 * outer);
  const bandwidth = step * (1 - inner);
  const offset = step * outer;
  return {
    count: n,
    step,
    bandwidth,
    start: (index) => offset + index * step,
    center: (index) => offset + index * step + bandwidth / 2,
  };
}
