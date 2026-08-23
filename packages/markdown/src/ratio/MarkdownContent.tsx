import { MarkdownEngine, type MarkdownRenderOptions } from '@eventuras/markdown-react';
import { ratioRenderers } from './renderers';

export type MarkdownContentProps = MarkdownRenderOptions;

/**
 * Markdown rendered with Ratio UI components: `@eventuras/markdown-react`'s
 * engine bound to `ratioRenderers`. Parsing, sanitization, and URL policy live
 * in the engine; this binding only picks the design system.
 */
export const MarkdownContent = (props: MarkdownContentProps) => (
  <MarkdownEngine renderers={ratioRenderers} {...props} />
);

export type {
  MarkdownComponents,
  MarkdownPluginList,
  MarkdownCodeBlockProps,
  SanitizeSchemaExtension,
} from '@eventuras/markdown-react';
