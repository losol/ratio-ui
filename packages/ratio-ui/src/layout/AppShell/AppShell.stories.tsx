// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Footer } from '../../core/Footer';
import { Navbar } from '../../core/Navbar';
import { Sidebar } from '../Sidebar';
import { AppShell } from './AppShell';

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const Header = ({ sticky = false }: { sticky?: boolean }) => (
  <AppShell.Header sticky={sticky}>
    <Navbar className="bg-card">
      <Navbar.Brand>
        <a href="#/" className="text-lg no-underline">
          Fjordby services
        </a>
      </Navbar.Brand>
    </Navbar>
  </AppShell.Header>
);

const Bottom = () => (
  <Footer>
    <Footer.BottomBar copyright="© 2026 Fjordby" />
  </Footer>
);

/**
 * The column a page sits in: `AppShell.Header`, `AppShell.Main` and the
 * footer, at least the height of the window — on a short page the footer
 * stays at the bottom. The shell wires the landmarks (`<header>`, `<main>`,
 * the footer's `<footer>`) and puts a `SkipLink` first, to `AppShell.Main`.
 */
export const Default: Story = {
  render: () => (
    <AppShell>
      <Header />
      <AppShell.Main className="p-8">
        <h1 className="mt-0">Good morning</h1>
        <p>A short page: the footer still sits at the bottom of the window.</p>
      </AppShell.Main>
      <Bottom />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The landmarks, and the skip link to main.
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
    await expect(canvas.getByRole('main')).toHaveAttribute('id', 'main');
    await expect(canvas.getByRole('contentinfo')).toBeInTheDocument();
    const skip = canvas.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toHaveAttribute('href', '#main');
    await expect(canvasElement.querySelector('.ratio-app-shell')!.firstElementChild).toBe(skip);
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
 * The skip link in the page's language (`labels`), to a `Main` with an id
 * of its own.
 */
export const SkipLinkLabelAndTarget: Story = {
  render: () => (
    <AppShell labels={{ skipLink: 'Hopp til hovedinnhold' }}>
      <Header />
      <AppShell.Main id="innhold" className="p-8">
        <h1 className="mt-0">God morgen</h1>
      </AppShell.Main>
      <Bottom />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Hopp til hovedinnhold' })).toHaveAttribute('href', '#innhold');
  },
};

/**
 * `AppShell.Header sticky`: the header stays at the top, measures itself
 * and publishes its height as `--app-shell-header-offset` and
 * `--scroll-margin-top` on the shell. Anchor jumps land below it, and a
 * `Sidebar` sticks under it with no `top` passed.
 */
export const StickyHeader: Story = {
  render: () => (
    <AppShell>
      <Header sticky />
      <div className="flex">
        <Sidebar aria-label="Sections" width={200}>
          <nav className="flex flex-col gap-2 p-4">
            <a href="#first">First</a>
            <a href="#second">Second</a>
          </nav>
        </Sidebar>
        <AppShell.Main className="p-8">
          <h2 id="first" className="mt-0">
            First
          </h2>
          <p style={{ minHeight: '120vh' }}>A long section.</p>
          <h2 id="second">Second</h2>
          <p style={{ minHeight: '120vh' }}>Another long section.</p>
        </AppShell.Main>
      </div>
      <Bottom />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const shell = canvasElement.querySelector<HTMLElement>('.ratio-app-shell')!;
    const header = canvasElement.querySelector('header')!;
    const height = header.getBoundingClientRect().height;
    await waitFor(() => expect(parseFloat(shell.style.getPropertyValue('--app-shell-header-offset'))).toBeCloseTo(height, 1));
    // Anchor targets clear it, and the sidebar sticks below it. Computed
    // lengths come back rounded, so compare as numbers.
    await expect(parseFloat(getComputedStyle(canvasElement.querySelector('#second')!).scrollMarginTop)).toBeCloseTo(height, 1);
    await expect(parseFloat(getComputedStyle(canvasElement.querySelector('aside')!).top)).toBeCloseTo(height, 1);
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
      <Header />
      <AppShell.Main className="p-8">
        <p>Framed in the primary colour.</p>
      </AppShell.Main>
      <Bottom />
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
      <Header />
      <AppShell.Main className="p-8">
        <p>The frame is turned off by a token, not by the markup.</p>
      </AppShell.Main>
      <Bottom />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const shell = canvasElement.querySelector('.ratio-app-shell')!;
    await expect(getComputedStyle(shell).borderTopWidth).toBe('0px');
  },
};
