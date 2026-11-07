// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-native/charts` — beta: the web's `Chart` for the
// app, from the same model in @eventuras/ratio-ui-core/charts. Needs
// `react-native-svg` for the line (`npx expo install react-native-svg`); it
// is its own subpath so an app without charts installs nothing for them.

import {
  ChartBars,
  ChartGrid,
  ChartLegend,
  ChartLine,
  ChartPlot,
  ChartRoot,
  ChartTable,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from './Chart';

/**
 * Chart — bars and lines over categories, composed from parts, as on the
 * web: `Chart.Legend` (`interactive` to fade series out and back),
 * `Chart.Plot` with `Chart.Grid`, `Chart.Bars`, `Chart.Line`,
 * `Chart.Tooltip` (tap a category), `Chart.YAxis` and `Chart.XAxis` as its
 * direct children, and `Chart.Table`.
 *
 * @beta Prop shape may change before release.
 */
export const Chart = Object.assign(ChartRoot, {
  Legend: ChartLegend,
  Plot: ChartPlot,
  Grid: ChartGrid,
  Bars: ChartBars,
  Line: ChartLine,
  Tooltip: ChartTooltip,
  YAxis: ChartYAxis,
  XAxis: ChartXAxis,
  Table: ChartTable,
});

export type {
  ChartBarsProps,
  ChartLegendProps,
  ChartLineProps,
  ChartPlotProps,
  ChartProps,
  ChartSeries,
  ChartSeriesKind,
  ChartTableProps,
  ChartXAxisProps,
} from './Chart';

export {
  CHART_PALETTE,
  chartColorKey,
  niceTicks,
  numberFormatter,
  type ChartNumberFormat,
  type ChartRow,
} from '@eventuras/ratio-ui-core/charts';
