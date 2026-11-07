import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Chart } from './index';
import { Card } from '../Card';
import { Heading } from '../Text';
import { BothModes } from '../storyFrame';

// The same day as the web's `HourByHour` story: the model is shared, so the
// app's chart and the site's agree on every tick and every stack.
const hours = [
  [0.1, 0.2, 0, 0.3], [0.1, 0.2, 0, 0.28], [0.15, 0.2, 0, 0.27], [0.2, 0.15, 0, 0.27],
  [0.2, 0.15, 0, 0.27], [0.2, 0.15, 0, 0.28], [0.25, 0.15, 0, 0.35], [0.25, 0.15, 0, 0.45],
  [0.2, 0.2, 0, 0.42], [0.2, 0.15, 0.02, 0.38], [0.3, 0.15, 0.06, 0.36], [0.4, 0.15, 0.1, 0.36],
  [0.5, 0.15, 0.12, 0.4], [0.6, 0.15, 0.1, 0.38], [0.7, 0.15, 0.06, 0.37], [0.75, 0.15, 0, 0.4],
  [0.7, 0.2, 0, 0.5], [0.6, 0.2, 0, 0.62], [0.5, 0.2, 0, 0.66], [0.45, 0.2, 0, 0.6],
  [0.4, 0.2, 0, 0.52], [0.35, 0.2, 0, 0.45], [0.3, 0.2, 0, 0.38], [0.25, 0.2, 0, 0.33],
].map(([wind, water, sun, use], h) => ({ hour: String(h).padStart(2, '0'), wind, water, sun, use }));

const energy = [
  { key: 'wind', label: 'Wind', stack: 'production' },
  { key: 'water', label: 'Water', stack: 'production' },
  { key: 'sun', label: 'Sun', stack: 'production' },
  { key: 'use', label: 'Consumption', kind: 'line' as const },
];

const meta: Meta<typeof Chart> = {
  title: 'Native/Chart',
  component: Chart,
  parameters: {
    docs: {
      description: {
        component:
          "The web's `Chart` for the app, from the same model in `@eventuras/ratio-ui-core/charts` and the same palette: stacked, grouped and negative bars, lines, a tap-to-inspect tooltip, legend toggles and the numbers as a table. Bars and grid are Views placed in percent; the line is react-native-svg. Import it from `@eventuras/ratio-ui-native/charts`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <BothModes>
        <Story />
      </BothModes>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Chart>;

/** Measures every resting bar against the zero line: the chart's one promise. */
async function expectBarsOnZero(canvasElement: HTMLElement) {
  const zeros = within(canvasElement).getAllByTestId('chart-zero');
  for (const zero of zeros) {
    const plot = zero.parentElement!.parentElement!;
    const line = zero.getBoundingClientRect();
    const zeroY = line.top + line.height / 2;
    const bars = [...plot.querySelectorAll<HTMLElement>('[data-testid^="chart-bar-wind"]')];
    for (const bar of bars) {
      await expect(Math.abs(bar.getBoundingClientRect().bottom - zeroY)).toBeLessThan(1.5);
    }
  }
}

/**
 * Hour by hour, as on the web: stacked bars of production with the
 * consumption line over them, the theme's palette, the unit on the top tick.
 */
export const HourByHour: Story = {
  render: () => (
    <Card>
      <Chart data={hours} x="hour" xLabel="Hour" unit="kW" series={energy} label="Production and consumption, hour by hour">
        <Heading level={3}>Hour by hour</Heading>
        <Chart.Legend />
        <Chart.Plot height={200}>
          <Chart.Grid />
          <Chart.Bars />
          <Chart.Line />
          <Chart.YAxis />
          <Chart.XAxis every={6} />
        </Chart.Plot>
      </Chart>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two modes side by side: everything twice.
    await expect(canvas.getAllByRole('img', { name: 'Production and consumption, hour by hour' })).toHaveLength(2);
    await expect(canvas.getAllByTestId('chart-bar-sun')).toHaveLength(12);
    const ticks = canvas.getAllByTestId('chart-ytick').map((el) => el.textContent);
    await expect(ticks.slice(0, 5)).toEqual(['0.00', '0.25', '0.50', '0.75', '1.00 kW']);
    await expectBarsOnZero(canvasElement);
  },
};

/**
 * Interactive: tap a category for its values, tap a legend entry to fade a
 * series out and back. A muted series fades rather than vanishes, so the
 * stacks and the scale hold still.
 */
export const Interactive: Story = {
  render: () => (
    <Card>
      <Chart data={hours.slice(8, 20)} x="hour" unit="kW" series={energy} label="Production and consumption, daytime">
        <Chart.Legend interactive />
        <Chart.Plot height={200}>
          <Chart.Grid />
          <Chart.Bars />
          <Chart.Line />
          <Chart.YAxis />
          <Chart.XAxis every={2} />
          <Chart.Tooltip />
        </Chart.Plot>
      </Chart>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [column] = canvas.getAllByTestId('chart-column').slice(4, 5);
    await userEvent.click(column!);
    const tip = canvas.getByTestId('chart-tip');
    await expect(tip.textContent).toContain('12');
    await expect(tip.textContent).toContain('0.5 kW');
    await userEvent.click(column!);
    await expect(canvas.queryByTestId('chart-tip')).toBeNull();

    const [sun] = canvas.getAllByRole('button', { name: /Sun/ });
    await userEvent.click(sun!);
    await expect(sun).toHaveAttribute('aria-pressed', 'false');
    // The light panel's sun bars have faded; the dark panel's are untouched.
    const [lightSun] = canvas.getAllByTestId('chart-bar-sun');
    await expect(getComputedStyle(lightSun!).opacity).toBe('0.15');
    await expect(getComputedStyle(canvas.getAllByTestId('chart-bar-wind')[0]!).opacity).toBe('1');
  },
};

/** Lines, and values below zero: the axis widens to hold them. */
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
      <Chart.Plot height={180}>
        <Chart.Grid />
        <Chart.Line />
        <Chart.YAxis />
        <Chart.XAxis every={1} />
      </Chart.Plot>
    </Chart>
  ),
};

/** The numbers behind a toggle: what a screen reader reads, and what anyone can check a bar against. */
export const WithTable: Story = {
  render: () => (
    <Chart
      data={[
        { quarter: 'Q1', last: 210, current: 240 },
        { quarter: 'Q2', last: 180, current: 230 },
        { quarter: 'Q3', last: 150, current: 140 },
        { quarter: 'Q4', last: 260, current: 300 },
      ]}
      x="quarter"
      xLabel="Quarter"
      series={[
        { key: 'last', label: '2025' },
        { key: 'current', label: '2026' },
      ]}
      label="Registrations per quarter, 2025 and 2026"
    >
      <Chart.Legend />
      <Chart.Plot height={160}>
        <Chart.Grid />
        <Chart.Bars />
        <Chart.YAxis />
        <Chart.XAxis />
      </Chart.Plot>
      <Chart.Table />
    </Chart>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [toggle] = canvas.getAllByRole('button', { name: /Show as table/ });
    await userEvent.click(toggle!);
    const rows = canvas.getAllByTestId('chart-table-row');
    await expect(rows).toHaveLength(4);
    await expect(rows[3]!.textContent).toBe('Q4260300');
  },
};
