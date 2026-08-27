import { Meta } from '@storybook/react-vite';
import React from 'react';

import { Heading, type HeadingProps } from './Heading';

const meta: Meta<typeof Heading> = {
  component: Heading,
  tags: ['autodocs'],
};

export default meta;

const renderHeading = (args: HeadingProps) => <Heading {...args} />;

export const Level1 = () =>
  renderHeading({
    as: 'h1',
    children: 'Heading Level 1',
  });

export const Level2 = () =>
  renderHeading({
    as: 'h2',
    children: 'Heading Level 2',
  });

export const Level3 = () =>
  renderHeading({
    as: 'h3',
    children: 'Heading Level 3',
  });

export const Level4 = () =>
  renderHeading({
    as: 'h4',
    children: 'Heading Level 4',
  });

export const Level5 = () =>
  renderHeading({
    as: 'h5',
    children: 'Heading Level 5',
  });

export const Level6 = () =>
  renderHeading({
    as: 'h6',
    children: 'Heading Level 6',
  });

/**
 * `size` decouples the visual scale from the semantic level. Without it,
 * headings follow the document prose scale from `global.css`; with it they
 * use a compact serif scale with margins zeroed, for composed UI where the
 * layout owns spacing — cards, panels, detail-page headers.
 */
export const Sizes = () => (
  <div className="space-y-8 max-w-2xl">
    <div>
      <Heading as="h1" size="lg">
        Readers scan before they read
      </Heading>
      <p className="mt-2">
        Eye-tracking studies consistently show readers skimming headings,
        first lines, and highlighted facts before committing to a text. An h1
        at <code>size="lg"</code> is quieter than the 6xl prose default —
        suited to detail pages where a facts strip or aside competes for that
        first scan.
      </p>
    </div>
    <div>
      <Heading as="h2" size="md">
        Hierarchy is wayfinding
      </Heading>
      <p className="mt-2">
        Clear visual steps between heading levels act like signposts in a
        long text: they let a reader predict where an answer lives without
        reading everything. An h2 at <code>size="md"</code> steps down
        visually without giving up its semantic level.
      </p>
    </div>
    <div>
      <Heading as="h2" size="sm">
        Semantics outrank size
      </Heading>
      <p className="mt-2">
        Screen readers navigate by heading level, not font size — so a card
        heading can shrink to <code>size="sm"</code> and remain an h2 in the
        document outline. Scale is presentation; structure is meaning.
      </p>
    </div>
  </div>
);

/**
 * `Heading.Group` renders an `<hgroup>` — semantic HTML for a heading
 * paired with a kicker/eyebrow. Assistive technology may present this
 * grouping differently, but it conveys that the texts belong together.
 */
export const WithGroup = () => (
  <Heading.Group>
    <Heading.Eyebrow>The library</Heading.Eyebrow>
    <Heading as="h2">What's inside</Heading>
  </Heading.Group>
);

/**
 * `Heading.Eyebrow` defaults to `tone="primary"` (Linseed) — quieter,
 * intended for sections subordinate to the page hero. Use `tone="accent"`
 * (Ochre) for the page's top-of-page heading.
 */
export const EyebrowTones = () => (
  <div className="space-y-6">
    <Heading.Group>
      <Heading.Eyebrow>Primary tone (default)</Heading.Eyebrow>
      <Heading as="h3">Quieter, for body sections</Heading>
    </Heading.Group>
    <Heading.Group>
      <Heading.Eyebrow tone="accent">Accent tone</Heading.Eyebrow>
      <Heading as="h3">Louder, for the page hero</Heading>
    </Heading.Group>
  </div>
);
