// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Card } from '../../core/Card';
import { Knob } from './Knob';

const meta = {
  title: 'Forms/Knob',
  component: Knob,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    scale: { control: 'select', options: ['linear', 'log'] },
  },
} satisfies Meta<typeof Knob>;

export default meta;
type Story = StoryObj<typeof meta>;

const ms = (v: number) => `${Math.round(v)} ms`;
const percent = (v: number) => `${Math.round(v)} %`;
const hz = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kHz` : `${Math.round(v)} Hz`);

/**
 * Uncontrolled, linear, 0–100. Drag it up or down, or focus it and use the
 * arrow keys. A double-click returns it to `defaultValue`.
 */
export const Default: Story = {
  args: { label: 'Volume', defaultValue: 70, formatValue: percent },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const knob = canvas.getByRole('slider', { name: 'Volume' });
    expect(knob).toHaveAttribute('aria-valuenow', '70');
    expect(knob).toHaveAttribute('aria-valuetext', '70 %');

    knob.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(knob).toHaveAttribute('aria-valuenow', '72');
    await userEvent.keyboard('{End}');
    expect(knob).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{PageDown}');
    expect(knob).toHaveAttribute('aria-valuenow', '90');
    await userEvent.dblClick(knob);
    expect(knob).toHaveAttribute('aria-valuenow', '70');
  },
};

/**
 * `scale="log"` for a quantity felt in ratios. The turn from 80 Hz to 12 kHz
 * spends as long on each octave, so the low end is not crammed into the
 * first few degrees.
 */
export const Logarithmic: Story = {
  args: {
    label: 'Cutoff',
    scale: 'log',
    minValue: 80,
    maxValue: 12000,
    defaultValue: 5000,
    formatValue: hz,
  },
};

/** `step` snaps the value and sets how far one arrow key moves. */
export const Stepped: Story = {
  args: { label: 'Octave', minValue: -2, maxValue: 2, step: 1, defaultValue: 0 },
};

export const Sizes: Story = {
  args: { label: 'Volume', defaultValue: 70, formatValue: percent },
  render: (args) => (
    <div className="flex items-end gap-6">
      <Knob {...args} size="sm" />
      <Knob {...args} size="md" />
      <Knob {...args} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: 'Echo', defaultValue: 30, formatValue: percent, isDisabled: true },
};

/**
 * A voice panel: five parameters, each a knob, in a card. Controlled, so
 * the parent can send the values to an audio engine as they change.
 */
export const VoicePanel: Story = {
  args: { label: 'Attack' },
  render: function VoicePanelStory() {
    const [voice, setVoice] = useState({ attack: 10, release: 300, cutoff: 5000, echo: 0, volume: 70 });
    const set = (key: keyof typeof voice) => (value: number) => setVoice((v) => ({ ...v, [key]: value }));
    return (
      <Card className="flex flex-wrap justify-around gap-4">
        <Knob label="Attack" scale="log" minValue={1} maxValue={1500} defaultValue={10} value={voice.attack} onChange={set('attack')} formatValue={ms} />
        <Knob label="Release" scale="log" minValue={20} maxValue={3000} defaultValue={300} value={voice.release} onChange={set('release')} formatValue={ms} />
        <Knob label="Cutoff" scale="log" minValue={80} maxValue={12000} defaultValue={5000} value={voice.cutoff} onChange={set('cutoff')} formatValue={hz} />
        <Knob label="Echo" defaultValue={0} value={voice.echo} onChange={set('echo')} formatValue={percent} />
        <Knob label="Volume" defaultValue={70} value={voice.volume} onChange={set('volume')} formatValue={percent} />
      </Card>
    );
  },
};

/**
 * On a dark instrument panel. The panel is a `surface-dark` scope, and it
 * overrides the knob tokens so the arc and pointer take the accent colour
 * and the face sinks into the panel — no component variant needed.
 */
export const OnADarkRack: Story = {
  args: { label: 'Cutoff' },
  render: () => (
    <div
      className="surface-dark flex flex-wrap gap-4 rounded-xl bg-primary-900 p-4 text-(--text)"
      style={
        {
          '--knob-fill': 'var(--accent)',
          '--knob-pointer': 'var(--accent)',
          '--knob-track': 'var(--color-primary-700)',
          '--knob-face': 'var(--color-primary-950)',
        } as React.CSSProperties
      }
    >
      <Knob size="sm" label="Cutoff" scale="log" minValue={80} maxValue={12000} defaultValue={1800} formatValue={hz} />
      <Knob size="sm" label="Resonance" scale="log" minValue={0.5} maxValue={20} defaultValue={4} formatValue={(v) => v.toFixed(1)} />
      <Knob size="sm" label="Attack" scale="log" minValue={1} maxValue={1500} defaultValue={10} formatValue={ms} />
      <Knob size="sm" label="Release" scale="log" minValue={20} maxValue={3000} defaultValue={400} formatValue={ms} />
    </div>
  ),
};
