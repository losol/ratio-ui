

import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Card } from './Card';
import { Image } from '../Image';
import { Box } from '../../layout/Box';
import { Heading } from '../Heading';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    transparent: { control: 'boolean' },
    border: { control: 'select', options: [false, true, 'default', 'strong', 'subtle', 'none'] },
    radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'xl', 'full'] },
    shadow: { control: 'select', options: ['none', 'xs', 'sm', 'md'] },
    padding: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    hoverEffect: { control: 'boolean' },
    featured: { control: 'boolean' },
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    },
    accent: {
      control: 'select',
      options: [undefined, 'neutral', 'info', 'success', 'warning', 'error'],
    },
    backgroundImageUrl: { control: 'text' },
    margin: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <Box>
        <Heading as="h3">Default Card</Heading>
        <p>This is a default card with some content.</p>
      </Box>
    ),
  },
};

/**
 * Transparent fill with an outline — replaces the old `outline` variant.
 * Compose via `transparent border`.
 */
export const Outline: Story = {
  args: {
    transparent: true,
    border: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Outline Card</Heading>
        <p>This card uses `transparent border`.</p>
      </Box>
    ),
  },
};

/**
 * Editorial tile composition — flat (no shadow), roomier padding,
 * tighter radius. Compose via `padding="lg" radius="lg" shadow="none"`.
 * Pair with a `Heading` + paragraph for feature-card grids; pair with
 * `ValueTile` for stat blocks that need a surface.
 */
export const Tile: Story = {
  args: {
    padding: 'lg',
    radius: 'lg',
    shadow: 'none',
    children: (
      <Box>
        <Heading as="h4" marginBottom="xs">Tokens</Heading>
        <p className="text-sm text-(--text-muted)">
          Color scales, typography, spacing, borders — all theme-aware via CSS variables.
        </p>
      </Box>
    ),
  },
};

/**
 * `accent` stripes the left edge in a status color. Use it to colour-code a
 * stack of cards by category or severity — the eye groups the stripes before
 * it reads a word. Only the left border changes, so the card's own fill and
 * border stay put.
 */
export const Accent: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      {([
        ['warning', 'Migration', 'Runs automatically on next startup.'],
        ['info', 'Configuration', 'New optional setting; existing installs keep the old default.'],
        ['error', 'Breaking change', 'The v1 endpoint is removed. Move to /v2 before upgrading.'],
        ['success', 'Resolved', 'The duplicate-import bug from 2.3.1 is fixed.'],
        ['neutral', 'Housekeeping', 'Dependency bumps and internal cleanup.'],
      ] as const).map(([accent, title, body]) => (
        <Card key={accent} accent={accent} padding="md" radius="lg" shadow="none">
          <Heading as="h4" marginBottom="xs">{title}</Heading>
          <p className="text-sm text-(--text-muted)">{body}</p>
        </Card>
      ))}
    </div>
  ),
};

/**
 * `accent` + `hoverEffect` — the stripe holds its color while the other three
 * sides pick up the hover border.
 */
export const AccentWithHover: Story = {
  args: {
    accent: 'warning',
    hoverEffect: true,
    padding: 'md',
    radius: 'lg',
    shadow: 'none',
    children: (
      <Box>
        <Heading as="h4" marginBottom="xs">Hover me</Heading>
        <p className="text-sm text-(--text-muted)">The left stripe stays warning-colored.</p>
      </Box>
    ),
  },
};

export const Transparent: Story = {
  args: {
    transparent: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Transparent Card</Heading>
        <p>This card has no background or border, just structure and padding.</p>
      </Box>
    ),
  },
};

/**
 * `hoverEffect` adds the canonical interactive treatment — surface
 * lifts to `--card-hover`, border picks up `--primary`, the card
 * translates 1px upward and gains a soft Linseed-tinted glow. Reserve
 * for cards that act as clickable surfaces.
 */
export const WithHoverEffect: Story = {
  args: {
    hoverEffect: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Hover me</Heading>
        <p>Surface lifts, border glows, card nudges upward.</p>
      </Box>
    ),
  },
};

/**
 * Tile composition + `hoverEffect` — the editorial hover for grid
 * tiles. The smaller `--shadow-card-hover-tile` glow kicks in when no
 * base shadow is present.
 */
export const TileWithHover: Story = {
  args: {
    padding: 'lg',
    radius: 'lg',
    shadow: 'none',
    hoverEffect: true,
    children: (
      <Box>
        <Heading as="h4" marginBottom="xs">Editorial tile</Heading>
        <p className="text-sm text-(--text-muted)">Quiet by default, comes alive on hover.</p>
      </Box>
    ),
  },
};

export const GridWithImage: Story = {
  args: {
    className: 'grid grid-cols-1 md:grid-cols-2',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400"
          alt="Sample image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box>
          <Heading as="h3" marginBottom="xs">Grid Layout</Heading>
          <p>This card uses grid layout with an image and content side by side on desktop.</p>
          <p className="mt-2 text-sm text-gray-600">The grid collapses to a single column on mobile.</p>
        </Box>
      </>
    ),
  },
};

export const GridOutline: Story = {
  args: {
    transparent: true,
    border: true,
    className: 'grid grid-cols-1 md:grid-cols-2',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=1"
          alt="Product image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box>
          <Heading as="h3" marginBottom="xs">Product Card</Heading>
          <p>Outline variant with grid layout.</p>
          <p className="mt-4 text-sm text-gray-600">Perfect for product listings.</p>
        </Box>
      </>
    ),
  },
};

export const GridWithLargeGap: Story = {
  args: {
    className: 'grid grid-cols-1 md:grid-cols-2',
    gap: 'lg',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=2"
          alt="Hero image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box padding="xl">
          <Heading as="h2" marginBottom="sm">Large Gap</Heading>
          <p>This grid uses a large gap between columns.</p>
          <p className="mt-2 text-sm text-gray-600">gap="lg" provides more breathing room.</p>
        </Box>
      </>
    ),
  },
};

export const GridWithSmallGap: Story = {
  args: {
    className: 'grid grid-cols-1 md:grid-cols-2',
    gap: 'sm',
    transparent: true,
    border: true,
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=3"
          alt="Compact layout"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box>
          <Heading as="h3" marginBottom="xs">Small Gap</Heading>
          <p>This grid uses a small gap for a more compact layout.</p>
        </Box>
      </>
    ),
  },
};

export const Dark: Story = {
  args: {
    className: 'bg-neutral-900 text-white',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Dark Card</Heading>
        <p>This is a dark card with white text.</p>
      </Box>
    ),
  },
};

export const WithCustomSpacing: Story = {
  args: {
    padding: 'xl',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Custom Spacing</Heading>
        <p>This card uses extra-large padding.</p>
      </Box>
    ),
  },
};

export const WithBackgroundImage: Story = {
  args: {
    backgroundImageUrl: 'https://picsum.photos/800/400?random=4',
    children: (
      <Box className="text-white">
        <Heading as="h2" marginBottom="xs">Background Image</Heading>
        <p>Card with a background image.</p>
      </Box>
    ),
  },
};

export const CustomPaddingAndMargin: Story = {
  args: {
    padding: 'lg',
    margin: 'sm',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Custom Spacing</Heading>
        <p>Card with custom padding and margin.</p>
      </Box>
    ),
  },
};

/**
 * `featured`: the card that should stand out. Its edge comes from the
 * `--card-featured-*` tokens — a 2px primary frame in the standard theme, a
 * thick poster frame in Bureau. An app can turn the frame down for a reader
 * by overriding the tokens on the page.
 */
export const Featured: Story = {
  render: () => (
    <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
      <Card featured>
        <Heading as="h3">Good morning</Heading>
        <p>The card that should stand out.</p>
      </Card>
      <Card>
        <Heading as="h3">Seen today</Heading>
        <p>An ordinary card.</p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const featured = canvas.getByText('The card that should stand out.').closest('.ratio-card')!;
    const token = getComputedStyle(featured).getPropertyValue('--card-featured-border-width').trim();
    await expect(getComputedStyle(featured).borderTopWidth).toBe(token);
  },
};

/**
 * `collapsible` renders the card as a native `<details>`: `Card.Header` is
 * the `<summary>`, everything after it is the body. The header's `summary`
 * keeps one line of the content visible when the card is closed. Cards that
 * share a `name` open one at a time.
 */
export const Collapsible: Story = {
  render: () => (
    <div className="flex max-w-[28rem] flex-col gap-3">
      <Card collapsible name="programme">
        <Card.Header summary="Three sessions">
          <Heading as="h3" size="sm">Programme</Heading>
        </Card.Header>
        <p className="m-0">Opening at 09:00, workshop at 10:15, close at 13:00.</p>
      </Card>
      <Card collapsible name="programme" defaultOpen={false}>
        <Card.Header summary="Charged in full after 1 June">
          <Heading as="h3" size="sm">Terms</Heading>
        </Card.Header>
        <p className="m-0">Cancellations after 1 June are charged in full.</p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const programme = canvas.getByText('Programme').closest('details') as HTMLDetailsElement;
    const terms = canvas.getByText('Terms').closest('details') as HTMLDetailsElement;
    expect(programme.open).toBe(true);
    expect(terms.open).toBe(false);
    await userEvent.click(canvas.getByText('Terms'));
    expect(terms.open).toBe(true);
    // Same `name`: the browser closes the other one.
    expect(programme.open).toBe(false);
  },
};

/**
 * Collapsible only where there is no room: `useMediaQuery` decides, so on a
 * wide screen every module is a plain open card, and on a phone each is a
 * disclosure with its settings in the header's `summary`, one open at a
 * time. Resize the canvas to see it.
 */
export const CollapsibleOnNarrowScreens: Story = {
  render: function CollapsibleOnNarrowScreensStory() {
    const narrow = useMediaQuery('(max-width: 639px)');
    const modules = [
      { title: 'Oscillator', summary: 'Sawtooth · octave 0 · 0 c' },
      { title: 'Filter', summary: '1.8 kHz · resonance 4.0' },
      { title: 'Envelope', summary: '10 ms · 400 ms' },
    ];
    return (
      <div className="flex flex-col gap-3">
        {modules.map((m, i) => (
          <Card key={m.title} collapsible={narrow} name="modules" defaultOpen={!narrow || i === 0}>
            <Card.Header summary={narrow ? m.summary : undefined}>
              <Heading as="h3" size="sm">{m.title}</Heading>
            </Card.Header>
            <p className="m-0">The controls of the {m.title.toLowerCase()} go here.</p>
          </Card>
        ))}
      </div>
    );
  },
};

/**
 * The three slots. `Card.Header` is the title row, `Card.Body` the content
 * (optional: bare children are the body too), and `Card.Footer` the bottom
 * row: its two children sit at either end, a rule sets it off from the
 * content, and it sinks to the bottom, so the footers line up across a row
 * of cards of different heights — the sockets of a rack of modules.
 */
export const Slots: Story = {
  render: () => {
    const Socket = ({ label }: { label: string }) => (
      <span className="flex flex-col items-center gap-1 text-xs text-(--text-muted)">
        <span aria-hidden className="h-6 w-6 rounded-full border-[3px] border-(--primary) bg-card" />
        {label}
      </span>
    );
    const modules = [
      { title: 'Oscillator', body: 'Waveform and octave.', ins: ['Mod'], outs: ['Out'] },
      { title: 'Mixer', body: 'Three inputs, one level each, summed.', ins: ['1', '2', '3'], outs: ['Out'] },
      { title: 'Filter', body: 'Cutoff and resonance.', ins: ['In', 'Mod'], outs: ['Out'] },
    ];
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.title}>
            <Card.Header>
              <Heading as="h3" size="sm">{m.title}</Heading>
            </Card.Header>
            <Card.Body>
              <p className="m-0">{m.body}</p>
            </Card.Body>
            <Card.Footer>
              <span className="flex gap-2">{m.ins.map((i) => <Socket key={i} label={i} />)}</span>
              <span className="flex gap-2">{m.outs.map((o) => <Socket key={o} label={o} />)}</span>
            </Card.Footer>
          </Card>
        ))}
      </div>
    );
  },
};
