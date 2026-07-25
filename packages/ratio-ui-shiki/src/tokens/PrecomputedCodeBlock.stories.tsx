// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from '@eventuras/ratio-ui/core/CodeBlock';
import { createRatioHighlighter, codeToDualTokens } from '../index';
import { tokensToLines, DualThemeStyles, type DualTokenLine } from './index';

/**
 * The **precomputed** highlighting pipeline: tokenize once with
 * `codeToDualTokens` (in a build script — Node, not the browser), ship the
 * result as JSON, and render it with `tokensToLines` from
 * `@eventuras/ratio-ui-shiki/tokens` into the core CodeBlock's
 * `highlightedLines`. The client then bundles no highlighter, grammars, or
 * regex engine — only the ~1 kB tokens module — and the highlighted markup is
 * there from the very first render (no un-highlighted flash).
 *
 * In this story a loader stands in for the build script; the tokens are
 * JSON round-tripped to prove they travel as plain data. Colors still follow
 * the app's light/dark mode — flip the mode toggle.
 */
const meta = {
  title: 'Shiki/PrecomputedCodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// A spaced-repetition scheduler — review right before you forget.
const SCHEDULER_TS = `interface ReviewState {
  interval: number; // days
  dueAt: Date;
}

// Double the interval on success, reset on failure.
export function nextReview(state: ReviewState, recalled: boolean): ReviewState {
  const interval = recalled ? state.interval * 2 : 1;
  return {
    interval,
    dueAt: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
  };
}`;

/** Tokens computed ahead of render, serialized, and rendered without Shiki. */
export const Precomputed: Story = {
  loaders: [
    async () => {
      // Stand-in for a build script: tokenize, then round-trip through JSON —
      // exactly what shipping the tokens to the client does.
      const highlighter = await createRatioHighlighter();
      const tokens = codeToDualTokens(highlighter, SCHEDULER_TS, 'ts');
      return { tokens: JSON.parse(JSON.stringify(tokens)) as DualTokenLine[] };
    },
  ],
  args: {
    code: SCHEDULER_TS,
    language: 'ts',
    filename: 'nextReview.ts',
    showLineNumbers: true,
  },
  render: (args, { loaded }) => (
    <>
      <DualThemeStyles />
      <CodeBlock {...args} highlightedLines={tokensToLines(loaded.tokens as DualTokenLine[])} />
    </>
  ),
};
