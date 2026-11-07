// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui/charts` — beta. No 'use client' here: the parts live
// in a client module (they share a model through context), and the compound
// statics are attached to a plain local function in this one, so they stay
// valid element types across the server boundary (see core/Navbar/index.tsx).

import type { ReactElement } from 'react';
import {
  ChartBars,
  ChartGrid,
  ChartLegend,
  ChartLine,
  ChartPlot,
  ChartRoot,
  ChartTable,
  ChartXAxis,
  ChartYAxis,
  type ChartProps,
} from './Chart';

function ChartShell(props: Readonly<ChartProps>): ReactElement {
  return <ChartRoot {...props} />;
}
ChartShell.displayName = 'Chart';

/**
 * Chart — bars and lines over categories, composed from parts. The root
 * holds the data and the series and computes the scales once, from
 * `@eventuras/ratio-ui-core/charts`; the parts draw from them, so the bars,
 * the line, the grid and the axes agree on where every value sits. Marks
 * are placed in percent of the plot: the chart follows its container's
 * width with no measuring, and its text is text.
 *
 * ```tsx
 * <Chart data={hours} x="hour" unit="kW" label="Production and consumption, hour by hour"
 *   series={[
 *     { key: 'wind', label: 'Wind', stack: 'production' },
 *     { key: 'water', label: 'Water', stack: 'production' },
 *     { key: 'use', label: 'Consumption', kind: 'line' },
 *   ]}>
 *   <Chart.Legend />
 *   <Chart.Plot>
 *     <Chart.Grid />
 *     <Chart.Bars />
 *     <Chart.Line />
 *     <Chart.YAxis />
 *     <Chart.XAxis every={6} />
 *   </Chart.Plot>
 *   <Chart.Table />
 * </Chart>
 * ```
 *
 * @beta Prop shape may change before release.
 */
export const Chart = Object.assign(ChartShell, {
  Legend: ChartLegend,
  Plot: ChartPlot,
  Grid: ChartGrid,
  Bars: ChartBars,
  Line: ChartLine,
  YAxis: ChartYAxis,
  XAxis: ChartXAxis,
  Table: ChartTable,
});

export type {
  ChartBarsProps,
  ChartLineProps,
  ChartPlotProps,
  ChartProps,
  ChartSeries,
  ChartSeriesKind,
  ChartTableProps,
  ChartXAxisProps,
} from './Chart';

// The model, for a chart of your own; re-exported so an app needs one import.
export {
  bandScale,
  linearScale,
  niceStep,
  niceTicks,
  numberFormatter,
  stackSeries,
  valueExtent,
  valueOf,
  type BandScale,
  type ChartNumberFormat,
  type ChartRow,
  type LinearScale,
  type NiceTicks,
  type StackSegment,
} from '@eventuras/ratio-ui-core/charts';
