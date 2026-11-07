// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui/charts` — beta. Server-first: no hooks and no
// context in the parts; the root hands its model to them as a prop, so a
// chart renders on the server as it does in the browser. The one client
// part is the legend's toggles (`Chart.Legend interactive`), a thin layer
// over the server-rendered figure.

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
  registerChartParts,
} from './Chart';

const parts = {
  Legend: ChartLegend,
  Plot: ChartPlot,
  Grid: ChartGrid,
  Bars: ChartBars,
  Line: ChartLine,
  Tooltip: ChartTooltip,
  YAxis: ChartYAxis,
  XAxis: ChartXAxis,
  Table: ChartTable,
};

// Every static is a part the root hands its model to; registered from this
// one list, so a new part cannot be left out.
registerChartParts(Object.values(parts));

/**
 * Chart — bars and lines over categories, composed from parts. The root
 * holds the data and the series and computes the scales once, from
 * `@eventuras/ratio-ui-core/charts`; the parts draw from them, so the bars,
 * the line, the grid and the axes agree on where every value sits. Marks
 * are placed in percent of the plot: the chart follows its container's
 * width with no measuring, and its text is text. It renders on the server;
 * `Chart.Tooltip` shows on hover with CSS alone, and only
 * `Chart.Legend interactive` ships a few lines of client script.
 *
 * The parts are found in the chart's own JSX, through fragments and any
 * element that holds them (a `Card`, a `<div>`); a part rendered inside a
 * component of your own is out of the root's reach.
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
export const Chart = Object.assign(ChartRoot, parts);

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
