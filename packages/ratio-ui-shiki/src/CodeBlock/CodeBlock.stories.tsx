// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import type { CodeAnnotation } from '@eventuras/ratio-ui/core/CodeBlock';
import { CodeBlock } from './CodeBlock';

/**
 * `CodeBlock` from `@eventuras/ratio-ui-shiki` — the core CodeBlock wired to
 * [Shiki](https://shiki.style). Pass `code` + `language` and it highlights
 * client-side: a highlighter loads asynchronously and the raw code shows until
 * it is ready. Token colors follow the app's light/dark mode automatically —
 * flip the mode toggle to see the same block re-theme.
 *
 * For static or server-rendered pages, prefer the core CodeBlock with
 * pre-computed `highlightedLines` (built via `shikiToDualLines` + `DUAL_THEME_CSS`).
 */
const meta = {
  title: 'Shiki/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// A study flashcard — the heart of active recall: hide the answer, try to
// remember it, then flip to check.
const FLASHCARD_TSX = `import { useState } from 'react';

interface Card {
  question: string;
  answer: string;
}

// Active recall: hide the answer, remember, then flip to check yourself.
export function Flashcard({ question, answer }: Card) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button type="button" onClick={() => setRevealed((shown) => !shown)}>
      {revealed ? answer : question}
    </button>
  );
}`;

/** A React flashcard component, highlighted client-side by Shiki. */
export const Default: Story = {
  args: {
    code: FLASHCARD_TSX,
    language: 'tsx',
    filename: 'Flashcard.tsx',
    showLineNumbers: true,
  },
};

const REVIEW_NOTES: CodeAnnotation[] = [
  {
    line: 5,
    severity: 'warning',
    code: 'type/too-narrow',
    path: 'Card.answer',
    message:
      'Answers often want formatting — code, a list, an image. Widening this to ReactNode lets a card render rich content without a second field.',
  },
  {
    line: 8,
    severity: 'info',
    code: 'note',
    message:
      'Active recall is the whole point: the question has to stand alone first, so hidden is the correct default state.',
  },
  {
    line: 13,
    severity: 'error',
    code: 'a11y/toggle-state',
    path: 'Flashcard.button',
    message:
      'A toggle must announce its state. Add aria-pressed={revealed} so assistive technology can tell whether the answer is currently showing.',
  },
];

/**
 * Shiki highlighting *and* inline annotations together — the combination a
 * review or validation report needs: coloured code you can read, with each note
 * sitting under the line it refers to instead of behind a hover target.
 */
export const Review: Story = {
  args: {
    code: FLASHCARD_TSX,
    language: 'tsx',
    filename: 'Flashcard.tsx',
    showLineNumbers: true,
    annotations: REVIEW_NOTES,
  },
};

const SNIPPET = `const answer = 42; // the question comes first`;

// `#rrggbb` as the browser reports a computed color, for comparing against
// the token's own `--shiki-*` custom property.
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

/**
 * Token colors follow the nearest surface scope, not only the page's mode.
 * ratio-ui's `.surface-dark` and `.surface-light` flip the code surface
 * inside a band of the other mode; the Shiki token colors flip with it, so a
 * block in a dark band on a light page reads as dark code, and the reverse —
 * also for a band nested inside another, where the inner one wins. Flip the
 * mode toggle: each block keeps the colors of its own band.
 */
export const SurfaceContexts: Story = {
  args: { code: SNIPPET, language: 'ts', showHeader: false },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="surface-dark rounded-lg bg-surface p-4" data-testid="dark-band">
        <CodeBlock {...args} />
      </div>
      <div className="surface-light rounded-lg bg-surface p-4" data-testid="light-band">
        <CodeBlock {...args} />
        {/* A dark band inside the light one: the nearest scope decides. */}
        <div className="surface-dark mt-4 rounded-lg bg-surface p-4" data-testid="nested-dark-band">
          <CodeBlock {...args} />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The first token of a band's own block — `:scope >` keeps a nested band's
    // tokens out of its parent's match.
    const firstToken = (band: HTMLElement) =>
      band.querySelector<HTMLElement>(':scope > * .ratio-shiki-token[style*="--shiki-dark"]');
    const reads = (token: HTMLElement, side: 'light' | 'dark') =>
      expect(getComputedStyle(token).color).toBe(rgb(token.style.getPropertyValue(`--shiki-${side}`).trim()));

    // The highlighter loads asynchronously; raw code shows until then.
    const dark = canvas.getByTestId('dark-band');
    const light = canvas.getByTestId('light-band');
    const nested = canvas.getByTestId('nested-dark-band');
    for (const band of [dark, light, nested]) {
      await waitFor(() => expect(firstToken(band)).not.toBeNull(), { timeout: 10_000 });
    }

    // Each token reads its own band's color, whatever the page's mode …
    reads(firstToken(dark)!, 'dark');
    reads(firstToken(light)!, 'light');
    // … and inside a band of the other mode, the nearest one wins.
    reads(firstToken(nested)!, 'dark');
  },
};
