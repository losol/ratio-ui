// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
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
