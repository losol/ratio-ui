// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Flowchart } from './Flowchart';
import { Card } from '../Card';
import { Heading } from '../Heading';
import { BrandMark } from '../BrandMark';

const meta: Meta<typeof Flowchart> = {
  title: 'Core/Flowchart',
  component: Flowchart,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 4 } },
    connector: { control: 'select', options: ['elbow', 'straight'] },
  },
};

export default meta;
type Story = StoryObj<typeof Flowchart>;

const lines = (el: HTMLElement) => el.querySelectorAll('.patchbay-cable-line').length;

/**
 * A decision: a question across the top, its answers under it, and where
 * each leads. `from` on a box draws the line into it; `span` and `align`
 * place it on the grid. `aria-label` carries the chart in words.
 */
export const Decision: Story = {
  args: {
    'aria-label': 'Is the form signed? If yes, it is filed. If no, it is returned.',
    columns: 2,
  },
  render: (args) => (
    <Flowchart {...args} className="max-w-md">
      <Flowchart.Node id="q" span={2}>Is the form signed?</Flowchart.Node>
      <Flowchart.Node id="yes" from="q">Yes</Flowchart.Node>
      <Flowchart.Node id="no" from="q">No</Flowchart.Node>
      <Flowchart.Node id="filed" from="yes" align="center">Filed</Flowchart.Node>
      <Flowchart.Node id="back" from="no" align="center">Returned</Flowchart.Node>
    </Flowchart>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: /Is the form signed/ })).toBeInTheDocument();
    // Four `from`s, four lines, once the board has measured its boxes.
    await waitFor(() => expect(lines(canvasElement)).toBe(4));
    await expect(canvasElement.querySelector('.patchbay-cable-line')?.getAttribute('d')).toMatch(/V.*H.*V/);
  },
};

/**
 * Two answers that lead to the same place: `from` takes a list, and the
 * lines meet above the box.
 */
export const SameOutcome: Story = {
  render: () => (
    <Flowchart aria-label="Have you sent the form? Yes or no, it is declined." className="max-w-md">
      <Flowchart.Node id="q" span={2}>Have you sent the form?</Flowchart.Node>
      <Flowchart.Node id="yes" from="q">Yes</Flowchart.Node>
      <Flowchart.Node id="no" from="q">No</Flowchart.Node>
      <Flowchart.Node id="out" from={['yes', 'no']} span={2} align="center">Declined</Flowchart.Node>
    </Flowchart>
  ),
};

/** `connector="straight"`: one line from box to box, no corners. */
export const Straight: Story = {
  render: () => (
    <Flowchart connector="straight" aria-label="Is the form signed? If yes, it is filed. If no, it is returned." className="max-w-md">
      <Flowchart.Node id="q" span={2}>Is the form signed?</Flowchart.Node>
      <Flowchart.Node id="yes" from="q">Yes</Flowchart.Node>
      <Flowchart.Node id="no" from="q">No</Flowchart.Node>
      <Flowchart.Node id="filed" from="yes" align="center">Filed</Flowchart.Node>
      <Flowchart.Node id="back" from="no" align="center">Returned</Flowchart.Node>
    </Flowchart>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(lines(canvasElement)).toBe(4));
    await expect(canvasElement.querySelector('.patchbay-cable-line')?.getAttribute('d')).toMatch(/^M[^VH]*L[^VH]*$/);
  },
};

/** Three columns, and a box that follows several. */
export const ThreeColumns: Story = {
  render: () => (
    <Flowchart columns={3} aria-label="A request is small, medium or large; all three are reviewed." className="max-w-lg">
      <Flowchart.Node id="req" span={3} align="center" className="w-56">A request comes in</Flowchart.Node>
      <Flowchart.Node id="s" from="req">Small</Flowchart.Node>
      <Flowchart.Node id="m" from="req">Medium</Flowchart.Node>
      <Flowchart.Node id="l" from="req">Large</Flowchart.Node>
      <Flowchart.Node id="rev" from={['s', 'm', 'l']} span={3} align="center" className="w-56">Reviewed</Flowchart.Node>
    </Flowchart>
  ),
};

/**
 * On a sheet: the chart inside a framed `Card` with its corners, as a notice
 * explains a rule. Opens in Tabula, where the boxes and lines take the
 * theme's thick frame and condensed face.
 */
export const OnASheet: Story = {
  parameters: { theme: 'tabula' },
  render: () => (
    <Card featured padding="lg" gap="md" className="max-w-xl">
      <Card.Meta>
        <span>Case handling</span>
        <span>Front desk</span>
      </Card.Meta>
      <Heading as="h2" size="md" className="text-center text-(--primary)">We keep it simple.</Heading>
      <Flowchart aria-label="Have you sent the form? Yes or no, it is declined." className="px-6">
        <Flowchart.Node id="q" span={2} className="uppercase">Have you sent the form?</Flowchart.Node>
        <Flowchart.Node id="yes" from="q" className="uppercase">Yes</Flowchart.Node>
        <Flowchart.Node id="no" from="q" className="uppercase">No</Flowchart.Node>
        <Flowchart.Node id="out" from={['yes', 'no']} span={2} align="center" className="w-40">Declined</Flowchart.Node>
      </Flowchart>
      <Card.Footer>
        <BrandMark>
          <BrandMark.Logo>
            <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden className="text-(--primary)">
              <rect x="3" y="3" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M10 12h16M10 18h16M10 24h10" stroke="currentColor" strokeWidth="3" />
            </svg>
          </BrandMark.Logo>
          <BrandMark.Name>Nordlys</BrandMark.Name>
          <BrandMark.Subtitle>Evening school</BrandMark.Subtitle>
        </BrandMark>
        <strong className="text-right text-(--primary)">The front desk</strong>
      </Card.Footer>
    </Card>
  ),
};
