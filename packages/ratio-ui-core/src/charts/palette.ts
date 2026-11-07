// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { ColorKey } from '../theme';

/**
 * The series palette, as the theme's own colours: the brand, green, the
 * accent, the ink (a neutral, for a total or a reference line), red and
 * orange. Red comes late, so a fourth series is not read as a warning.
 * The web's `--chart-1` … `--chart-6` alias the same tokens in the same
 * order (tokens/chart.css); a native renderer reads them from the theme.
 */
export const CHART_PALETTE = [
  'primary',
  'successSolid',
  'accent',
  'text',
  'errorSolid',
  'warningSolid',
] as const satisfies readonly ColorKey[];

/** The palette's colour key for series number `index`, wrapping after six. */
export const chartColorKey = (index: number): ColorKey =>
  CHART_PALETTE[((index % CHART_PALETTE.length) + CHART_PALETTE.length) % CHART_PALETTE.length]!;
