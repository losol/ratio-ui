// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Setting } from './Setting';
import { Counter } from '../Counter';
import { Knob } from '../Knob';
import { Select } from '../Select';
import { Switch } from '../Switch';
import { ToggleButtonGroup } from '../../core/ToggleButtonGroup';

const meta: Meta<typeof Setting> = {
  title: 'Forms/Setting',
  component: Setting,
  tags: ['autodocs'],
  argTypes: {
    inline: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Setting>;

/**
 * A setting's name over its control. The `Counter` has no `aria-label`: the
 * setting names it, and the description describes it.
 */
export const Default: Story = {
  render: function DefaultStory() {
    const [bpm, setBpm] = useState(120);
    return (
      <Setting label="Tempo" description="Beats per minute">
        <Counter value={bpm} onChange={setBpm} minValue={40} maxValue={240} step={4} formatValue={(v) => `${v} bpm`} />
      </Setting>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const counter = canvas.getByRole('group', { name: 'Tempo' });
    await expect(counter).toHaveAccessibleDescription('Beats per minute');
  },
};

/**
 * A row of settings, as on an instrument's page: the names line up over
 * their controls, whatever the control. Wrap the row in `flex-wrap` and the
 * settings fold onto the next line on a phone.
 */
export const ARow: Story = {
  name: 'A row',
  render: function RowStory() {
    const [bpm, setBpm] = useState(120);
    const [meter, setMeter] = useState('4/4');
    const [bars, setBars] = useState('2');
    const [scale, setScale] = useState('pentatonic');
    return (
      <div className="flex flex-wrap items-end gap-4">
        <Setting label="Tempo">
          <Counter value={bpm} onChange={setBpm} minValue={40} maxValue={240} step={4} formatValue={(v) => `${v} bpm`} />
        </Setting>
        <Setting label="Meter">
          <ToggleButtonGroup
            options={['3/4', '4/4', '5/4'].map((m) => ({ value: m, label: m }))}
            selectedKeys={[meter]}
            onSelectionChange={(keys) => setMeter(String([...keys][0]))}
            disallowEmptySelection
          />
        </Setting>
        <Setting label="Bars">
          <ToggleButtonGroup
            options={['1', '2', '4'].map((n) => ({ value: n, label: n }))}
            selectedKeys={[bars]}
            onSelectionChange={(keys) => setBars(String([...keys][0]))}
            disallowEmptySelection
          />
        </Setting>
        <Setting label="Scale">
          <Select
            className="w-40"
            selectedKey={scale}
            onSelectionChange={(v) => v && setScale(v)}
            options={[
              { value: 'pentatonic', label: 'Pentatonic' },
              { value: 'major', label: 'Major' },
              { value: 'minor', label: 'Minor' },
            ]}
          />
        </Setting>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', { name: 'Meter' })).toBeInTheDocument();
    await expect(canvas.getByRole('radiogroup', { name: 'Bars' })).toBeInTheDocument();
  },
};

/** `inline`: the name beside the control, for a switch or a short select. */
export const Inline: Story = {
  render: function InlineStory() {
    const [on, setOn] = useState(true);
    return (
      <div className="flex max-w-sm flex-col gap-4">
        <Setting inline label="Sound" description="Play the notes as you press them.">
          <Switch isSelected={on} onChange={setOn} />
        </Setting>
        <Setting inline label="Follow the playhead">
          <Switch defaultSelected />
        </Setting>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch', { name: 'Sound' })).toBeChecked();
  },
};

/**
 * A caption over several controls that name themselves: a row of knobs,
 * each with its own label. The setting adds nothing to them, only the name
 * over the row.
 */
export const OverARow: Story = {
  name: 'Over a row of knobs',
  render: () => (
    <Setting label="Filter">
      <div className="flex gap-4">
        <Knob label="Cutoff" defaultValue={800} minValue={20} maxValue={20000} scale="log" />
        <Knob label="Resonance" defaultValue={30} />
        <Knob label="Drive" defaultValue={10} />
      </div>
    </Setting>
  ),
};
