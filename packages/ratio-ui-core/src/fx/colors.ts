// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The colours an effect throws. A renderer passes the theme's own (it can
// read `--primary`; this package cannot), or a badge tier's metal.

import { formatColor, parseColor, type Rgba } from '../color';
import { BADGE_TIER_COLORS, type BadgeTier } from '../badges/types';

/** A list of colours, or a badge tier's metal in three shades. */
export type FxColors = readonly string[] | `tier:${BadgeTier}`;

/**
 * Used when neither the app nor the renderer gives colours: the status
 * hues and gold, bright on light and dark alike.
 */
export const FX_DEFAULT_COLORS: readonly string[] = Object.freeze([
  '#2f7fa0',
  '#d4a017',
  '#d64545',
  '#2e9a62',
  '#8e6bbf',
]);

const mixRgba = (a: Rgba, b: Rgba, t: number): Rgba => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
  a: 1,
});

/** A tier's metal, its highlight and its shadow, so a medal shower glints. */
export function tierPalette(tier: BadgeTier): string[] {
  const base = parseColor(BADGE_TIER_COLORS[tier]);
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const black = { r: 0, g: 0, b: 0, a: 1 };
  return [formatColor(base), formatColor(mixRgba(base, white, 0.45)), formatColor(mixRgba(base, black, 0.25))];
}

/** The colours to draw with: the tier's shades, the list given, or the default. */
export function resolveFxColors(colors?: FxColors): readonly string[] {
  if (colors === undefined) return FX_DEFAULT_COLORS;
  if (typeof colors === 'string') {
    const tier = colors.slice('tier:'.length) as BadgeTier;
    if (!(tier in BADGE_TIER_COLORS)) throw new Error(`Unknown tier "${colors}"`);
    return tierPalette(tier);
  }
  return colors.length > 0 ? colors : FX_DEFAULT_COLORS;
}
