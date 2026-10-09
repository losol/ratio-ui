// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Footer } from '../../core/Footer';
import { Navbar } from '../../core/Navbar';
import { SkipLink } from '../../core/SkipLink';
import { AppShell } from './AppShell';

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const Page = ({ text }: { text: string }) => (
  <>
    <SkipLink />
    <Navbar>
      <Navbar.Brand>
        <a href="#/" className="text-lg no-underline">
          Fjordby services
        </a>
      </Navbar.Brand>
    </Navbar>
    <AppShell.Main className="p-8">
      <h1 className="mt-0">Good morning</h1>
      <p>{text}</p>
    </AppShell.Main>
    <Footer>
      <Footer.BottomBar copyright="© 2026 Fjordby" />
    </Footer>
  </>
);

/**
 * The column a page sits in: navbar, `AppShell.Main` and footer, at least
 * the height of the window. On a short page the footer stays at the bottom.
 * `AppShell.Main` is a `<main id="main">`, what `SkipLink` jumps to.
 */
export const Default: Story = {
  render: () => (
    <AppShell>
      <Page text="A short page: the footer still sits at the bottom of the window." />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole('main');
    await expect(main).toHaveAttribute('id', 'main');
    // The shell fills the window, and the footer ends where it does.
    const shell = canvasElement.querySelector('.ratio-app-shell')!;
    const footer = canvasElement.querySelector('footer')!;
    await expect(shell.getBoundingClientRect().height).toBeGreaterThanOrEqual(window.innerHeight - 1);
    await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(
      Math.round(shell.getBoundingClientRect().bottom),
    );
  },
};

/**
 * `frame`: the whole page framed in the primary colour, like a poster —
 * 6px on a phone, 12px on a wide window. In dark mode the frame steps back
 * into the surface; flip the theme to see it.
 */
export const Frame: Story = {
  render: () => (
    <AppShell frame>
      <Page text="Framed in the primary colour." />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const shell = canvasElement.querySelector('.ratio-app-shell')!;
    await expect(parseFloat(getComputedStyle(shell).borderTopWidth)).toBeGreaterThanOrEqual(6);
  },
};

/**
 * A reader who turned the frame off: the same markup, with
 * `--app-shell-frame-width: 0` set on the page — here on the shell — from
 * the reader's setting.
 */
export const FrameTurnedOff: Story = {
  render: () => (
    <AppShell frame style={{ '--app-shell-frame-width': '0px' } as CSSProperties}>
      <Page text="The frame is turned off by a token, not by the markup." />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const shell = canvasElement.querySelector('.ratio-app-shell')!;
    await expect(getComputedStyle(shell).borderTopWidth).toBe('0px');
  },
};
