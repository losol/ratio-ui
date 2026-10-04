// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * A fluid size as the web writes it: the two ends of its `clamp()`, in rem.
 * The web grows from `min` on a phone to `max` on a wide screen.
 */
export type FluidSize = readonly [min: number, max: number];

/**
 * The type scale, shared by every theme — `--font-size-*` in
 * `ratio-ui/src/tokens/typography.css`.
 * @beta May change before release.
 */
export const fontSize = {
  xs: [0.75, 0.81],
  sm: [0.88, 0.96],
  base: [1, 1.13],
  lg: [1.13, 1.27],
  xl: [1.27, 1.42],
  '2xl': [1.42, 1.6],
  '3xl': [1.6, 1.8],
  '4xl': [1.8, 2.03],
  '5xl': [2.03, 2.28],
  '6xl': [2.28, 2.57],
} as const satisfies Record<string, FluidSize>;

/**
 * The space scale, shared by every theme — `--space-*` in
 * `ratio-ui/src/tokens/spacing.css`. Single steps only; the web's
 * `--space-s-m` pairs are fluid ranges a fixed layout has no use for.
 * @beta May change before release.
 */
export const space = {
  '3xs': [0.25, 0.25],
  '2xs': [0.4375, 0.5],
  xs: [0.6875, 0.75],
  s: [0.875, 1],
  m: [1.3125, 1.5],
  l: [1.75, 2],
  xl: [2.625, 3],
  '2xl': [3.5, 4],
  '3xl': [5.25, 6],
} as const satisfies Record<string, FluidSize>;

export type FontSizeStep = keyof typeof fontSize;
export type SpaceStep = keyof typeof space;
