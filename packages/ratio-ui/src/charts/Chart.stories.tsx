// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Chart } from './index';
import { Card } from '../core/Card';
import { Heading } from '../core/Heading';
import { Text } from '../core/Text';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Chart',
  component: Chart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Chart>;

/** The zero line and the bars must meet: the drawing's one promise. */
async function expectBarsOnZero(canvasElement: HTMLElement) {
  const zero = canvasElement.querySelector('.ratio-chart__gridline[data-zero]')!.getBoundingClientRect();
  const bars = [...canvasElement.querySelectorAll<HTMLElement>('.ratio-chart__bar')];
  const resting = bars.filter((bar) => !bar.dataset.joined);
  for (const bar of resting) {
    const box = bar.getBoundingClientRect();
    const edge = Math.abs(box.bottom - zero.top) < Math.abs(box.top - zero.top) ? box.bottom : box.top;
    await expect(Math.abs(edge - zero.top)).toBeLessThan(1.5);
  }
}

/** The value axis's labels as written, bottom up. */
const yTicks = (canvasElement: HTMLElement): string[] =>
  [...canvasElement.querySelectorAll('.ratio-chart__yaxis > .ratio-chart__tick')].map((el) => el.textContent ?? '');

const months = [
  { month: 'Jan', registrations: 42 },
  { month: 'Feb', registrations: 58 },
  { month: 'Mar', registrations: 71 },
  { month: 'Apr', registrations: 64 },
  { month: 'May', registrations: 88 },
  { month: 'Jun', registrations: 35 },
  { month: 'Jul', registrations: 12 },
  { month: 'Aug', registrations: 49 },
  { month: 'Sep', registrations: 93 },
  { month: 'Oct', registrations: 77 },
  { month: 'Nov', registrations: 61 },
  { month: 'Dec', registrations: 28 },
];

/**
 * A bar per category. The root takes the rows, the key of each row's
 * label (`x`) and the series; the parts draw. `Chart.Plot` is an image to
 * a screen reader, named by `label` — put the numbers in `Chart.Table`.
 */
export const Default: Story = {
  render: () => (
    <Chart
      data={months}
      x="month"
      series={[{ key: 'registrations', label: 'Registrations' }]}
      label="Registrations per month, 2026"
    >
      <Chart.Plot>
        <Chart.Grid />
        <Chart.Bars />
        <Chart.YAxis />
        <Chart.XAxis />
      </Chart.Plot>
    </Chart>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Registrations per month, 2026' })).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.ratio-chart__bar')).toHaveLength(12);
    // 93 at most: the axis goes to a nice 100, in steps of 25.
    await expect(yTicks(canvasElement)).toEqual(['0', '25', '50', '75', '100']);
    await expectBarsOnZero(canvasElement);
  },
};

/**
 * Series with the same `stack` build on each other, in the order given,
 * with a hairline of paper between the segments. The legend names them.
 */
export const Stacked: Story = {
  render: () => (
    <Chart
      data={[
        { term: 'Spring', online: 120, onsite: 80, hybrid: 30 },
        { term: 'Summer', online: 60, onsite: 20, hybrid: 10 },
        { term: 'Autumn', online: 140, onsite: 95, hybrid: 45 },
        { term: 'Winter', online: 110, onsite: 70, hybrid: 25 },
      ]}
      x="term"
      series={[
        { key: 'online', label: 'Online', stack: 'all' },
        { key: 'onsite', label: 'On site', stack: 'all' },
        { key: 'hybrid', label: 'Hybrid', stack: 'all' },
      ]}
      label="Participants per term, by format"
    >
      <Chart.Legend />
      <Chart.Plot>
        <Chart.Grid />
        <Chart.Bars />
        <Chart.YAxis />
        <Chart.XAxis />
      </Chart.Plot>
    </Chart>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.ratio-chart__legend-item')).toHaveLength(3);
    // One rounded top per bar, on its highest segment.
    await expect(canvasElement.querySelectorAll('.ratio-chart__bar[data-cap="top"][data-series="hybrid"]')).toHaveLength(4);
    await expectBarsOnZero(canvasElement);
  },
};

/** Bars without a `stack` stand side by side: this year against last. */
export const Grouped: Story = {
  render: () => (
    <Chart
      data={[
        { quarter: 'Q1', last: 210, current: 240 },
        { quarter: 'Q2', last: 180, current: 230 },
        { quarter: 'Q3', last: 150, current: 140 },
        { quarter: 'Q4', last: 260, current: 300 },
      ]}
      x="quarter"
      series={[
        { key: 'last', label: '2025' },
        { key: 'current', label: '2026' },
      ]}
      label="Registrations per quarter, 2025 and 2026"
    >
      <Chart.Legend />
      <Chart.Plot height={200}>
        <Chart.Grid />
        <Chart.Bars />
        <Chart.YAxis />
        <Chart.XAxis />
      </Chart.Plot>
    </Chart>
  ),
};

/**
 * Lines, and values below zero: the axis widens to hold them, and the
 * zero line is drawn a shade stronger. A missing value breaks a line
 * rather than bridging the gap.
 */
export const LinesAndNegatives: Story = {
  render: () => (
    <Chart
      data={[
        { day: 'Mon', oslo: -2.5, tromso: -6 },
        { day: 'Tue', oslo: -1, tromso: -7.5 },
        { day: 'Wed', oslo: 1.5, tromso: -4 },
        { day: 'Thu', oslo: 3, tromso: null },
        { day: 'Fri', oslo: 2, tromso: -2 },
        { day: 'Sat', oslo: 0.5, tromso: -3.5 },
        { day: 'Sun', oslo: -1.5, tromso: -5 },
      ]}
      x="day"
      unit="°C"
      series={[
        { key: 'oslo', label: 'Oslo', kind: 'line' },
        { key: 'tromso', label: 'Tromsø', kind: 'line' },
      ]}
      label="Midday temperature, Oslo and Tromsø, one week"
    >
      <Chart.Legend />
      <Chart.Plot height={200}>
        <Chart.Grid />
        <Chart.Line />
        <Chart.YAxis />
        <Chart.XAxis />
      </Chart.Plot>
    </Chart>
  ),
  play: async ({ canvasElement }) => {
    // Tromsø's missing Thursday splits its line in two.
    await expect(canvasElement.querySelectorAll('polyline[data-series="tromso"]')).toHaveLength(2);
    await expect(canvasElement.querySelector('.ratio-chart__gridline[data-zero]')).not.toBeNull();
  },
};

const hours = [
  [0.10, 0.20, 0, 0.30], [0.10, 0.20, 0, 0.28], [0.15, 0.20, 0, 0.27], [0.20, 0.15, 0, 0.27],
  [0.20, 0.15, 0, 0.27], [0.20, 0.15, 0, 0.28], [0.25, 0.15, 0, 0.35], [0.25, 0.15, 0, 0.45],
  [0.20, 0.20, 0, 0.42], [0.20, 0.15, 0.02, 0.38], [0.30, 0.15, 0.06, 0.36], [0.40, 0.15, 0.10, 0.36],
  [0.50, 0.15, 0.12, 0.40], [0.60, 0.15, 0.10, 0.38], [0.70, 0.15, 0.06, 0.37], [0.75, 0.15, 0, 0.40],
  [0.70, 0.20, 0, 0.50], [0.60, 0.20, 0, 0.62], [0.50, 0.20, 0, 0.66], [0.45, 0.20, 0, 0.60],
  [0.40, 0.20, 0, 0.52], [0.35, 0.20, 0, 0.45], [0.30, 0.20, 0, 0.38], [0.25, 0.20, 0, 0.33],
].map(([wind, water, sun, use], h) => ({ hour: String(h).padStart(2, '0'), wind, water, sun, use }));

const energySeries = [
  { key: 'wind', label: 'Wind, the turbine on the ridge', stack: 'production' },
  { key: 'water', label: 'Water, from the lake', stack: 'production' },
  { key: 'sun', label: 'Sun, the panel by the boathouse', stack: 'production' },
  { key: 'use', label: 'Consumption', kind: 'line' as const },
];

/**
 * A whole card, composed: a heading, the legend, stacked bars with a line
 * over them, a note, and the table behind a disclosure. Every part reads
 * the same scale, so the bars stand on the zero line and the line meets
 * the bars where the numbers say.
 */
export const HourByHour: Story = {
  render: () => (
    <Card>
      <Chart data={hours} x="hour" xLabel="Hour" unit="kW" series={energySeries} label="Production and consumption, hour by hour">
        <Heading as="h2" size="md">
          Hour by hour
        </Heading>
        <Chart.Legend />
        <Chart.Plot height={240}>
          <Chart.Grid />
          <Chart.Bars />
          <Chart.Line />
          <Chart.YAxis />
          <Chart.XAxis every={6} />
        </Chart.Plot>
        <Text variant="muted" size="sm">
          Sunrise 08:41, sunset 14:37. The lighthouse is lit while it is dark.
        </Text>
        <Chart.Table />
      </Chart>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The unit rides on the top tick.
    await expect(yTicks(canvasElement).at(-1)).toBe('1.00 kW');
    // 24 hours, three stacked series, sun only in daylight.
    await expect(canvasElement.querySelectorAll('.ratio-chart__bar[data-series="sun"]')).toHaveLength(6);
    await expectBarsOnZero(canvasElement);
    await userEvent.click(canvas.getByText('Show as table'));
    const table = canvas.getByRole('table', { name: 'Production and consumption, hour by hour' });
    await expect(within(table).getAllByRole('row')).toHaveLength(25);
    await expect(within(table).getByRole('columnheader', { name: 'Consumption (kW)' })).toBeInTheDocument();
  },
};

/**
 * In the reader's language: `format` takes a locale and any
 * `Intl.NumberFormat` options, for the ticks, the tooltips and the table;
 * the words are your own. Here, Norwegian.
 */
export const InAnotherLanguage: Story = {
  render: () => (
    <Chart
      data={hours.slice(8, 16)}
      x="hour"
      xLabel="Time"
      unit="kW"
      format={{ locale: 'nb' }}
      tickCount={2}
      series={[
        { key: 'wind', label: 'Vind', stack: 'produksjon' },
        { key: 'water', label: 'Vann', stack: 'produksjon' },
        { key: 'sun', label: 'Sol', stack: 'produksjon' },
        { key: 'use', label: 'Forbruk', kind: 'line' },
      ]}
      label="Produksjon og forbruk, time for time"
    >
      <Chart.Legend />
      <Chart.Plot height={200}>
        <Chart.Grid />
        <Chart.Bars />
        <Chart.Line />
        <Chart.YAxis />
        <Chart.XAxis />
      </Chart.Plot>
      <Chart.Table summary="Vis som tabell" />
    </Chart>
  ),
  play: async ({ canvasElement }) => {
    await expect(yTicks(canvasElement)).toEqual(['0,0', '0,5', '1,0 kW']);
  },
};

/**
 * The parts can sit anywhere in the chart's own JSX — inside a fragment, a
 * `<div>` of your layout, a `Card` — and the root still hands each one the
 * model. Here the legend stands beside the plot. (A part rendered inside a
 * component of your own is out of reach; write it in the chart's JSX.)
 */
export const InALayoutOfYourOwn: Story = {
  render: () => (
    <Chart
      data={months.slice(0, 6)}
      x="month"
      series={[{ key: 'registrations', label: 'Registrations' }]}
      label="Registrations per month, first half of 2026"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '10rem 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <aside>
          <Text variant="muted" size="sm">
            First half of 2026
          </Text>
          <Chart.Legend />
        </aside>
        <>
          <Chart.Plot height={180}>
            <Chart.Grid />
            <Chart.Bars />
            <Chart.YAxis />
            <Chart.XAxis />
          </Chart.Plot>
        </>
      </div>
    </Chart>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('aside .ratio-chart__legend-item')).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('.ratio-chart__bar')).toHaveLength(6);
  },
};

/** On the printed sheet: square bars, as every corner in Tabula. */
export const OnTabula: Story = {
  parameters: { theme: 'tabula' },
  render: () => (
    <Card>
      <Chart data={hours} x="hour" unit="kW" series={energySeries} label="Production and consumption, hour by hour">
        <Chart.Legend />
        <Chart.Plot>
          <Chart.Grid />
          <Chart.Bars />
          <Chart.Line />
          <Chart.YAxis />
          <Chart.XAxis every={6} />
        </Chart.Plot>
      </Chart>
    </Card>
  ),
};
