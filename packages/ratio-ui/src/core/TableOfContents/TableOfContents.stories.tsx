import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { TableOfContents, TableOfContentsProps, TocHeading } from './TableOfContents';

// A reader's guide to Euclid's Elements — the textbook that stayed in use
// for two thousand years, and a good test of wayfinding in long-form text.
const guideHeadings: TocHeading[] = [
  { id: 'why-it-endured', text: 'Why the Elements endured', level: 2 },
  { id: 'definitions', text: 'Definitions', level: 3 },
  { id: 'postulates', text: 'Postulates', level: 3 },
  { id: 'book-i', text: 'Book I', level: 2 },
  { id: 'proposition-47', text: 'Proposition 47', level: 3 },
  { id: 'reading-it-today', text: 'Reading it today', level: 2 },
  { id: 'further-reading', text: 'Further reading', level: 2 },
];

const guideSections: Record<string, string> = {
  'why-it-endured':
    'Euclid wrote nothing new. His achievement was order: every result rests on the ones before it, back to a handful of starting points a reader can check for themselves.',
  definitions:
    'Twenty-three definitions open Book I — "a point is that which has no part". They fix the vocabulary before a single claim is made.',
  postulates:
    'Five postulates state what may be assumed. The fifth, on parallel lines, resisted proof for two millennia and finally opened the door to non-Euclidean geometry.',
  'book-i':
    'Forty-eight propositions, each proved from the definitions, postulates and earlier propositions alone. The structure is the lesson.',
  'proposition-47':
    'The Pythagorean theorem, proved by dissecting squares — the famous "windmill" figure. Newton is said to have read it and found it obvious, then read the rest.',
  'reading-it-today':
    'Read the proofs, not the summaries; the point is to watch each step follow. Oliver Byrne’s 1847 colour edition replaces letters with coloured shapes and is still the friendliest way in.',
  'further-reading':
    'Heath’s three-volume translation (1908) remains the standard; Byrne’s edition has been reissued and digitised.',
};

const meta: Meta<TableOfContentsProps> = {
  title: 'Core/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
};

const railWidth = (Story: React.ComponentType) => (
  <div style={{ width: 224, padding: '1rem' }}>
    <Story />
  </div>
);

export default meta;

type Story = StoryObj<TableOfContentsProps>;

export const Default: Story = {
  args: {
    headings: guideHeadings,
  },
  decorators: [railWidth],
};

export const FewHeadings: Story = {
  args: {
    headings: [
      { id: 'definitions', text: 'Definitions', level: 2 },
      { id: 'postulates', text: 'Postulates', level: 2 },
    ],
  },
  decorators: [railWidth],
};

/**
 * The scroll-spy follows the page: the current heading is the last one to
 * have scrolled past the top of the viewport, so the highlight tracks what
 * you are reading in either direction and lands correctly after an anchor
 * jump. The last entry takes over at the bottom of the page, even though
 * "Further reading" is too short to reach the top on its own.
 */
export const WithScrollSpy: Story = {
  args: {
    headings: guideHeadings,
  },
  render: (args) => (
    <div className="mx-auto flex max-w-4xl gap-8 px-4">
      <article className="min-w-0 flex-1">
        <h1>A reader&apos;s guide to Euclid&apos;s <em>Elements</em></h1>
        {args.headings.map((h) => (
          <section key={h.id} id={h.id} className="min-h-[60vh]">
            {h.level === 2 ? <h2>{h.text}</h2> : <h3>{h.text}</h3>}
            <p>{guideSections[h.id]}</p>
          </section>
        ))}
      </article>
      <div className="sticky top-4 hidden w-56 shrink-0 self-start md:block">
        <TableOfContents {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const link = (name: string) => canvas.getByRole('link', { name });
    const scrollTo = (id: string, delta = 0) => {
      const el = canvasElement.querySelector<HTMLElement>(`#${id}`)!;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + delta });
    };

    // Top of the page: the topmost heading is current before any has scrolled past.
    window.scrollTo({ top: 0 });
    await waitFor(() => expect(link('Why the Elements endured')).toHaveAttribute('aria-current', 'location'));

    // An anchor jump lands the heading exactly on the line — it becomes current.
    scrollTo('book-i');
    await waitFor(() => expect(link('Book I')).toHaveAttribute('aria-current', 'location'));

    // Scrolling back up past it hands the highlight to the previous heading —
    // the case an observer-only spy missed, since no heading *entered* view.
    scrollTo('book-i', -40);
    await waitFor(() => expect(link('Postulates')).toHaveAttribute('aria-current', 'location'));

    // The bottom of the page belongs to the last entry, however short.
    window.scrollTo({ top: document.documentElement.scrollHeight });
    await waitFor(() => expect(link('Further reading')).toHaveAttribute('aria-current', 'location'));
  },
};
