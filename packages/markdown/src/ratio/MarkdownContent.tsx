import {
  MarkdownEngine,
  calloutSanitizeSchema,
  mergeSanitizeSchemas,
  remarkCallout,
  type MarkdownComponents,
  type MarkdownRenderOptions,
} from '@eventuras/markdown-react';
import { ratioRenderers } from './renderers';
import { createCalloutComponents, type CalloutLabels } from './calloutComponents';

/** Built-in text of `MarkdownContent`. Each entry falls back to English. */
export interface MarkdownContentLabels {
  /** Titles of the GitHub alerts. */
  callouts?: CalloutLabels;
}

export type MarkdownContentProps = MarkdownRenderOptions & {
  /**
   * Render GitHub alerts (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`,
   * `> [!WARNING]`, `> [!CAUTION]`) as a `Panel` with an icon and title.
   * With `false` they stay plain blockquotes.
   * @default true
   */
  callouts?: boolean;
  /** Built-in text. Each entry falls back to English. */
  labels?: MarkdownContentLabels;
};

/**
 * Markdown rendered with Ratio UI components: `@eventuras/markdown-react`'s
 * engine bound to `ratioRenderers`. Parsing, sanitization, and URL policy live
 * in the engine; this binding picks the design system and turns GitHub alerts
 * into panels.
 */
export const MarkdownContent = ({
  callouts = true,
  labels,
  remarkPlugins,
  sanitizeSchemaExtension,
  customComponents,
  ...props
}: MarkdownContentProps) => {
  if (!callouts) {
    return (
      <MarkdownEngine
        renderers={ratioRenderers}
        remarkPlugins={remarkPlugins}
        sanitizeSchemaExtension={sanitizeSchemaExtension}
        customComponents={customComponents}
        {...props}
      />
    );
  }

  return (
    <MarkdownEngine
      renderers={ratioRenderers}
      // Consumers who wired callouts up themselves may pass the plugin too;
      // running it once is enough.
      remarkPlugins={[remarkCallout, ...(remarkPlugins ?? []).filter(p => p !== remarkCallout)]}
      sanitizeSchemaExtension={
        sanitizeSchemaExtension
          ? mergeSanitizeSchemas(calloutSanitizeSchema, sanitizeSchemaExtension)
          : calloutSanitizeSchema
      }
      // The caller's overrides win, including their own `callout`.
      customComponents={
        { ...createCalloutComponents(labels?.callouts), ...customComponents } as MarkdownComponents
      }
      {...props}
    />
  );
};

export type {
  MarkdownComponents,
  MarkdownPluginList,
  MarkdownCodeBlockProps,
  SanitizeSchemaExtension,
} from '@eventuras/markdown-react';
