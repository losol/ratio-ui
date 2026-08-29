import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../core/Button';
import { ValueTile } from '../../core/ValueTile';
import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Blocks/Hero',
  component: Hero,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Hero>;

/**
 * Two-column editorial hero with eyebrow, italic-accented serif title,
 * lead paragraph, CTAs, and a stat panel on the right with a divider.
 */
export const WithStatPanel: Story = {
  render: () => (
    <Hero>
      <Hero.Main>
        <Hero.Eyebrow>A knowledge platform</Hero.Eyebrow>
        <Hero.Title>
          Build something{' '}
          <em className="font-serif text-(--primary)">considered</em>,{' '}
          <em className="font-serif text-(--accent)">curated</em>, and worth coming back to.
        </Hero.Title>
        <Hero.Lead>
          A place for long-form articles, study guides, and editorial collections — with the
          tooling to organize them, the typography to make them read, and the design system to
          keep it all consistent.
        </Hero.Lead>
        <Hero.Actions>
          <Button variant="primary" size="lg">Browse the library</Button>
          <Button variant="outline" size="lg">Read the manifesto</Button>
        </Hero.Actions>
      </Hero.Main>
      <Hero.Side>
        <ValueTile>
          <ValueTile.Value>
            <em className="text-(--accent)">240+</em> articles
          </ValueTile.Value>
          <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
        </ValueTile>
        <ValueTile>
          <ValueTile.Value>
            12 <em className="text-(--accent)">collections</em>
          </ValueTile.Value>
          <ValueTile.Caption>Editorial reading lists curated by topic</ValueTile.Caption>
        </ValueTile>
        <ValueTile>
          <ValueTile.Value>
            1 <em className="text-(--accent)">subscription</em>
          </ValueTile.Value>
          <ValueTile.Caption>
            Open access, free for the curious, supported by patrons
          </ValueTile.Caption>
        </ValueTile>
      </Hero.Side>
    </Hero>
  ),
};

/**
 * Single-column hero — `Hero.Side` omitted. The grid collapses to one column
 * and the main content keeps a comfortable max-width via `Hero.Lead`.
 */
export const SingleColumn: Story = {
  render: () => (
    <Hero>
      <Hero.Main>
        <Hero.Eyebrow>The reading room</Hero.Eyebrow>
        <Hero.Title>
          Find knowledge —{' '}
          <em className="font-serif text-(--primary)">considered</em>,{' '}
          <em className="font-serif text-(--accent)">measured</em>, ours.
        </Hero.Title>
        <Hero.Lead>
          A design system built on clarity, proportion, and composable components. Use it to
          build editorial surfaces, knowledge bases, and reading-first interfaces that hold up
          under use.
        </Hero.Lead>
        <Hero.Actions>
          <Button variant="primary" size="lg">Start reading</Button>
          <Button variant="outline" size="lg">View the source</Button>
        </Hero.Actions>
      </Hero.Main>
    </Hero>
  ),
};

/**
 * Dark hero — `dark` prop applies `surface-dark`, so descendants reading
 * `var(--text)` switch to the light tone. Pair with a colored or
 * photographic background.
 */
export const DarkSurface: Story = {
  render: () => (
    <Hero dark className="bg-(--color-primary-900)">
      <Hero.Main>
        <Hero.Eyebrow>The winter issue</Hero.Eyebrow>
        <Hero.Title>
          Slow knowledge for{' '}
          <em className="font-serif text-(--accent)">long evenings</em>.
        </Hero.Title>
        <Hero.Lead>
          Twelve essays on memory, attention, and the practice of reading — selected for the
          months when the light fades early and there's time to sit with a thought.
        </Hero.Lead>
        <Hero.Actions>
          <Button variant="primary" size="lg">Open the issue</Button>
          <Button variant="outline" size="lg">Subscribe</Button>
        </Hero.Actions>
      </Hero.Main>
    </Hero>
  ),
};

// ── Occasions ────────────────────────────────────────────────────────────
// The hero's named openings for a marked day — set by the app from its
// occasion config, see docs/occasions.md. Colour, a motif, a memorial;
// never layout.

/**
 * `variant="memorial"` is the memorial hero: an ink surface with fine
 * grain and a black band across the top-left corner — a fixed variant, so
 * the effects come with it rather than as free tools — with the years as
 * a `Hero.Watermark`. The one hero that asks for stillness: the app sets
 * `data-motion="none"` alongside it. The copy is Marie Curie's: her
 * laboratory notebooks are still radioactive and are kept in lead-lined
 * boxes; readers sign a waiver to consult them.
 */
export const Memorial: Story = {
  render: () => (
    <div data-motion="none">
      <Hero variant="memorial">
        <Hero.Watermark>1867–1934</Hero.Watermark>
        <Hero.Main>
          <Hero.Eyebrow className="text-(--text-subtle)">In memoriam</Hero.Eyebrow>
          <Hero.Title className="text-(--text)">
            Marie Curie{' '}
            <em className="font-serif text-(--text-muted)">1867–1934</em>
          </Hero.Title>
          <Hero.Lead>
            Her notebooks are still radioactive, and still read. The condolence book is open in
            the reading room this week.
          </Hero.Lead>
        </Hero.Main>
      </Hero>
    </div>
  ),
};

/**
 * `Hero.Watermark` on its own: display text as a background layer — a
 * year, a volume number, a date — in outline serif, anchored bottom-right
 * and cropped by the edge, in the surface's ink at 22% so it works on a
 * light hero too. 1543 is the year *De revolutionibus* was printed, and
 * Copernicus is said to have been handed the first copy on his deathbed.
 */
export const Watermark: Story = {
  render: () => (
    <Hero>
      <Hero.Watermark>1543</Hero.Watermark>
      <Hero.Main>
        <Hero.Eyebrow>Anniversary lecture</Hero.Eyebrow>
        <Hero.Title>
          The year the <em className="font-serif text-(--accent)">sky</em> moved
        </Hero.Title>
        <Hero.Lead>
          Copernicus put the sun at the centre in a book he waited thirty years to print. One
          evening on what the argument was, and why it took another century to land.
        </Hero.Lead>
      </Hero.Main>
    </Hero>
  ),
};

/**
 * `arcs` draws concentric rings off the top-right corner — one per colour,
 * the first colour outermost, blended with `multiply` so they sit *in* the
 * surface rather than on it. It is the brand mark's circle at hero scale,
 * and the occasion slot for flag colours; the app owns the list.
 */
export const Arcs: Story = {
  render: () => (
    <Hero arcs={['#E4322B', '#F08A1D', '#F5C93B', '#3E9B54', '#2C5FA8', '#7A4A9E']}>
      <Hero.Main>
        <Hero.Eyebrow className="text-[#7A4A9E]">Pride week · 20–28 June</Hero.Eyebrow>
        <Hero.Title className="text-(--text)">
          Everyone is <em className="font-serif text-[#7A4A9E]">welcome</em> in the reading room
        </Hero.Title>
        <Hero.Lead>
          The library has been open to all since it opened. This week we say so out loud.
        </Hero.Lead>
      </Hero.Main>
    </Hero>
  ),
};

/**
 * `Hero.Motif` is the silhouette slot: one SVG in one colour, anchored to
 * the bottom-right corner and always cropped by the hero's edge — big,
 * partly out of frame, half opacity. Size it with `className`; the width
 * follows the SVG. Here a comet for the winter lecture series, in the
 * season's palette (`bgColor`-style classes on the hero plus `dark`).
 */
export const Motif: Story = {
  render: () => (
    <Hero dark className="bg-[#1B3A32] border-[#173029]">
      <Hero.Main>
        <Hero.Eyebrow className="text-accent-300">Winter lectures · December</Hero.Eyebrow>
        <Hero.Title className="text-(--text)">
          Long nights, <em className="font-serif text-accent-300">clear skies</em>, and a telescope
          on the roof
        </Hero.Title>
        <Hero.Lead>
          Five evenings in the last week of the year. The observatory is heated; the roof is not.
        </Hero.Lead>
      </Hero.Main>
      <Hero.Motif className="h-40 text-accent-300">
        <svg viewBox="0 0 240 120" fill="currentColor"><path d="M0 118 C 70 96, 140 70, 196 50 L 200 62 C 150 84, 80 104, 0 118 Z" opacity=".55" /><polygon points="204.0,28.0 209.3,42.7 224.9,43.2 212.6,52.8 216.9,67.8 204.0,59.0 191.1,67.8 195.4,52.8 183.1,43.2 198.7,42.7" /></svg>
      </Hero.Motif>
    </Hero>
  ),
};
