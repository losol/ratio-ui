import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Hero } from '../../blocks/Hero';
import { Button } from '../../core/Button';
import { Card } from '../../core/Card';
import { Footer } from '../../core/Footer/Footer';
import { Heading } from '../../core/Heading';
import { ValueTile } from '../../core/ValueTile';
import { List } from '../../core/List/List';
import { Navbar } from '../../core/Navbar';
import { Avatar } from '../../core/Avatar';
import { Menu } from '../../core/Menu';
import { SectionNav } from '../../core/SectionNav';
import { Container } from '../../layout/Container';
import { Section } from '../../layout/Section/Section';

const PageDemo: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar sticky>
      <Navbar.Brand>
        <a href="#/" className="text-lg tracking-tight whitespace-nowrap no-underline">
          {title}
        </a>
      </Navbar.Brand>
      <Navbar.Content className="justify-end">
        <a href="#about" className="hover:underline">About</a>
        <a href="#features" className="hover:underline">Features</a>
        <Button variant="primary">Sign in</Button>
      </Navbar.Content>
    </Navbar>

    <main className="flex-1">
      <Hero>
        <Hero.Main>
          <Hero.Eyebrow>Knowledge platform · Sentence case is the norm</Hero.Eyebrow>
          <Hero.Title>
            Find knowledge —{' '}
            <em className="font-serif text-(--primary)">considered</em>,{' '}
            <em className="font-serif text-(--accent)">measured</em>, ours.
          </Hero.Title>
          <Hero.Lead>
            A design system built on clarity, proportion, and composable components. Use it to
            build event sites, knowledge bases, and editorial surfaces that hold up under use.
          </Hero.Lead>
          <Hero.Actions>
            <Button variant="primary" size="lg">Get started</Button>
            <Button variant="outline" size="lg">Read the source</Button>
          </Hero.Actions>
        </Hero.Main>
        <Hero.Side>
          <ValueTile>
            <ValueTile.Value>
              <em className="text-(--accent)">11</em>-step scales
            </ValueTile.Value>
            <ValueTile.Caption>Linseed, Linen, Ochre — three voices, eleven stops each</ValueTile.Caption>
          </ValueTile>
          <ValueTile>
            <ValueTile.Value>
              2 <em className="text-(--accent)">families</em>
            </ValueTile.Value>
            <ValueTile.Caption>Source Serif 4 + Source Sans 3, self-hosted</ValueTile.Caption>
          </ValueTile>
          <ValueTile>
            <ValueTile.Value>
              1 <em className="text-(--accent)">surface</em>
            </ValueTile.Value>
            <ValueTile.Caption>Linen-200 by default, Linseed-950 in dark mode</ValueTile.Caption>
          </ValueTile>
        </Hero.Side>
      </Hero>

      {/* Three-up feature cards — neutral surface */}
      <Section paddingY="lg" color="neutral" id="features">
        <Container>
          <Section.Header>
            <Section.Eyebrow>The library</Section.Eyebrow>
            <Section.Title>
              What's <em className="font-serif text-(--primary)">inside</em>
            </Section.Title>
            <Section.Link href="#">Browse all components</Section.Link>
          </Section.Header>
          <p className="text-(--text-muted) max-w-[60ch] mb-10">
            Tokens, primitives, and patterns ready to compose. Every piece is documented in
            Storybook with the source you actually ship.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card padding="lg" radius="lg" shadow="none">
              <Heading as="h4" marginBottom="xs">Tokens</Heading>
              <p className="text-sm text-(--text-muted)">
                Color scales, typography, spacing, borders, status — all theme-aware via CSS
                variables.
              </p>
            </Card>
            <Card padding="lg" radius="lg" shadow="none">
              <Heading as="h4" marginBottom="xs">Primitives</Heading>
              <p className="text-sm text-(--text-muted)">
                Dialog, Drawer, Navbar, Footer — built on React Aria for keyboard and screen
                reader support.
              </p>
            </Card>
            <Card padding="lg" radius="lg" shadow="none">
              <Heading as="h4" marginBottom="xs">Patterns</Heading>
              <p className="text-sm text-(--text-muted)">
                Compound APIs (Heading, Content, Footer slots) for the shapes that show up over
                and over.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Dark surface CTA — shows the surface-token system in action */}
      <Section dark paddingY="xl" className="bg-(--color-primary-900)">
        <Container className="text-center">
          <Heading as="h2" className="!mb-3">
            Built for content that <em className="font-serif text-(--accent)">lasts</em>
          </Heading>
          <p className="max-w-[56ch] mx-auto mb-8 text-(--text-muted)">
            The system is open source, MPL-2.0 licensed. No build step required, just install and import.
          </p>
          <Button variant="primary" size="lg">View on GitHub</Button>
        </Container>
      </Section>
    </main>

    <Footer.Classic siteTitle={title}>
      <List>
        <List.Item className="mb-2"><a href="#/">Home</a></List.Item>
        <List.Item className="mb-2"><a href="#/docs">Documentation</a></List.Item>
        <List.Item className="mb-2"><a href="#/privacy">Privacy</a></List.Item>
      </List>
    </Footer.Classic>
  </div>
);

const meta = {
  title: 'Pages/Page Demo',
  component: PageDemo,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Ratio UI' },
} satisfies Meta<typeof PageDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ── A signed-in page, with one row pinned instead of two ─────────────────
// The shape most detail pages take once someone is logged in — a site bar
// carrying the account menu, a section nav under it, and enough text that
// the reader is always scrolled somewhere. Only the section nav is pinned;
// see the story's own notes for what that trades away.

const programme = [
  {
    id: 'lectures',
    title: 'Lectures',
    body: [
      'Four evenings on how a finding becomes common knowledge. Each one takes a single case and follows it from the notebook to the classroom.',
      'I — Ada Lovelace annotates Menabrea\'s paper on the Analytical Engine and, in note G, writes a method for computing Bernoulli numbers. The notes run three times longer than the paper they explain: the explanation was the contribution.',
      'II — Michael Faraday, who left school at thirteen, starts the Christmas Lectures in 1825 so that anyone could follow the science of the day. They have run almost every year since.',
    ],
  },
  {
    id: 'reading',
    title: 'Reading',
    body: [
      'Nothing is required, but two short pieces set up the argument well.',
      'Vannevar Bush, “As We May Think” (1945) — the memex, described before the machinery existed, and still the clearest case for linking as a way of thinking.',
      'Ludwik Fleck, Genesis and Development of a Scientific Fact (1935) — how a claim hardens into a fact as it passes between people.',
    ],
  },
  {
    id: 'venue',
    title: 'Venue',
    body: [
      'The reading room, first floor. Doors at 18:00, lecture at 18:30, questions until 20:00.',
      'Step-free access from the courtyard, and a hearing loop across the front six rows. Notes go out the morning after, under an open licence.',
      'The room seats ninety. Seats are held until 18:20, after which the queue at the door gets them.',
    ],
  },
  {
    id: 'practical',
    title: 'Practical',
    body: [
      'Each evening stands alone. Come to one or come to all four; the readings are suggestions, never homework.',
      'Recordings go up within the week, captioned. If you need a transcript sooner, ask at the desk and we will send the draft.',
      'Questions are the point of the last half hour. Bring the ones you think are too basic — those are usually the ones the rest of the room also has.',
    ],
  },
];

const SignedInPageDemo: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar glass aria-label="Site" className="flex h-14 items-center">
      <Navbar.Brand>
        <a href="#/" className="text-lg tracking-tight whitespace-nowrap no-underline">
          {title}
        </a>
      </Navbar.Brand>
      <Navbar.Spacer />
      <Navbar.Actions>
        <Menu>
          <Menu.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-1 bg-card py-1 pl-1 pr-2.5">
            <Avatar name="Ada Lovelace" size="sm" />
            <span className="text-sm font-semibold">Ada</span>
            <Menu.Chevron className="h-5 w-5" />
          </Menu.Trigger>
          <Menu.Header>
            <Avatar name="Ada Lovelace" size="lg" />
            <Menu.Header.Name>Ada Lovelace</Menu.Header.Name>
            <Menu.Header.Email>ada@analytical-engine.org</Menu.Header.Email>
          </Menu.Header>
          <Menu.Link href="#profile">Your profile</Menu.Link>
          <Menu.Link href="#bookings">Your seats</Menu.Link>
          <Menu.Separator />
          <Menu.Button id="logout" onClick={() => {}}>Log out</Menu.Button>
        </Menu>
      </Navbar.Actions>
    </Navbar>

    <SectionNav
      aria-label="Contents"
      glass
      size="sm"
      top={0}
      items={programme.map(({ id, title: label }) => ({ id, title: label }))}
    />

    <main className="flex-1" style={{ '--scroll-margin-top': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <Container className="py-10">
        <Heading.Group>
          <Heading.Eyebrow>Autumn series</Heading.Eyebrow>
          <Heading as="h1">How a finding becomes common knowledge</Heading>
        </Heading.Group>
        {programme.map((section) => (
          <section key={section.id} id={section.id} className="pb-16">
            <Heading as="h2">{section.title}</Heading>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </Container>
    </main>

    <Footer.Classic siteTitle={title}>
      <List>
        <List.Item className="mb-2"><a href="#/">Home</a></List.Item>
        <List.Item className="mb-2"><a href="#/programme">Programme</a></List.Item>
      </List>
    </Footer.Classic>
  </div>
);

/**
 * A signed-in page, with the chrome kept out of the reader's way.
 *
 * Two pinned rows cost 125px on a 1280×800 screen — 16% of the viewport,
 * gone for the whole visit. So only one of them is pinned here. The site
 * bar scrolls away with the page: it navigates *away* from the article, and
 * a reader wants it perhaps once. The section nav is the one that earns its
 * place, because it is wayfinding *inside* the text — pinned at the top in
 * its `sm` height, that is 44px, a third of the cost.
 *
 * The trade is that the account menu goes with the bar, so it is reachable
 * at the top of the page only. When it has to stay reachable, pin the bar
 * too (`Navbar sticky`, section nav `top` set to the bar's height) and take
 * the 125px — see `Core/Navbar → StickyGlass`.
 *
 * Both rows are `glass`, so the text passing under them stays faintly
 * visible instead of meeting a hard edge.
 */
export const SignedIn: StoryObj<typeof SignedInPageDemo> = {
  render: (args) => <SignedInPageDemo {...args} />,
  args: { title: 'Athenaeum' },
};
