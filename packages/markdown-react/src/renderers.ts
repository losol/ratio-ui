import type React from 'react';

/**
 * Props a `codeBlock` renderer receives — the exact call the built-in
 * rendering gets, so any CodeBlock-compatible component (e.g.
 * `@eventuras/ratio-ui-shiki`'s) is a drop-in that matches the default
 * appearance. Components that only need the content can ignore the chrome
 * flags; they are required here (not optional) because the engine always
 * passes them — marking them optional would reject override components whose
 * own props require the flags.
 */
export type MarkdownCodeBlockProps = {
  /** Code inside the fence, trailing newline stripped. */
  code: string;
  /** Fence language (`ts` for ```ts). `'Text'` when the fence has none. */
  language: string;
  showLineNumbers: boolean;
  showDownload: boolean;
  showCollapse: boolean;
};

/**
 * Sanitized HTML attributes the engine forwards to a renderer — footnote ids
 * and `aria-`/`data-` attributes from GFM, `className` where the sanitize
 * schema allows it. Spread them onto the element you render, or footnote
 * anchors and accessibility attributes are silently dropped.
 * (`color` is excluded: HTML's deprecated attribute, dropped by the engine.)
 */
export type MarkdownRendererAttributes = Omit<
  React.HTMLAttributes<HTMLElement>,
  'children' | 'color'
>;

/**
 * The component contract between the markdown engine and a design system.
 * The engine has already parsed the AST, applied URL policy, and extracted
 * code fences when a slot is called, so a renderer set is a plain mapping —
 * no hast nodes, no `<pre><code>` gymnastics.
 *
 * Optional slots fall back to plain HTML defaults in the engine.
 */
export type MarkdownRenderers = {
  heading: React.ComponentType<
    { level: 1 | 2 | 3 | 4 | 5 | 6; children?: React.ReactNode } & MarkdownRendererAttributes
  >;
  paragraph: React.ComponentType<{ children?: React.ReactNode } & MarkdownRendererAttributes>;
  /** Only called for allowed hrefs — external-URL policy runs in the engine. */
  link: React.ComponentType<
    { href: string; children?: React.ReactNode } & MarkdownRendererAttributes
  >;
  list: React.ComponentType<
    { ordered: boolean; children?: React.ReactNode } & MarkdownRendererAttributes
  >;
  listItem: React.ComponentType<{ children?: React.ReactNode } & MarkdownRendererAttributes>;
  blockquote: React.ComponentType<
    { cite?: string; children?: React.ReactNode } & MarkdownRendererAttributes
  >;
  /** Inline code only — fenced blocks go to `codeBlock`. */
  inlineCode: React.ComponentType<{ children?: React.ReactNode } & MarkdownRendererAttributes>;
  codeBlock: React.ComponentType<MarkdownCodeBlockProps>;
  divider: React.ComponentType<{ className?: string }>;
  /** Only called for allowed srcs. Default: lazy `<img>` with `no-referrer`. */
  image?: React.ComponentType<{ src?: string; alt?: string } & MarkdownRendererAttributes>;
  strong?: React.ComponentType<{ children?: React.ReactNode } & MarkdownRendererAttributes>;
  em?: React.ComponentType<{ children?: React.ReactNode } & MarkdownRendererAttributes>;
};
