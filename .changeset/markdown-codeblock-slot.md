---
"@eventuras/markdown": minor
---

Add a `codeBlock` component slot to `MarkdownContent` — the opt-in seam for
syntax highlighting. Pass `@eventuras/ratio-ui-shiki`'s CodeBlock and fenced
code blocks highlight (theme-aware, client-side); by default nothing changes
and no highlighter code is bundled. The slot receives the exact props the
built-in CodeBlock rendering uses (`MarkdownCodeBlockProps`, exported), so
CodeBlock-compatible components are drop-ins that match the default
appearance. Inline code and unknown-language fallback are unaffected.
