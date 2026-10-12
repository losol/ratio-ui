// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Counter } from './Counter';

const meta = {
  title: 'Forms/Counter',
  component: Counter,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uncontrolled, one per press, no bounds. */
export const Default: Story = {
  args: { label: 'Seats', defaultValue: 2, minValue: 1, maxValue: 8 },
};

/**
 * `formatValue` writes the unit; `labels` name the buttons for what they do
 * here. The − button goes inactive at `minValue`.
 */
export const WithUnit: Story = {
  args: {
    label: 'Tempo',
    defaultValue: 110,
    minValue: 40,
    maxValue: 200,
    step: 10,
    formatValue: (v: number) => `${v} bpm`,
    labels: { decrement: 'Slower', increment: 'Faster' },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Tempo' });
    expect(group).toHaveTextContent('110 bpm');

    await userEvent.click(canvas.getByRole('button', { name: 'Faster' }));
    expect(group).toHaveTextContent('120 bpm');

    const slower = canvas.getByRole('button', { name: 'Slower' });
    for (let i = 0; i < 8; i++) await userEvent.click(slower);
    expect(group).toHaveTextContent('40 bpm');
    expect(slower).toBeDisabled();
  },
};

/** A signed value, controlled. Here the parent keeps the octave in its own state. */
export const Signed: Story = {
  args: { 'aria-label': 'Octave' },
  render: function SignedStory() {
    const [octave, setOctave] = useState(0);
    return (
      <Counter
        aria-label="Octave"
        value={octave}
        onChange={setOctave}
        minValue={-2}
        maxValue={2}
        formatValue={(v) => (v > 0 ? `+${v}` : String(v))}
        labels={{ decrement: 'Octave down', increment: 'Octave up' }}
      />
    );
  },
};

export const Sizes: Story = {
  args: { defaultValue: 3 },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Counter {...args} size="sm" label="Small" />
      <Counter {...args} size="md" label="Medium" />
      <Counter {...args} size="lg" label="Large" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: 'Seats', defaultValue: 2, isDisabled: true },
};
