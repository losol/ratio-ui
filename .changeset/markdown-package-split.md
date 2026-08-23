---
"@eventuras/markdown-core": minor
"@eventuras/markdown-react": minor
"@eventuras/markdown": patch
---

The `@eventuras/markdown*` family splits into tiers (ADR-0001, PR 2 of the
package split):

- **`@eventuras/markdown-core`** (new) — framework-agnostic utilities and
  remark plugins: `normalizeMarkdown`, `mergeSanitizeSchemas`,
  `extractHeadings` (with injectable `slugify`), `remarkCallout` +
  `calloutSanitizeSchema`. No React; `unist-util-visit` is the only
  dependency.
- **`@eventuras/markdown-react`** (new) — the React engine extracted from
  `@eventuras/markdown`: `MarkdownEngine` + the `MarkdownRenderers` slot
  contract are now public API, so a design-system binding is a plain
  prop-to-component mapping. Parsing, GFM, the sanitize-last pipeline, URL
  policy, and fence extraction are owned by the engine. Re-exports the core
  tier.
- **`@eventuras/markdown`** — unchanged for consumers: same exports, same
  behavior. It now binds the engine to Ratio UI renderers and re-exports the
  shared helpers.
