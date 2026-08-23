# @eventuras/markdown-core

Framework-agnostic markdown utilities and remark plugins — the vanilla-TS tier
of the `@eventuras/markdown*` family. No React, no renderer, no design system:
everything here runs in any JS runtime (Node scripts, CMS backends, edge
functions) with `unist-util-visit` as the only dependency.

The React engine lives in
[`@eventuras/markdown-react`](../markdown-react); the Ratio UI binding in
[`@eventuras/markdown`](../markdown). Both re-export this package's surface,
so React consumers never need to install it directly.

## Installation

```bash
pnpm add @eventuras/markdown-core
```

## What's in the box

- **`normalizeMarkdown(input)`** — strips invisible/control characters,
  unescapes backslash-escaped markdown, NFC-normalizes. XSS protection is not
  its job (the render pipeline sanitizes); this is input hygiene.
- **`extractHeadings(markdown, { slugify })`** — pulls h2/h3 headings for an
  "on this page" table of contents, skipping fenced code blocks. Pass the same
  `slugify` your heading renderer uses, or the TOC points nowhere.
- **`mergeSanitizeSchemas(...schemas)` / `mergeAttributes(...sources)`** —
  merges sanitize-schema extensions, concatenating per-tag attribute
  allowlists instead of clobbering them (a shallow spread would silently drop
  `href` from links).
- **`remarkCallout` + `calloutSanitizeSchema`** — remark plugin turning
  GitHub-style `> [!NOTE]` blockquotes into `callout` elements
  (`data-callout-type`), plus the schema extension that lets them through
  sanitization. Rendering them is the consumer's half — see the callout
  components in `@eventuras/markdown`.

## Writing remark plugins?

This is the tier plugin packages should sit on — compare
`@eventuras/markdown-plugin-happening`, which is exactly this shape: a
framework-agnostic remark plugin plus a per-design-system component pack.
