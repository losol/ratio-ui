// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** A row of data: one category, its label under `x`, its values by series key. */
export type ChartRow = Record<string, unknown>;

/** A segment of a stacked bar: from `y0` to `y1`, in data units. */
export type StackSegment = readonly [y0: number, y1: number];

/** A value read from a row; `undefined` when it is missing or not a finite number. */
export function valueOf(row: ChartRow, key: string): number | undefined {
  const value = row[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Stacks the series `keys` row by row: positive values upward from zero,
 * negative values downward from zero, each in the order given. Returns one
 * array per key, one segment per row; a missing value is an empty segment
 * where the stack stands.
 */
export function stackSeries(rows: readonly ChartRow[], keys: readonly string[]): StackSegment[][] {
  const out: StackSegment[][] = keys.map(() => []);
  rows.forEach((row) => {
    let up = 0;
    let down = 0;
    keys.forEach((key, k) => {
      const value = valueOf(row, key) ?? 0;
      if (value >= 0) {
        out[k]!.push([up, up + value]);
        up += value;
      } else {
        out[k]!.push([down + value, down]);
        down += value;
      }
    });
  });
  return out;
}

/** The lowest and highest value a set of stacks and single series reach, zero included. */
export function valueExtent(
  rows: readonly ChartRow[],
  stacks: readonly (readonly string[])[],
  singles: readonly string[] = [],
): [number, number] {
  let lo = 0;
  let hi = 0;
  for (const keys of stacks) {
    const segments = stackSeries(rows, keys);
    for (const series of segments) {
      for (const [y0, y1] of series) {
        lo = Math.min(lo, y0);
        hi = Math.max(hi, y1);
      }
    }
  }
  for (const key of singles) {
    for (const row of rows) {
      const value = valueOf(row, key);
      if (value === undefined) continue;
      lo = Math.min(lo, value);
      hi = Math.max(hi, value);
    }
  }
  return [lo, hi];
}
