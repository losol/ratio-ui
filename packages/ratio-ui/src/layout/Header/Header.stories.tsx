// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Header } from './Header';
import { Heading } from '../../core/Heading';
import { Text } from '../../core/Text';
import { Button } from '../../core/Button';
import { Badge } from '../../core/Badge';
import { Link } from '../../core/Link';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    as: { control: 'inline-radio', options: ['header', 'div'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'baseline'] },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

/**
 * The top of a page: a `Heading.Group` with the title and a line about the
 * page, and the page's primary action in `Header.Actions`. The header owns
 * the row; what goes in it is plain composition — `Heading`, `Text`,
 * `Button` — so it holds whatever the page needs.
 */
export const Default: Story = {
  render: (args) => (
    <Header {...args}>
      <Heading.Group>
        <Heading as="h1" size="lg">
          Events
        </Heading>
        <Text variant="muted" size="sm">
          12 events this season · 3 open for registration
        </Text>
      </Heading.Group>
      <Header.Actions>
        <Button variant="primary">New event</Button>
      </Header.Actions>
    </Header>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvasElement.querySelector('header');
    const button = canvas.getByRole('button', { name: 'New event' });
    await expect(header).toContainElement(canvas.getByRole('heading', { level: 1, name: 'Events' }));
    await expect(header).toContainElement(button);
    // The actions sit beside the heading block, never inside the <hgroup>.
    await expect(canvasElement.querySelector('hgroup')).not.toContainElement(button);
  },
};

/** An eyebrow names the area the page belongs to; the actions take as many buttons as the page has. */
export const WithEyebrow: Story = {
  render: (args) => (
    <Header {...args}>
      <Heading.Group>
        <Heading.Eyebrow>Administration</Heading.Eyebrow>
        <Heading as="h1" size="lg">
          Registrations
        </Heading>
        <Text variant="muted" size="sm">
          Everyone signed up for the autumn programme.
        </Text>
      </Heading.Group>
      <Header.Actions>
        <Button variant="secondary">Export</Button>
        <Button variant="primary">Add registration</Button>
      </Header.Actions>
    </Header>
  ),
};

/**
 * The trailing edge holds what the reader should see as well as what they
 * can do: here, the page's status. `align="center"` sets it in the middle
 * of the heading block rather than beside its first line.
 */
export const WithStatus: Story = {
  args: { align: 'center' },
  render: (args) => (
    <Header {...args}>
      <Heading.Group>
        <Text variant="subtle" size="sm">
          The Great Library · est. c. 285 BCE
        </Text>
        <Heading as="h1" size="lg">
          Archive dashboard
        </Heading>
      </Heading.Group>
      <Header.Actions>
        <Badge status="success" variant="soft">
          Catalogue in sync
        </Badge>
      </Header.Actions>
    </Header>
  ),
};

/**
 * What a props API would not hold: a status beside the title and a date
 * on the line under it. The heading block is yours to compose; the header
 * only lays it out next to the actions.
 */
export const ComposedFreely: Story = {
  render: (args) => (
    <Header {...args}>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Heading as="h1" size="lg">
            Knowledge-sharing summit
          </Heading>
          <Badge status="success" variant="subtle">
            Open for registration
          </Badge>
        </div>
        <Text variant="muted" size="sm" marginTop="xs">
          14–16 September 2026 · Conference centre, Oslo
        </Text>
      </div>
      <Header.Actions>
        <Button variant="secondary">Edit</Button>
        <Button variant="primary">Register</Button>
      </Header.Actions>
    </Header>
  ),
};

/**
 * A section's header inside the page: `as="h2"` at the `md` scale, and a
 * link to the rest in place of a button. The same row at every level.
 */
export const SectionHeader: Story = {
  render: (args) => (
    <section>
      <Header {...args} align="baseline">
        <Heading as="h2" size="md">
          Recent activity
        </Heading>
        <Header.Actions>
          <Link href="#">See all</Link>
        </Header.Actions>
      </Header>
    </section>
  ),
};

/** Without actions the heading block takes the whole row. */
export const WithoutActions: Story = {
  render: (args) => (
    <Header {...args}>
      <Heading.Group>
        <Heading.Eyebrow>Help</Heading.Eyebrow>
        <Heading as="h1" size="lg">
          Getting started
        </Heading>
      </Heading.Group>
    </Header>
  ),
};

/**
 * On a phone: the heading block keeps at least 16rem before the actions
 * drop under it, so a long title wraps on its own line instead of being
 * squeezed beside a button. Set `--header-lead-min` to move the break.
 */
export const Narrow: Story = {
  decorators: [
    (StoryFn) => (
      <div style={{ maxWidth: '20rem' }}>
        <StoryFn />
      </div>
    ),
  ],
  render: (args) => (
    <Header {...args}>
      <Heading.Group>
        <Heading as="h1" size="lg">
          Events with a rather long title that wraps
        </Heading>
        <Text variant="muted" size="sm">
          12 events this season
        </Text>
      </Heading.Group>
      <Header.Actions>
        <Button variant="primary">New event</Button>
      </Header.Actions>
    </Header>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lead = canvasElement.querySelector('hgroup')!.getBoundingClientRect();
    const button = canvas.getByRole('button', { name: 'New event' }).getBoundingClientRect();
    await expect(button.top).toBeGreaterThanOrEqual(lead.bottom);
  },
};
