// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';

const meta = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible select dropdown built on React Aria. Keyboard navigation, focus management, and RAC-aligned selection props (`selectedKey` / `defaultSelectedKey` / `onSelectionChange`).',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    isDisabled: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    onSelectionChange: { action: 'selectionChanged' },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Demo data teaches something: the branches of philosophy, and the thinkers
// behind them — not filler.
const disciplines = [
  { value: 'logic', label: 'Logic' },
  { value: 'ethics', label: 'Ethics' },
  { value: 'metaphysics', label: 'Metaphysics' },
  { value: 'epistemology', label: 'Epistemology' },
  { value: 'aesthetics', label: 'Aesthetics' },
];

const philosophers = [
  { value: 'socrates', label: 'Socrates' },
  { value: 'plato', label: 'Plato' },
  { value: 'aristotle', label: 'Aristotle' },
  { value: 'descartes', label: 'Descartes' },
  { value: 'spinoza', label: 'Spinoza' },
  { value: 'hume', label: 'Hume' },
  { value: 'kant', label: 'Kant' },
  { value: 'hegel', label: 'Hegel' },
  { value: 'nietzsche', label: 'Nietzsche' },
  { value: 'arendt', label: 'Arendt' },
  { value: 'wittgenstein', label: 'Wittgenstein' },
];

/** Basic usage — click to open, pick an option, verify it shows. */
export const Basic: Story = {
  args: {
    label: 'Branch of philosophy',
    placeholder: 'Choose a branch…',
    options: disciplines,
    testId: 'discipline-select',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('discipline-select');
    await expect(trigger).toHaveTextContent('Choose a branch…');

    await userEvent.click(trigger);
    const option = within(document.body).getByRole('option', { name: 'Ethics' });
    await userEvent.click(option);

    await expect(trigger).toHaveTextContent('Ethics');
  },
};

/** The three sizes: `sm` · `md` (default) · `lg` — same scale as Button. */
export const Sizes: Story = {
  args: { options: disciplines },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Select key={s} label={s} size={s} options={disciplines} defaultSelectedKey="logic" />
      ))}
    </div>
  ),
};

/** Without a visible label — pass `aria-label` instead. */
export const WithoutLabel: Story = {
  args: {
    'aria-label': 'Branch of philosophy',
    placeholder: 'Choose a branch…',
    options: disciplines,
  },
};

/** Pre-selected via `defaultSelectedKey` (uncontrolled). */
export const DefaultSelected: Story = {
  args: {
    label: 'Branch of philosophy',
    options: disciplines,
    defaultSelectedKey: 'metaphysics',
  },
};

/** Disabled control. */
export const Disabled: Story = {
  args: {
    label: 'Branch of philosophy',
    placeholder: 'Unavailable…',
    options: disciplines,
    isDisabled: true,
  },
};

/** Individual options can be disabled — e.g. not offered this term. */
export const DisabledOptions: Story = {
  args: {
    label: 'Seminar',
    placeholder: 'Choose…',
    options: [
      { value: 'logic', label: 'Logic' },
      { value: 'ethics', label: 'Ethics (full)', disabled: true },
      { value: 'metaphysics', label: 'Metaphysics' },
      { value: 'aesthetics', label: 'Aesthetics (full)', disabled: true },
    ],
  },
};

/** Invalid state — red border + `aria-invalid`. */
export const Invalid: Story = {
  args: {
    label: 'Branch of philosophy',
    placeholder: 'Selection required…',
    options: disciplines,
    isInvalid: true,
  },
};

/** A longer list scrolls within the popover. */
export const LongList: Story = {
  args: {
    label: 'Favourite thinker',
    placeholder: 'Choose a philosopher…',
    options: philosophers,
  },
};

/**
 * Controlled via `selectedKey` + `onSelectionChange`. The play test picks an
 * option and asserts the mirrored state updates — locking in that
 * `onSelectionChange` actually fires (it didn't before the refresh).
 */
const ControlledExample = () => {
  const [field, setField] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Select
        label="Primary field"
        placeholder="Choose…"
        options={disciplines}
        selectedKey={field}
        onSelectionChange={setField}
        testId="controlled-select"
      />
      <p data-testid="selected-field" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Selected: {field ?? 'none'}
      </p>
    </div>
  );
};

export const Controlled: Story = {
  args: { options: disciplines },
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('selected-field')).toHaveTextContent('Selected: none');

    await userEvent.click(canvas.getByTestId('controlled-select'));
    const option = within(document.body).getByRole('option', { name: 'Epistemology' });
    await userEvent.click(option);

    await expect(canvas.getByTestId('selected-field')).toHaveTextContent('Selected: epistemology');
  },
};
