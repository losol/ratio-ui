import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock as ShikiCodeBlock } from '@eventuras/ratio-ui-shiki/CodeBlock';
import { MarkdownContent } from './MarkdownContent';

/**
 * `MarkdownContent` renders markdown with ratio-ui components — headings,
 * lists, links, blockquotes, and code. Fenced code blocks render as the core
 * `CodeBlock` (un-highlighted) by default; pass a `codeBlock` component to
 * swap in syntax highlighting, e.g. from `@eventuras/ratio-ui-shiki`.
 */
const meta = {
  title: 'Markdown/MarkdownContent',
  component: MarkdownContent,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// A short study note — prose, inline code, and a fenced block, the shapes a
// docs or knowledge-sharing page typically mixes.
const STUDY_NOTE = `## Spaced repetition

Reviewing right before you forget beats cramming. The interval grows with
each successful recall — that is the whole trick.

A minimal scheduler doubles the interval on success and resets on failure
(the \`interval\` is in days):

\`\`\`ts
interface ReviewState {
  interval: number;
  dueAt: Date;
}

export function nextReview(state: ReviewState, recalled: boolean): ReviewState {
  const interval = recalled ? state.interval * 2 : 1;
  return {
    interval,
    dueAt: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
  };
}
\`\`\`

> Start with a one-day interval; let the schedule earn its complexity.
`;

/** Default rendering: fences become the core CodeBlock, un-highlighted. */
export const Default: Story = {
  args: {
    markdown: STUDY_NOTE,
  },
};

/**
 * Opt-in syntax highlighting: pass `@eventuras/ratio-ui-shiki`'s CodeBlock as
 * `codeBlock` and fences highlight client-side. Token colors follow the app's
 * light/dark mode — flip the mode toggle and the code re-themes instantly,
 * with no re-highlight. Everything else (inline code, prose) is unchanged.
 */
export const WithSyntaxHighlighting: Story = {
  args: {
    markdown: STUDY_NOTE,
    codeBlock: ShikiCodeBlock,
  },
};

/**
 * Unknown or missing fence languages degrade gracefully: the block renders as
 * plain code, never crashes. Here `mermaid` has no loaded grammar and the
 * bare fence has no language at all.
 */
export const UnknownLanguageFallback: Story = {
  args: {
    markdown: [
      'A grammar Shiki has not loaded:',
      '',
      '```mermaid',
      'graph TD; Question --> Recall --> Check;',
      '```',
      '',
      'And a fence with no language:',
      '',
      '```',
      'plain text, rendered as-is',
      '```',
    ].join('\n'),
    codeBlock: ShikiCodeBlock,
  },
};
