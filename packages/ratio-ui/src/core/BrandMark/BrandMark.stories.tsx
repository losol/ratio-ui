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

// Drawn in currentColor, so it takes the band's ink.
const BandLogo = () => (
  <svg viewBox="0 0 48 56" role="img" aria-label="Fjordby">
    <path d="M2 2h44v26c0 14-10 22-22 26C12 50 2 42 2 28Z" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M10 34l8-10 6 7 5-5 9 8" fill="none" stroke="currentColor" strokeWidth="3" />
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
 * No logo: leave `BrandMark.Logo` out and the text stands alone. There is no
 * placeholder — an empty `src` renders nothing, not a broken image.
 */
export const WithoutALogo: Story = {
  render: () => (
    <BrandMark>
      <BrandMark.Logo src="" />
      <BrandMark.Name>Ratio</BrandMark.Name>
      <BrandMark.Subtitle>Design system</BrandMark.Subtitle>
    </BrandMark>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.ratio-brand-mark__logo')).toBeNull();
    await expect(canvasElement.querySelector('img')).toBeNull();
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
        <BrandMark.Logo>
          <BandLogo />
        </BrandMark.Logo>
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
      {/* No alt: decorative, as the name beside it says who it is. */}
      <BrandMark.Logo src={LOGO_SRC} />
      <BrandMark.Name>Fjordby services</BrandMark.Name>
      <BrandMark.Subtitle>Fjordby municipality</BrandMark.Subtitle>
    </BrandMark>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Fjordby services')).toBeInTheDocument();
    // Without alt the logo is decorative: an empty alt, skipped by screen readers.
    await expect(canvasElement.querySelector('img')).toHaveAttribute('alt', '');
  },
};
