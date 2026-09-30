export { MarkdownContent } from './ratio/MarkdownContent'
export { extractHeadings } from './ratio/extractHeadings'
export type {MarkdownContentProps, MarkdownContentLabels, SanitizeSchemaExtension, MarkdownComponents, MarkdownPluginList, MarkdownCodeBlockProps} from './ratio/MarkdownContent'
export { calloutComponents, createCalloutComponents } from './ratio/calloutComponents'
export type { CalloutLabels } from './ratio/calloutComponents'

// Engine helpers, re-exported so consumers keep a single import source. They
// originate in @eventuras/markdown-core and reach us through the engine tier.
export {
  normalizeMarkdown,
  mergeSanitizeSchemas,
  remarkCallout,
  calloutSanitizeSchema,
} from '@eventuras/markdown-react'
export type { CalloutType } from '@eventuras/markdown-react'
