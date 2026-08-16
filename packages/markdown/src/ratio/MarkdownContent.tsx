import { MarkdownEngine, type MarkdownRenderOptions } from '../core/MarkdownEngine';
import { ratioRenderers } from './renderers';

export type MarkdownContentProps = MarkdownRenderOptions;

/**
 * Markdown rendered with Ratio UI components: the markdown engine bound to
 * `ratioRenderers`. Parsing, sanitization, and URL policy live in the engine
 * (`core/MarkdownEngine`); this binding only picks the design system.
 */
export const MarkdownContent = (props: MarkdownContentProps) => (
  <MarkdownEngine renderers={ratioRenderers} {...props} />
);

export type { MarkdownComponents, MarkdownPluginList } from '../core/MarkdownEngine';
export type { MarkdownCodeBlockProps } from '../core/renderers';
export type { SanitizeSchemaExtension } from '../core/mergeSanitizeSchemas';
