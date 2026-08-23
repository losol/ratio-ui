export { MarkdownEngine } from './MarkdownEngine'
export type {
  MarkdownEngineProps,
  MarkdownRenderOptions,
  MarkdownComponents,
  MarkdownPluginList,
} from './MarkdownEngine'
export type {
  MarkdownRenderers,
  MarkdownRendererAttributes,
  MarkdownCodeBlockProps,
} from './renderers'

// The vanilla tier re-exported, so React consumers keep a single import
// source.
export {
  normalizeMarkdown,
  extractHeadings,
  mergeSanitizeSchemas,
  remarkCallout,
  calloutSanitizeSchema,
} from '@eventuras/markdown-core'
export type {
  MarkdownHeading,
  SanitizeSchemaExtension,
  CalloutType,
} from '@eventuras/markdown-core'
