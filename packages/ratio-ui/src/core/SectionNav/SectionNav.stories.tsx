// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { SectionNav } from './SectionNav';
import { Navbar } from '../Navbar';
import { Button } from '../Button';
import { Card } from '../Card';
import { Heading } from '../Heading';
import { AsideLayout } from '../../layout/AsideLayout';

const meta: Meta<typeof SectionNav> = {
  title: 'Core/SectionNav',
  component: SectionNav,
  tags: ['autodocs'],
  parameters: {
    noPadding: true,
  },
};
export default meta;
type Story = StoryObj<typeof SectionNav>;

// A lecture series on how knowledge travelled — the detail page the
// component was made for: site navbar, section strip, content with a
// sticky companion card.
const evenings = [
  {
    id: 'programme',
    title: 'Programme',
    body: [
      'Four evenings, one question: how did knowledge get from one mind to many?',
      'I — Alexandria. The Library copied every scroll that entered the harbour; scale came from copying, not from originals. II — Baghdad. The House of Wisdom turned Greek, Persian and Indian texts into Arabic, and with them the numerals we still use. III — Mainz. Movable type made a text identical in a thousand places at once; errors, too, became reproducible. IV — The web. Hypertext made the reference itself the medium — a citation you can follow in one click.',
    ],
  },
  {
    id: 'readings',
    title: 'Readings',
    body: [
      'Lionel Casson, Libraries in the Ancient World (2001) — short and exact on what a scroll collection actually was.',
      'Elizabeth Eisenstein, The Printing Press as an Agent of Change (1979) — the argument that print changed how people thought, not just how fast they read.',
      'Tim Berners-Lee, Weaving the Web (1999) — the web as a proposal, written by its author.',
    ],
  },
  {
    id: 'venue',
    title: 'Venue',
    body: [
      'The reading room, first floor. Doors at 18:00, lecture at 18:30, questions until 20:00.',
      'Step-free access from the courtyard; a hearing loop covers the front six rows.',
    ],
  },
  {
    id: 'practical',
    title: 'Practical',
    body: [
      'Each evening stands alone; the readings are suggestions, not homework. Notes are published the morning after, under an open licence.',
    ],
  },
];

const items = [
  ...evenings.map(({ id, title }) => ({ id, title })),
  // The registration card sits in the sticky aside — a link, not a section.
  { id: 'register', title: 'Register', track: false },
];

/**
 * The full detail page: `Navbar sticky` as row one, `SectionNav` pinned
 * right under it with `top` in the same unit the navbar is sized in, and
 * `--scroll-margin-top` set once on the page so anchor jumps land below
 * both rows (every element with an id picks it up from `global.css`). The
 * current section is highlighted as you scroll; "Register" points into
 * the sticky aside and stays out of the spy (`track: false`).
 */
export const DetailPage: Story = {
  render: () => (
    <div style={{ '--scroll-margin-top': 'calc(var(--spacing) * 34)' } as React.CSSProperties}>
      <Navbar sticky className="flex h-16 items-center" aria-label="Site">
        <Navbar.Brand>
          <span className="font-serif text-lg font-bold tracking-tight">Lecture series</span>
        </Navbar.Brand>
        <Navbar.Spacer />
        <Navbar.Links>
          <Navbar.Link href="#" isCurrent>
            Series
          </Navbar.Link>
          <Navbar.Link href="#">Archive</Navbar.Link>
        </Navbar.Links>
      </Navbar>
      <SectionNav aria-label="Contents" top="calc(var(--spacing) * 16)" items={items} />
      <div className="container mx-auto px-3 py-8">
        <AsideLayout>
          <AsideLayout.Main>
            <Heading.Group>
              <Heading.Eyebrow>Autumn series</Heading.Eyebrow>
              <Heading as="h1">How knowledge travelled</Heading>
            </Heading.Group>
            {evenings.map((section) => (
              <section key={section.id} id={section.id} className="min-h-[70vh]">
                <Heading as="h2">{section.title}</Heading>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </AsideLayout.Main>
          <AsideLayout.Aside top="calc(var(--spacing) * 34)" aria-label="Registration">
            <div id="register">
              <Card padding="md">
                <Heading as="h2" size="sm">
                  Register
                </Heading>
                <p className="text-sm">
                  Free; seats are limited to the room. One ticket covers all four evenings.
                </p>
                <Button variant="primary">Reserve a seat</Button>
              </Card>
            </div>
          </AsideLayout.Aside>
        </AsideLayout>
      </div>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav = within(canvasElement.querySelector('nav[aria-label="Contents"]') as HTMLElement);
    const link = (name: string) => nav.getByRole('link', { name });
    // What following `#id` does — scroll the target into view honouring its
    // `scroll-margin-top` — without the hash navigation, which would reload
    // the test runner's iframe.
    const jumpTo = (id: string) => canvasElement.querySelector(`#${id}`)!.scrollIntoView();

    // Following a section link makes that section current — the row measured
    // its own bottom edge, so the heading landing under it counts as reached.
    jumpTo('venue');
    await waitFor(() => expect(link('Venue')).toHaveAttribute('aria-current', 'location'));
    expect(link('Programme')).not.toHaveAttribute('aria-current');

    // The registration card is a link only: it never takes the highlight,
    // even though the sticky aside keeps it on the line.
    jumpTo('register');
    await waitFor(() => expect(link('Register')).not.toHaveAttribute('aria-current'));
    expect(link('Venue')).toHaveAttribute('aria-current', 'location');

    // Back to the top: the first section is current before any has scrolled past.
    window.scrollTo({ top: 0 });
    await waitFor(() => expect(link('Programme')).toHaveAttribute('aria-current', 'location'));
  },
};

/**
 * On its own, without a navbar: `top={0}` (the default) pins the strip to
 * the viewport edge. Set `sticky={false}` for a row that scrolls with the
 * page, and `fluid` for a full-width row in an app shell.
 */
export const Standalone: Story = {
  args: {
    'aria-label': 'Contents',
    items: evenings.map(({ id, title }) => ({ id, title })),
  },
  render: (args) => (
    <div style={{ '--scroll-margin-top': 'calc(var(--spacing) * 14)' } as React.CSSProperties}>
      <SectionNav {...args} />
      <div className="container mx-auto px-3">
        {evenings.map((section) => (
          <section key={section.id} id={section.id} className="min-h-[70vh]">
            <Heading as="h2">{section.title}</Heading>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  ),
};
