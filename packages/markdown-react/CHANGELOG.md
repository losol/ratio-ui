# @eventuras/markdown-react

## 0.2.0

### Minor Changes

- 0b7b1d7: GFM tables get renderer slots. `MarkdownRenderers` gains optional `table`, `tableHead`, `tableBody`, `tableRow`, `tableHeadCell` and `tableCell` slots. Each falls back to the plain element, so existing renderer sets keep working. Column alignment (`:--`, `:-:`, `--:`) reaches the cells as `style.textAlign`.
  
  `ratioRenderers` maps them to the ratio-ui `Table`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.HeadCell` and `Table.Cell`, so markdown tables in `MarkdownContent` are styled, scroll horizontally when wide, and keep their alignment. Before this they fell through as unstyled `<table>` elements.

## 0.1.0

### Minor Changes

- e6adb33: The `@eventuras/markdown*` family splits into tiers (ADR-0001, PR 2 of the
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

### Patch Changes

- Updated dependencies [e6adb33]
  - @eventuras/markdown-core@0.1.0
