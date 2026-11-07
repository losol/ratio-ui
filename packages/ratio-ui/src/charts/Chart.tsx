// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The chart's parts draw from one model: the rows, the series, and the
// scales from @eventuras/ratio-ui-core/charts. The root computes it once and
// hands it to every part in its tree, so the grid, the bars, the line and
// the axes cannot disagree on where a value sits.
//
// No context, no hooks, no 'use client': the root walks its own children
// and gives each part the model as a prop. A chart renders on the server as
// it does in the browser, and its props never cross a client boundary.

import React, { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import {
  bandScale,
  linearScale,
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
import { cn } from '../utils/cn';
import { LegendToggles } from './LegendToggles';
import './Chart.css';

/** How a series is drawn. */
export type ChartSeriesKind = 'bar' | 'line';

/**
 * A series: the values under `key` in each row, drawn as bars or a line.
 * @beta Shape may change before release.
 */
export interface ChartSeries {
  /** The key of its value in each row. */
  key: string;
  /** Its name in the legend, the table's header and a bar's tooltip. */
  label: string;
  /** @default 'bar' */
  kind?: ChartSeriesKind;
  /**
   * Bars with the same `stack` stack on each other, in the order of the
   * series; bars without one stand side by side with the other stacks.
   */
  stack?: string;
  /** Any CSS colour. @default the palette's next, `var(--chart-1)` … `var(--chart-6)` */
  color?: string;
}

interface ResolvedSeries {
  key: string;
  label: string;
  kind: ChartSeriesKind;
  color: string;
}

interface ChartModel {
  rows: readonly ChartRow[];
  x: string;
  xLabel: string;
  label: string;
  unit?: string;
  series: ResolvedSeries[];
  y: LinearScale;
  ticks: NiceTicks;
  band: BandScale;
  /** The bar stacks, each a list of keys from the bottom up. */
  groups: string[][];
  segments: Map<string, StackSegment[]>;
  formatTick: (value: number) => string;
  formatValue: (value: number) => string;
}

/** The model a part is handed by its `Chart`. @internal */
interface Injected {
  /** @internal Set by the enclosing `Chart`; never pass it yourself. */
  model?: ChartModel;
}

function need(model: ChartModel | undefined, part: string): ChartModel {
  if (!model) throw new Error(`<${part}> must be inside <Chart>, in its own JSX.`);
  return model;
}

/** The parts the root hands its model to: `Chart`'s statics, registered in ./index.tsx. */
const PARTS = new Set<unknown>();

/** @internal Called once by ./index.tsx with every static of `Chart`. */
export function registerChartParts(parts: readonly unknown[]): void {
  parts.forEach((part) => PARTS.add(part));
}

/**
 * Gives every part in `node` the model, walking through any element that
 * holds children: a fragment, a `<div>`, a `Card`. A part rendered inside
 * a component of your own (not written in the chart's JSX) is out of reach.
 */
function hand(node: ReactNode, model: ChartModel): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const props = child.props as { children?: ReactNode };
    const children = props.children === undefined ? undefined : hand(props.children, model);
    const extra = PARTS.has(child.type) ? { model } : undefined;
    return children === undefined
      ? extra
        ? cloneElement(child as React.ReactElement<Injected>, extra)
        : child
      : cloneElement(
          child as React.ReactElement<Injected & { children?: ReactNode }>,
          extra,
          children,
        );
  });
}

const pct = (fraction: number): string => `${(fraction * 100).toFixed(4)}%`;

/** @beta Prop shape may change before release. */
export interface ChartProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** One row per category: its label under `x`, its values by series key. */
  data: readonly ChartRow[];
  /** The key of each row's category label: `'hour'`, `'month'`. */
  x: string;
  series: readonly ChartSeries[];
  /**
   * What the chart shows, in a sentence: the plot's accessible name and
   * the table's caption. "Production and consumption, hour by hour".
   */
  label: string;
  /** The categories' header in the table. @default `x` */
  xLabel?: string;
  /** The values' unit: after the top tick and in the table's headers. `'kW'`. */
  unit?: string;
  /** The locale and number options for ticks, tooltips and the table. */
  format?: ChartNumberFormat;
  /** The value axis's extent, widened to nice ticks. @default the data's, zero included */
  domain?: readonly [number, number];
  /** About how many steps the value axis has. @default 4 */
  tickCount?: number;
  /** The gap between categories, as a share of each one's width. @default 0.3 */
  gap?: number;
  className?: string;
  /** The parts: `Chart.Legend`, `Chart.Plot` with its layers and axes, `Chart.Table`. */
  children: ReactNode;
}

/** The root: computes the model and renders a `<figure>` round the parts. */
export function ChartRoot({
  data,
  x,
  series,
  label,
  xLabel = x,
  unit,
  format,
  domain,
  tickCount = 4,
  gap = 0.3,
  className,
  children,
  ...rest
}: ChartProps) {
  const resolved: ResolvedSeries[] = series.map((s, i) => ({
    key: s.key,
    label: s.label,
    kind: s.kind ?? 'bar',
    color: s.color ?? `var(--chart-${(i % 6) + 1})`,
  }));

  const groupIds: string[] = [];
  const groups: string[][] = [];
  series.forEach((s) => {
    if ((s.kind ?? 'bar') !== 'bar') return;
    const id = s.stack ?? `\u0000${s.key}`;
    let index = groupIds.indexOf(id);
    if (index < 0) {
      groupIds.push(id);
      groups.push([]);
      index = groups.length - 1;
    }
    groups[index]!.push(s.key);
  });
  const lineKeys = resolved.filter((s) => s.kind === 'line').map((s) => s.key);

  const [lo, hi] = domain ?? valueExtent(data, groups, lineKeys);
  const ticks = niceTicks(lo, hi, tickCount);
  const segments = new Map<string, StackSegment[]>();
  groups.forEach((keys) =>
    stackSeries(data, keys).forEach((segs, k) => segments.set(keys[k]!, segs)),
  );

  const model: ChartModel = {
    rows: data,
    x,
    xLabel,
    label,
    unit,
    series: resolved,
    y: linearScale([ticks.min, ticks.max]),
    ticks,
    band: bandScale(data.length, { paddingInner: gap }),
    groups,
    segments,
    formatTick: numberFormatter(format, ticks.step),
    formatValue: numberFormatter(format),
  };

  return (
    <figure className={cn('ratio-chart', className)} {...rest}>
      {hand(children, model)}
    </figure>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartLegendProps {
  /**
   * Each entry a toggle button that mutes its series: the chart's only
   * client part, a few hundred bytes over the server-rendered figure. A
   * muted series fades rather than vanishes, so the scale holds still.
   */
  interactive?: boolean;
  className?: string;
}

/** The series by name and colour: a square for bars, a dash for a line. */
export function ChartLegend({ interactive, className, model }: ChartLegendProps & Injected) {
  const { series } = need(model, 'Chart.Legend');
  if (interactive) {
    return (
      <LegendToggles
        className={className}
        items={series.map(({ key, label, kind, color }) => ({ key, label, kind, color }))}
      />
    );
  }
  return (
    <ul className={cn('ratio-chart__legend', className)}>
      {series.map((s) => (
        <li key={s.key} className="ratio-chart__legend-item">
          <span
            className="ratio-chart__swatch"
            data-kind={s.kind}
            style={{ color: s.color }}
            aria-hidden="true"
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartPlotProps {
  /** The plot's height: a number of pixels or any CSS length. @default var(--chart-height), 15rem */
  height?: number | string;
  className?: string;
  /** The layers and axes, drawn in the order written: `Chart.Grid` first, then `Chart.Bars`, `Chart.Line`, and the axes. */
  children: ReactNode;
}

/**
 * The drawing: an image to assistive technology, named by the chart's
 * `label`. The numbers themselves are in `Chart.Table`.
 */
export function ChartPlot({ height, className, children, model }: ChartPlotProps & Injected) {
  const { label } = need(model, 'Chart.Plot');
  const style =
    height === undefined
      ? undefined
      : ({
          '--chart-height': typeof height === 'number' ? `${height}px` : height,
        } as React.CSSProperties);
  return (
    <div role="img" aria-label={label} className={cn('ratio-chart__plot', className)} style={style}>
      {children}
    </div>
  );
}

/** A line at every tick of the value axis; the zero line a shade stronger. */
export function ChartGrid({ model }: Injected) {
  const { ticks, y } = need(model, 'Chart.Grid');
  return (
    <div className="ratio-chart__layer">
      {ticks.ticks.map((t) => (
        <div
          key={t}
          className="ratio-chart__gridline"
          data-zero={t === 0 || undefined}
          style={{ bottom: pct(y(t)) }}
        />
      ))}
    </div>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartBarsProps {
  /** Only these bar series. @default every bar series */
  keys?: readonly string[];
}

/**
 * The bar series: stacked by `stack`, side by side between stacks, up from
 * zero for positive values and down from it for negative ones. A tooltip
 * names each segment and its value.
 */
export function ChartBars({ keys, model }: ChartBarsProps & Injected) {
  const { rows, x, band, y, groups, segments, series, formatValue, unit } = need(
    model,
    'Chart.Bars',
  );
  if (groups.length === 0) return null;
  const slot = band.bandwidth / groups.length;
  const inset = groups.length > 1 ? slot * 0.06 : 0;
  const byKey = new Map(series.map((s) => [s.key, s]));
  const marks: ReactNode[] = [];

  rows.forEach((row, i) => {
    groups.forEach((stack, g) => {
      // The outermost segment on each side of zero gets the rounded end.
      let top: string | undefined;
      let bottom: string | undefined;
      stack.forEach((key) => {
        const value = valueOf(row, key) ?? 0;
        if (value > 0) top = key;
        if (value < 0) bottom = key;
      });
      stack.forEach((key) => {
        if (keys && !keys.includes(key)) return;
        const [y0, y1] = segments.get(key)![i]!;
        if (y1 === y0) return;
        const value = valueOf(row, key)!;
        const s = byKey.get(key)!;
        const joined =
          value > 0 ? (y0 !== 0 ? 'below' : undefined) : y1 !== 0 ? 'above' : undefined;
        marks.push(
          <div
            key={`${i}:${key}`}
            className="ratio-chart__bar"
            data-series={key}
            data-cap={key === top ? 'top' : key === bottom ? 'bottom' : undefined}
            data-joined={joined}
            title={`${String(row[x] ?? '')} · ${s.label}: ${formatValue(value)}${unit ? ` ${unit}` : ''}`}
            style={{
              left: pct(band.start(i) + g * slot + inset),
              width: pct(slot - 2 * inset),
              bottom: pct(y(y0)),
              height: pct(y(y1) - y(y0)),
              color: s.color,
            }}
          />,
        );
      });
    });
  });

  return <div className="ratio-chart__layer">{marks}</div>;
}

/** @beta Prop shape may change before release. */
export interface ChartLineProps {
  /** Only these line series. @default every line series */
  keys?: readonly string[];
}

/** Runs of rows with a value, so a missing value breaks the line instead of bridging it. */
function runs(rows: readonly ChartRow[], key: string): number[][] {
  const out: number[][] = [];
  let run: number[] = [];
  rows.forEach((row, i) => {
    if (valueOf(row, key) === undefined) {
      if (run.length) out.push(run);
      run = [];
    } else run.push(i);
  });
  if (run.length) out.push(run);
  return out;
}

/**
 * The line series, through the centre of each category. Drawn in a
 * stretched 100-unit box with a stroke that does not stretch, so it
 * follows the plot's width at any size.
 */
export function ChartLine({ keys, model }: ChartLineProps & Injected) {
  const { rows, band, y, series } = need(model, 'Chart.Line');
  const lines = series.filter((s) => s.kind === 'line' && (!keys || keys.includes(s.key)));
  if (lines.length === 0) return null;
  return (
    <div className="ratio-chart__layer">
      <svg
        className="ratio-chart__lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {lines.flatMap((s) =>
          runs(rows, s.key).map((run) => (
            <polyline
              key={`${s.key}:${run[0]}`}
              className="ratio-chart__line"
              data-series={s.key}
              style={{ color: s.color }}
              points={run
                .map((i) => {
                  const px = band.center(i) * 100;
                  const py = (1 - y(valueOf(rows[i]!, s.key)!)) * 100;
                  return `${px.toFixed(3)},${py.toFixed(3)}`;
                })
                .join(' ')}
            />
          )),
        )}
      </svg>
    </div>
  );
}

/**
 * A tooltip for every category: hover a column to see its label and every
 * series' value. Rendered on the server and shown with CSS, with no
 * script. For the pointer only; the plot is an image to assistive
 * technology, and `Chart.Table` holds the numbers for everyone. Write it
 * last in `Chart.Plot`, so its columns lie over the marks.
 */
export function ChartTooltip({ model }: Injected) {
  const { rows, x, band, series, formatValue, unit } = need(model, 'Chart.Tooltip');
  const gutter = band.step - band.bandwidth;
  return (
    <div className="ratio-chart__layer ratio-chart__columns" aria-hidden="true">
      {rows.map((row, i) => (
        <div
          key={i}
          className="ratio-chart__column"
          data-side={band.center(i) > 0.5 ? 'start' : 'end'}
          style={{ left: pct(band.start(i) - gutter / 2), width: pct(band.step) }}
        >
          <div className="ratio-chart__tip">
            <span className="ratio-chart__tip-title">{String(row[x] ?? '')}</span>
            {series.map((s) => {
              const value = valueOf(row, s.key);
              if (value === undefined) return null;
              return (
                <span key={s.key} className="ratio-chart__tip-row" data-series={s.key}>
                  <span
                    className="ratio-chart__swatch"
                    data-kind={s.kind}
                    style={{ color: s.color }}
                  />
                  <span>{s.label}</span>
                  <span className="ratio-chart__tip-value">
                    {formatValue(value)}
                    {unit ? ` ${unit}` : ''}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The value axis, on the leading edge: a label at every tick, the unit after the top one. */
export function ChartYAxis({ model }: Injected) {
  const { ticks, y, formatTick, unit } = need(model, 'Chart.YAxis');
  const last = ticks.ticks.length - 1;
  const labels = ticks.ticks.map((t, i) =>
    unit && i === last ? `${formatTick(t)} ${unit}` : formatTick(t),
  );
  return (
    <div className="ratio-chart__yaxis">
      <span className="ratio-chart__sizer" aria-hidden="true">
        {labels.map((text, i) => (
          <span key={i} style={{ display: 'block' }}>
            {text}
          </span>
        ))}
      </span>
      {ticks.ticks.map((t, i) => (
        <span key={t} className="ratio-chart__tick" style={{ bottom: pct(y(t)) }}>
          {labels[i]}
        </span>
      ))}
    </div>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartXAxisProps {
  /** Label every nth category: `6` for 00, 06, 12, 18. @default enough to keep about a dozen */
  every?: number;
}

/** The category axis, under the plot: each row's `x`, centred under its band. */
export function ChartXAxis({ every, model }: ChartXAxisProps & Injected) {
  const { rows, x, band } = need(model, 'Chart.XAxis');
  const n = Math.max(1, Math.round(every ?? Math.ceil(rows.length / 12)));
  return (
    <div className="ratio-chart__xaxis">
      {rows.map((row, i) =>
        i % n === 0 ? (
          <span key={i} className="ratio-chart__tick" style={{ left: pct(band.center(i)) }}>
            {String(row[x] ?? '')}
          </span>
        ) : null,
      )}
    </div>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartTableProps {
  /** The disclosure's label. @default 'Show as table' */
  summary?: ReactNode;
  /** Start open. */
  open?: boolean;
  className?: string;
}

/**
 * The chart's numbers as a table, behind a disclosure: what a screen reader
 * reads, and what anyone can check a bar against. Built from the same rows,
 * so it cannot drift from the drawing.
 */
export function ChartTable({
  summary = 'Show as table',
  open,
  className,
  model,
}: ChartTableProps & Injected) {
  const { rows, x, xLabel, label, series, formatValue, unit } = need(model, 'Chart.Table');
  return (
    <details className={cn('ratio-chart__table', className)} open={open}>
      <summary>{summary}</summary>
      <div className="ratio-chart__table-scroll">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{xLabel}</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {unit ? `${s.label} (${unit})` : s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <th scope="row">{String(row[x] ?? '')}</th>
                {series.map((s) => {
                  const value = valueOf(row, s.key);
                  return <td key={s.key}>{value === undefined ? '–' : formatValue(value)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

ChartRoot.displayName = 'Chart';
