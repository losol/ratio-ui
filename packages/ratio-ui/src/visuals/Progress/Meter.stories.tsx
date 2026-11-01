import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Meter, type MeterThreshold } from './Meter';

const meta: Meta<typeof Meter> = {
  title: 'Visuals/Meter',
  component: Meter,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 60 } },
    tone: {
      control: 'select',
      options: ['primary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Capacity: `primary` with room to spare, `accent` from 85 %, `warning` when full. */
const CAPACITY: MeterThreshold[] = [
  { from: 0.85, tone: 'accent' },
  { from: 1, tone: 'warning' },
];

export const Default: Story = {
  args: {
    value: 24,
    max: 60,
    thresholds: CAPACITY,
    'aria-label': 'Registrations',
    valueText: '24 of 60 seats',
  },
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole('meter', { name: 'Registrations' });
    await expect(meter).toHaveAttribute('aria-valuenow', '24');
    await expect(meter).toHaveAttribute('aria-valuemax', '60');
    await expect(meter).toHaveAttribute('aria-valuetext', '24 of 60 seats');
    await expect(meter).toHaveAttribute('data-tone', 'primary');
  },
};

/** The same meter at three fill levels, as rows in an event list would show it. */
export const Thresholds: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      {[
        ['Autumn seminar', 24],
        ['Leadership course', 52],
        ['Annual conference', 60],
      ].map(([name, value]) => (
        <div key={name} className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span id={`label-${value}`}>{name}</span>
            <span className="tabular-nums text-(--text-muted)">{value} / 60</span>
          </div>
          <Meter
            value={value as number}
            max={60}
            thresholds={CAPACITY}
            aria-labelledby={`label-${value}`}
            valueText={`${value} of 60 seats`}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tones = within(canvasElement)
      .getAllByRole('meter')
      .map((el) => el.getAttribute('data-tone'));
    await expect(tones).toEqual(['primary', 'accent', 'warning']);
  },
};

/** Without thresholds the bar keeps one tone. Over `max` it fills and stays full. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Meter value={30} max={100} tone="primary" aria-label="Primary" />
      <Meter value={45} max={100} tone="accent" aria-label="Accent" />
      <Meter value={60} max={100} tone="success" aria-label="Success" />
      <Meter value={75} max={100} tone="warning" aria-label="Warning" />
      <Meter value={90} max={100} tone="error" aria-label="Error" />
      <Meter value={130} max={100} tone="neutral" aria-label="Over capacity" />
    </div>
  ),
};

/** `height` for a bar that should carry more weight. */
export const Tall: Story = {
  args: {
    value: 40,
    max: 60,
    height: 10,
    tone: 'success',
    'aria-label': 'Storage used',
  },
};
