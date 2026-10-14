// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stamp } from './Stamp';
import { Card } from '../Card';
import { Heading } from '../Heading';
import { Text } from '../Text';

const meta: Meta<typeof Stamp> = {
  title: 'Core/Stamp',
  component: Stamp,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'error', 'inherit'] },
    size: { control: 'select', options: ['sm', 'md'] },
    tilt: { control: { type: 'number', min: -20, max: 20 } },
    decorative: { control: 'boolean' },
  },
  args: { children: 'Approved', tone: 'primary', size: 'sm' },
};

export default meta;
type Story = StoryObj<typeof Stamp>;

/** A word in a frame, at a slant, in the primary ink. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stamp = canvas.getByText('Approved');
    await expect(stamp).toHaveClass('ratio-stamp');
    await expect(stamp).not.toHaveAttribute('aria-hidden');
  },
};

/** The inks: the brand, the three verdicts, and the text's own colour. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Stamp tone="primary">Received</Stamp>
      <Stamp tone="success">Approved</Stamp>
      <Stamp tone="warning">On hold</Stamp>
      <Stamp tone="error">Declined</Stamp>
      <Stamp tone="inherit">Copy</Stamp>
    </div>
  ),
};

/** Two sizes, and the slant: each stamp lands a little differently, or straight with `tilt={0}`. */
export const SizesAndTilt: Story = {
  name: 'Sizes and tilt',
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Stamp size="sm">Small</Stamp>
      <Stamp size="md">Medium</Stamp>
      <Stamp size="md" tilt={5}>
        Leaning right
      </Stamp>
      <Stamp size="md" tilt={0}>
        Straight
      </Stamp>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Straight').style.getPropertyValue('--stamp-tilt')).toBe('0deg');
  },
};

/**
 * On a sheet: the stamp in the corner of a card, saying what the card's own
 * words already say, so it is `decorative` and a screen reader reads the
 * card once. Opens in Tabula, where the stamp is thicker and condensed.
 */
export const OnASheet: Story = {
  name: 'On a sheet',
  parameters: { theme: 'tabula' },
  render: () => (
    <Card featured padding="lg" gap="sm" className="relative max-w-md">
      <Stamp tone="success" size="md" decorative className="absolute top-14 right-6">
        Approved
      </Stamp>
      <Card.Meta>
        <span>Application</span>
        <span>No. 0412</span>
      </Card.Meta>
      <Heading as="h3" size="md">
        Library card
      </Heading>
      <Text>Approved on 14 October. Collect your card at the front desk.</Text>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Approved', { selector: '.ratio-stamp' })).toHaveAttribute('aria-hidden', 'true');
  },
};
