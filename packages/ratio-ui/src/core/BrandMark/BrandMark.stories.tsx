// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BrandMark } from './BrandMark';

const meta = {
  title: 'Core/BrandMark',
  component: BrandMark,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof BrandMark>;

export default meta;
type Story = StoryObj<typeof meta>;

// A stand-in logo, drawn inline so the story needs no asset.
const Logo = () => (
  <svg viewBox="0 0 48 56" role="img" aria-label="Fjordby">
    <path d="M2 2h44v26c0 14-10 22-22 26C12 50 2 42 2 28Z" fill="var(--primary)" />
    <path d="M10 34l8-10 6 7 5-5 9 8" fill="none" stroke="var(--text-on-primary)" strokeWidth="3" />
  </svg>
);

// The same logo as an image file, for the `src` form.
const LOGO_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56"><path d="M2 2h44v26c0 14-10 22-22 26C12 50 2 42 2 28Z" fill="#006a7d"/></svg>',
  );

/**
 * The navbar mark: a logo beside a name and the line under it. Pass
 * `as="a"` and `href` to make it the link home.
 */
export const Row: Story = {
  render: () => (
    <BrandMark as="a" href="#" className="no-underline">
      <BrandMark.Logo>
        <Logo />
      </BrandMark.Logo>
      <BrandMark.Name>Fjordby services</BrandMark.Name>
      <BrandMark.Subtitle>Fjordby municipality</BrandMark.Subtitle>
    </BrandMark>
  ),
};

/**
 * No logo file yet: the slot shows a dashed outline of where it goes. A
 * coat of arms takes `shape="shield"`.
 */
export const Placeholder: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <BrandMark>
        <BrandMark.Logo placeholder="Logo" />
        <BrandMark.Name>Ratio</BrandMark.Name>
        <BrandMark.Subtitle>Design system</BrandMark.Subtitle>
      </BrandMark>
      <BrandMark>
        <BrandMark.Logo placeholder="Arms" shape="shield" />
        <BrandMark.Name>Fjordby services</BrandMark.Name>
        <BrandMark.Subtitle>Fjordby municipality</BrandMark.Subtitle>
      </BrandMark>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The placeholder is decoration: the name beside it says who it is.
    const placeholders = canvasElement.querySelectorAll('.ratio-brand-mark__placeholder');
    await expect(placeholders).toHaveLength(2);
    placeholders.forEach(p => expect(p).toHaveAttribute('aria-hidden', 'true'));
  },
};

/**
 * The footer mark, larger, with a tagline — on a band of brand colour, which
 * it takes its colour from.
 */
export const OnABand: Story = {
  render: () => (
    <div className="bg-(--primary) p-8 text-(--text-on-primary)">
      <BrandMark size="lg">
        <BrandMark.Logo placeholder="Arms" shape="shield" />
        <BrandMark.Name>
          FJORDBY
          <br />
          MUNICIPALITY
        </BrandMark.Name>
        <BrandMark.Tagline>Wild, steep and wet</BrandMark.Tagline>
      </BrandMark>
    </div>
  ),
};

/** `layout="stacked"`: the logo above the text, for a narrow column or a cover. */
export const Stacked: Story = {
  render: () => (
    <BrandMark layout="stacked" size="lg">
      <BrandMark.Logo src={LOGO_SRC} alt="" />
      <BrandMark.Name>Fjordby services</BrandMark.Name>
      <BrandMark.Subtitle>Fjordby municipality</BrandMark.Subtitle>
    </BrandMark>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Fjordby services')).toBeInTheDocument();
  },
};
