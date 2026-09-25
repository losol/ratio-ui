// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Navbar } from '../Navbar';
import { SkipLink } from './SkipLink';

const meta: Meta<typeof SkipLink> = {
  component: SkipLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Lets keyboard and screen reader users jump past repeated navigation (WCAG 2.4.1). ' +
          'Hidden until focused: click into the canvas and press Tab to see it.',
      },
    },
  },
  args: {
    href: '#main',
    children: 'Skip to main content',
  },
  argTypes: {
    href: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof SkipLink>;

const navLinks = ['Dashboard', 'Events', 'Courses', 'Members', 'Reports', 'Settings'];

const PageWithNavbar = (args: ComponentProps<typeof SkipLink>) => (
  <div className="min-h-[24rem]">
    <SkipLink {...args} />
    <Navbar>
      <Navbar.Brand>
        <a href="#top" className="font-serif text-lg font-bold no-underline">
          Alexandria
        </a>
      </Navbar.Brand>
      <Navbar.Links>
        {navLinks.map((label) => (
          <Navbar.Link key={label} href={`#${label.toLowerCase()}`}>
            {label}
          </Navbar.Link>
        ))}
      </Navbar.Links>
    </Navbar>
    <main id="main" className="p-8">
      <h1 className="text-2xl font-bold">Main content</h1>
      <p className="mt-2 text-(--text-muted)">
        After the skip link, the next Tab lands on the link below, not in the navbar.
      </p>
      <a href="#first" className="mt-4 inline-block">
        First link in the main content
      </a>
    </main>
  </div>
);

export const Playground: Story = {
  render: (args) => <PageWithNavbar {...args} />,
};

/** Localized text, as you would use on a Norwegian site. */
export const Localized: Story = {
  args: { href: '#innhold', children: 'Hopp til hovedinnhold' },
  render: (args) => (
    <div className="min-h-[12rem]">
      <SkipLink {...args} />
      <main id="innhold" className="p-8">
        Hovedinnhold
      </main>
    </div>
  ),
};

/** Tab reveals the link; activating it moves focus into the main content. */
export const KeyboardFlow: Story = {
  render: (args) => <PageWithNavbar {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skipLink = canvas.getByRole('link', { name: 'Skip to main content' });

    // Storybook's own chrome may come first in the tab order.
    for (let i = 0; i < 5 && document.activeElement !== skipLink; i++) {
      await userEvent.tab();
    }
    await expect(skipLink).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(canvasElement.querySelector('#main')).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'First link in the main content' })).toHaveFocus();
  },
};
