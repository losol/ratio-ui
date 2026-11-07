// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-core/charts` — beta: the arithmetic of a chart,
// shared by every renderer. Scales map data to a fraction of the plot,
// ticks land on nice numbers, stacks build up from zero, numbers are
// written in the reader's locale. No drawing: the web's `Chart` and a
// native one draw from the same values, so they agree on where zero is.

export { niceStep, niceTicks, type NiceTicks } from './ticks';
export {
  bandScale,
  linearScale,
  type BandOptions,
  type BandScale,
  type LinearScale,
} from './scale';
export {
  stackSeries,
  valueExtent,
  valueOf,
  type ChartRow,
  type StackSegment,
} from './stack';
export { numberFormatter, type ChartNumberFormat } from './format';
export { CHART_PALETTE, chartColorKey } from './palette';
