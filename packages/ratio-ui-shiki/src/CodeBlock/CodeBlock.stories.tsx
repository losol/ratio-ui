// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
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
