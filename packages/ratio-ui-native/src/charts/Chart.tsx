// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The web's `Chart` for the app, from the same model in
// @eventuras/ratio-ui-core/charts: the same nice ticks, the same stacks, the
// same palette, so a chart in the app agrees with the one on the site. Bars,
// grid and labels are Views placed in percent of the plot; the line is
// react-native-svg in a stretched box with a stroke that does not stretch.
//
// Unlike the web, the parts share the model through context: an app has
// no server components, and context lets a part sit anywhere below the
// root and the root keep the toggles' and the tooltip's state.

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Pressable, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import {
  bandScale,
  chartColorKey,
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
import { useTheme, type RatioTheme } from '../RatioProvider';
import { Text } from '../Text';

/** How a series is drawn. */
export type ChartSeriesKind = 'bar' | 'line';

/** @beta Shape may change before release. */
export interface ChartSeries {
  /** The key of its value in each row. */
  key: string;
  /** Its name in the legend, the table and the tooltip. */
  label: string;
  /** @default 'bar' */
  kind?: ChartSeriesKind;
  /** Bars with the same `stack` stack on each other; bars without one stand side by side. */
  stack?: string;
  /** Any colour. @default the palette's next, from the theme */
  color?: string;
}

interface ResolvedSeries {
  key: string;
  label: string;
  kind: ChartSeriesKind;
  color: string;
}

interface ChartModel {
  theme: RatioTheme;
  rows: readonly ChartRow[];
  x: string;
  xLabel: string;
  label: string;
  unit?: string;
  series: ResolvedSeries[];
  y: LinearScale;
  ticks: NiceTicks;
  band: BandScale;
  groups: string[][];
  segments: Map<string, StackSegment[]>;
  formatTick: (value: number) => string;
  formatValue: (value: number) => string;
  muted: ReadonlySet<string>;
  toggle: (key: string) => void;
  selected: number | null;
  select: (index: number | null) => void;
}

const ChartContext = createContext<ChartModel | null>(null);

function useChart(part: string): ChartModel {
  const model = useContext(ChartContext);
  if (!model) throw new Error(`<${part}> must be inside <Chart>.`);
  return model;
}

const pct = (fraction: number): DimensionValue => `${Number((fraction * 100).toFixed(4))}%`;

/** @beta Prop shape may change before release. */
export interface ChartProps {
  /** One row per category: its label under `x`, its values by series key. */
  data: readonly ChartRow[];
  /** The key of each row's category label. */
  x: string;
  series: readonly ChartSeries[];
  /** What the chart shows, in a sentence: the plot's accessibility label and the table's title. */
  label: string;
  /** The categories' header in the table. @default `x` */
  xLabel?: string;
  /** The values' unit: after the top tick, in the table's headers and the tooltip. */
  unit?: string;
  /** The locale and number options for ticks, tooltip and table. */
  format?: ChartNumberFormat;
  /** The value axis's extent, widened to nice ticks. @default the data's, zero included */
  domain?: readonly [number, number];
  /** About how many steps the value axis has. @default 4 */
  tickCount?: number;
  /** The gap between categories, as a share of each one's width. @default 0.3 */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  /** The parts: `Chart.Legend`, `Chart.Plot` with its layers and axes, `Chart.Table`. */
  children: ReactNode;
}

/** The root: computes the model once and lays the parts out in a column. */
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
  style,
  children,
}: ChartProps) {
  const theme = useTheme();
  const [muted, setMuted] = useState<ReadonlySet<string>>(() => new Set());
  const [selected, select] = useState<number | null>(null);

  const resolved: ResolvedSeries[] = series.map((s, i) => ({
    key: s.key,
    label: s.label,
    kind: s.kind ?? 'bar',
    color: s.color ?? theme.colors[chartColorKey(i)],
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
    theme,
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
    muted,
    toggle: (key) =>
      setMuted((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }),
    selected,
    select,
  };

  return (
    <ChartContext.Provider value={model}>
      <View style={[{ gap: theme.space.s }, style]}>{children}</View>
    </ChartContext.Provider>
  );
}

const Swatch = ({ kind, color }: { kind: ChartSeriesKind; color: string }) => {
  const theme = useTheme();
  return (
    <View
      style={
        kind === 'line'
          ? { width: 16, height: 3, borderRadius: 1, backgroundColor: color }
          : { width: 12, height: 12, borderRadius: theme.radius.xs, backgroundColor: color }
      }
    />
  );
};

/** @beta Prop shape may change before release. */
export interface ChartLegendProps {
  /** Each entry a toggle that fades its series out and back; the stacks and the scale hold still. */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The series by name and colour: a square for bars, a dash for a line. */
export function ChartLegend({ interactive, style }: ChartLegendProps) {
  const { series, muted, toggle, theme } = useChart('Chart.Legend');
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: theme.space.s,
          rowGap: theme.space['3xs'],
        },
        style,
      ]}
    >
      {series.map((s) => {
        const on = !muted.has(s.key);
        const item = (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: on ? 1 : 0.55 }}
          >
            <Swatch kind={s.kind} color={s.color} />
            <Text
              size="sm"
              tone="muted"
              style={on ? undefined : { textDecorationLine: 'line-through' }}
            >
              {s.label}
            </Text>
          </View>
        );
        return interactive ? (
          <Pressable
            key={s.key}
            role="button"
            accessibilityState={{ selected: on }}
            aria-pressed={on}
            onPress={() => toggle(s.key)}
            hitSlop={6}
          >
            {item}
          </Pressable>
        ) : (
          <View key={s.key}>{item}</View>
        );
      })}
    </View>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartPlotProps {
  /** The plot's height in points. @default 200 */
  height?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * The layers and axes, as direct children: `Chart.Grid`, `Chart.Bars`,
   * `Chart.Line` and `Chart.Tooltip` are drawn over each other in the order
   * written; `Chart.YAxis` goes beside the plot and `Chart.XAxis` under it.
   */
  children: ReactNode;
}

/** The drawing: an image to assistive technology, named by the chart's `label`. */
export function ChartPlot({ height = 200, style, children }: ChartPlotProps) {
  const { label, theme } = useChart('Chart.Plot');
  let yAxis: ReactNode = null;
  let xAxis: ReactNode = null;
  const layers: ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === ChartYAxis) yAxis = child;
    else if (React.isValidElement(child) && child.type === ChartXAxis) xAxis = child;
    else if (child != null && child !== false) layers.push(child);
  });
  return (
    <View
      accessible
      role="img"
      accessibilityLabel={label}
      style={[{ flexDirection: 'row', gap: theme.space['2xs'], paddingTop: 8 }, style]}
    >
      {yAxis && <View style={{ height }}>{yAxis}</View>}
      <View style={{ flex: 1, minWidth: 0, gap: theme.space['3xs'] }}>
        <View style={{ height }}>
          {layers.map((layer, i) => (
            <View
              key={i}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
              pointerEvents="box-none"
            >
              {layer}
            </View>
          ))}
        </View>
        {xAxis}
      </View>
    </View>
  );
}

/** A line at every tick of the value axis; the zero line a shade stronger. */
export function ChartGrid() {
  const { ticks, y, theme } = useChart('Chart.Grid');
  return (
    <>
      {ticks.ticks.map((t) => (
        <View
          key={t}
          testID={t === 0 ? 'chart-zero' : 'chart-gridline'}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: pct(y(t)),
            height: 1,
            marginBottom: -0.5,
            backgroundColor: t === 0 ? theme.colors.border2 : theme.colors.border1,
          }}
        />
      ))}
    </>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartBarsProps {
  /** Only these bar series. @default every bar series */
  keys?: readonly string[];
}

/** The bar series: stacked by `stack`, side by side between stacks, down from zero for negative values. */
export function ChartBars({ keys }: ChartBarsProps) {
  const { rows, band, y, groups, segments, series, muted, theme } = useChart('Chart.Bars');
  if (groups.length === 0) return null;
  const slot = band.bandwidth / groups.length;
  const inset = groups.length > 1 ? slot * 0.06 : 0;
  const byKey = new Map(series.map((s) => [s.key, s]));
  const radius = theme.radius.xs;
  const marks: ReactNode[] = [];
  rows.forEach((row, i) => {
    groups.forEach((stack, g) => {
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
        const restsBelow = value > 0 && y0 !== 0;
        const hangsAbove = value < 0 && y1 !== 0;
        marks.push(
          <View
            key={`${i}:${key}`}
            testID={`chart-bar-${key}`}
            style={{
              position: 'absolute',
              left: pct(band.start(i) + g * slot + inset),
              width: pct(slot - 2 * inset),
              bottom: pct(y(y0)),
              height: pct(y(y1) - y(y0)),
              backgroundColor: byKey.get(key)!.color,
              opacity: muted.has(key) ? 0.15 : 1,
              borderTopLeftRadius: key === top ? radius : 0,
              borderTopRightRadius: key === top ? radius : 0,
              borderBottomLeftRadius: key === bottom ? radius : 0,
              borderBottomRightRadius: key === bottom ? radius : 0,
              borderBottomWidth: restsBelow ? 1.5 : 0,
              borderTopWidth: hangsAbove ? 1.5 : 0,
              borderColor: theme.colors.card,
            }}
          />,
        );
      });
    });
  });
  return <>{marks}</>;
}

/** @beta Prop shape may change before release. */
export interface ChartLineProps {
  /** Only these line series. @default every line series */
  keys?: readonly string[];
}

/** The line series, through each category's centre; a missing value breaks the line. */
export function ChartLine({ keys }: ChartLineProps) {
  const { rows, band, y, series, muted } = useChart('Chart.Line');
  const lines = series.filter((s) => s.kind === 'line' && (!keys || keys.includes(s.key)));
  if (lines.length === 0) return null;
  const runs = (key: string): number[][] => {
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
  };
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ overflow: 'visible' }}
    >
      {lines.flatMap((s) =>
        runs(s.key).map((run) => (
          <Polyline
            key={`${s.key}:${run[0]}`}
            testID={`chart-line-${s.key}`}
            points={run
              .map(
                (i) =>
                  `${(band.center(i) * 100).toFixed(3)},${((1 - y(valueOf(rows[i]!, s.key)!)) * 100).toFixed(3)}`,
              )
              .join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={muted.has(s.key) ? 0.15 : 1}
          />
        )),
      )}
    </Svg>
  );
}

/**
 * Tap a category to see its label and every series' value; tap again, or
 * another, to move on. For the eye: the plot is an image to a screen
 * reader, and `Chart.Table` holds the numbers. Write it last in `Chart.Plot`.
 */
export function ChartTooltip() {
  const { rows, x, band, series, formatValue, unit, selected, select, muted, theme } =
    useChart('Chart.Tooltip');
  const gutter = band.step - band.bandwidth;
  const row = selected === null ? undefined : rows[selected];
  return (
    <>
      {rows.map((_, i) => (
        <Pressable
          key={i}
          testID="chart-column"
          onPress={() => select(selected === i ? null : i)}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: pct(band.start(i) - gutter / 2),
            width: pct(band.step),
            backgroundColor: selected === i ? theme.colors.text : 'transparent',
            opacity: 0.07,
          }}
        />
      ))}
      {row && selected !== null && (
        <View
          testID="chart-tip"
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            ...(band.center(selected) > 0.5
              ? { right: pct(1 - band.start(selected) + gutter / 2) }
              : { left: pct(band.start(selected) + band.step - gutter / 2) }),
            marginHorizontal: 6,
            minWidth: 190,
            gap: 2,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderWidth: 1,
            borderColor: theme.colors.border2,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.card,
          }}
        >
          <Text size="sm" weight="semibold">
            {String(row[x] ?? '')}
          </Text>
          {series.map((s) => {
            const value = valueOf(row, s.key);
            if (value === undefined) return null;
            return (
              <View
                key={s.key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  opacity: muted.has(s.key) ? 0.4 : 1,
                }}
              >
                <Swatch kind={s.kind} color={s.color} />
                <Text size="sm" style={{ flex: 1 }}>
                  {s.label}
                </Text>
                <Text size="sm" style={{ flexShrink: 0, fontVariant: ['tabular-nums'] }}>
                  {formatValue(value)}
                  {unit ? ` ${unit}` : ''}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

/** The value axis, beside the plot: a label at every tick, the unit after the top one. */
export function ChartYAxis() {
  const { ticks, y, formatTick, unit, theme } = useChart('Chart.YAxis');
  const last = ticks.ticks.length - 1;
  const labels = ticks.ticks.map((t, i) =>
    unit && i === last ? `${formatTick(t)} ${unit}` : formatTick(t),
  );
  const lineHeight = Math.round(theme.fontSize.xs * 1.5);
  return (
    <View style={{ height: '100%' }}>
      {/* The labels, invisible and in flow, give the axis its width. */}
      <View style={{ height: 0, overflow: 'hidden' }} aria-hidden>
        {labels.map((text, i) => (
          <Text key={i} size="xs" style={{ fontVariant: ['tabular-nums'] }}>
            {text}
          </Text>
        ))}
      </View>
      {ticks.ticks.map((t, i) => (
        <Text
          key={t}
          testID="chart-ytick"
          numberOfLines={1}
          size="xs"
          tone="subtle"
          style={{
            position: 'absolute',
            right: 0,
            bottom: pct(y(t)),
            marginBottom: -lineHeight / 2,
            lineHeight,
            fontVariant: ['tabular-nums'],
          }}
        >
          {labels[i]}
        </Text>
      ))}
    </View>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartXAxisProps {
  /** Label every nth category. @default enough to keep about eight */
  every?: number;
}

const X_LABEL_WIDTH = 56;

/** The category axis, under the plot: each row's `x`, centred under its band. */
export function ChartXAxis({ every }: ChartXAxisProps) {
  const { rows, x, band, theme } = useChart('Chart.XAxis');
  const n = Math.max(1, Math.round(every ?? Math.ceil(rows.length / 8)));
  return (
    <View style={{ height: Math.round(theme.fontSize.xs * 1.5) }}>
      {rows.map((row, i) =>
        i % n === 0 ? (
          <Text
            key={i}
            size="xs"
            tone="subtle"
            numberOfLines={1}
            style={{
              position: 'absolute',
              left: pct(band.center(i)),
              width: X_LABEL_WIDTH,
              marginLeft: -X_LABEL_WIDTH / 2,
              textAlign: 'center',
            }}
          >
            {String(row[x] ?? '')}
          </Text>
        ) : null,
      )}
    </View>
  );
}

/** @beta Prop shape may change before release. */
export interface ChartTableProps {
  /** The toggle's label. @default 'Show as table' */
  summary?: string;
  /** Start open. */
  open?: boolean;
}

/** The chart's numbers as rows of text, behind a toggle: what a screen reader reads. */
export function ChartTable({ summary = 'Show as table', open: initial = false }: ChartTableProps) {
  const { rows, x, xLabel, label, series, formatValue, unit, theme } = useChart('Chart.Table');
  const [open, setOpen] = useState(initial);
  const cell = { flex: 1, textAlign: 'right' as const, fontVariant: ['tabular-nums' as const] };
  const line = {
    flexDirection: 'row' as const,
    gap: theme.space['2xs'],
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: theme.colors.border1,
  };
  return (
    <View style={{ gap: theme.space['2xs'] }}>
      <Pressable
        role="button"
        aria-expanded={open}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
      >
        <Text size="sm" style={{ color: theme.colors.primary }}>
          {open ? '▾' : '▸'} {summary}
        </Text>
      </Pressable>
      {open && (
        <View accessibilityLabel={label}>
          <Text size="sm" tone="muted">
            {label}
          </Text>
          <View style={line}>
            <Text size="xs" tone="muted" weight="semibold" style={{ flex: 1 }}>
              {xLabel}
            </Text>
            {series.map((s) => (
              <Text key={s.key} size="xs" tone="muted" weight="semibold" style={cell}>
                {unit ? `${s.label} (${unit})` : s.label}
              </Text>
            ))}
          </View>
          {rows.map((row, i) => (
            <View key={i} style={line} testID="chart-table-row">
              <Text size="sm" weight="semibold" style={{ flex: 1 }}>
                {String(row[x] ?? '')}
              </Text>
              {series.map((s) => {
                const value = valueOf(row, s.key);
                return (
                  <Text key={s.key} size="sm" style={cell}>
                    {value === undefined ? '–' : formatValue(value)}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

ChartRoot.displayName = 'Chart';
