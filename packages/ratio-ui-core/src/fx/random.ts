// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Seeded randomness, so a burst is the same burst for every renderer that
// starts it from the same seed — and a test can pin what it draws.

/** A source of numbers in [0, 1), and the two shapes the effects ask for. */
export interface FxRandom {
  /** The next number in [0, 1). */
  next(): number;
  /** A number in [min, max). */
  range(min: number, max: number): number;
  /** One of the items, each as likely as the next. */
  pick<T>(items: readonly T[]): T;
}

/**
 * Mulberry32: small, fast and well spread for a few thousand draws, which is
 * all an effect needs. Not for anything that must not be guessed.
 */
export function fxRandom(seed: number): FxRandom {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    pick: items => {
      if (items.length === 0) throw new Error('fxRandom.pick: no items to pick from');
      return items[Math.floor(next() * items.length)]!;
    },
  };
}
