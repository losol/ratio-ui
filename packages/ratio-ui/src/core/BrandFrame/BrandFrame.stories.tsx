// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from '../../forms/Switch';
import { BrandFrame } from './BrandFrame';

const meta = {
  title: 'Core/BrandFrame',
  component: BrandFrame,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BrandFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const Page = () => (
  <BrandFrame variant="page" className="bg-surface">
    <div className="flex flex-col gap-5 p-6">
      <h2 className="m-0 text-2xl">Good morning</h2>
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <BrandFrame variant="panel" className="bg-card p-6">
          <h3 className="m-0 text-lg text-(--primary)">The day's notice</h3>
          <p className="mb-0">The panel that should stand out gets the frame.</p>
        </BrandFrame>
        <div className="border-2 border-(--text) bg-card p-5">An ordinary panel keeps its edge.</div>
      </div>
      <BrandFrame variant="notice" className="bg-card px-5 py-4">
        A notice gets a thin frame.
      </BrandFrame>
    </div>
  </BrandFrame>
);

/**
 * The frame on: `data-brand-frame="on"` on an ancestor — usually `<html>`,
 * here a wrapper. `page` frames the whole page, `panel` what should stand
 * out, `notice` a banner. In dark mode the page frame steps back into the
 * surface; flip the theme to see it.
 */
export const On: Story = {
  render: () => (
    <div data-brand-frame="on">
      <Page />
    </div>
  ),
};

/**
 * The same markup with the frame off: the page frame is gone and the panel
 * and notice keep the theme's ordinary edge (in Bureau, the ink and the hard
 * shadow).
 */
export const Off: Story = {
  render: () => <Page />,
};

/**
 * The frame as a reader's setting: one attribute, flipped. Store the choice
 * as you store the colour scheme and set it on `<html>` before first paint.
 */
export const AsASetting: Story = {
  render: function Render() {
    const [on, setOn] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <Switch isSelected={on} onChange={setOn}>
          Brand frame
        </Switch>
        <div data-brand-frame={on ? 'on' : 'off'} data-testid="scope">
          <Page />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scope = canvas.getByTestId('scope');
    await expect(scope).toHaveAttribute('data-brand-frame', 'on');
    await userEvent.click(canvas.getByRole('switch'));
    await expect(scope).toHaveAttribute('data-brand-frame', 'off');
  },
};
