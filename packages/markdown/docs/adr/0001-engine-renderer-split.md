# ADR-0001: Engine / renderer split

## Status

Accepted 2026-08-16.
Extracted 2026-08-20 into two tiers: the React engine + renderer contract to
`@eventuras/markdown-react`, and the framework-agnostic utilities
(normalize, sanitize-schema merging, heading extraction, callout plugin) to
`@eventuras/markdown-core`. "src/core" below refers to what is now those
packages; the boundary and contract are unchanged.

## Context

`MarkdownContent` mixed two concerns in one component: the markdown *engine*
(parsing, GFM, the sanitize-last pipeline, external-URL policy, and the
`<pre><code>` fence extraction) and the *Ratio mapping* (which ratio-ui
component renders each element). That entanglement blocks two known
directions: a second design-system mapping (e.g. MUI) would have to duplicate
the hard, security-adjacent engine logic, and a future package split
(`markdown-core` / `markdown-ratio` / `markdown-mui`) has no seam to cut
along.

## Decision

Split along a semantic component contract, inside this package for now:

- **`src/core/`** — the design-system-agnostic engine and helpers.
  `MarkdownEngine` does everything `MarkdownContent` did, but renders every
  visible element through a `MarkdownRenderers` slot set (`heading(level)`,
  `link(href)`, `codeBlock(MarkdownCodeBlockProps)`, …). Slots never see hast
  nodes; URL policy runs *before* a slot is called, so a renderer set cannot
  weaken it. `customComponents` remains the react-markdown-level escape hatch
  for plugin elements (callouts, schedules).
- **`src/ratio/`** — `ratioRenderers` (the mapping that was inlined in
  `MarkdownContent`), the `MarkdownContent` binding, `calloutComponents`, and
  `extractHeadings` bound to ratio-ui's `slugify`.

The contract is semantic slots rather than react-markdown's `Components` map
so a second renderer set is a ~50-line mapping, not a reimplementation — and
so the renderer underneath could change without touching adapters.

An eslint guard (`no-restricted-imports` on `src/core/**`) enforces that the
engine never imports ratio-ui.

## Consequences

- The public API is unchanged; `MarkdownRenderers` and `MarkdownEngine` stay
  internal until the package split, so the contract can still move.
- Extracting `markdown-core` later is a file move: `src/core/` already has no
  ratio-ui imports and its only externals are react-markdown, remark-gfm,
  rehype-sanitize, and unist-util-visit.
- A new design-system mapping starts at `src/ratio/renderers.tsx` as the
  template: implement `MarkdownRenderers`, bind, done.
