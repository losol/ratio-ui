---
"@eventuras/ratio-ui": minor
---

Add `CodeBlock` (beta) — a code/JSON/XML surface that frames raw text with a language badge, optional filename, and a toolbar (copy, word-wrap toggle, download), plus collapse and "show more". It deliberately does not highlight or format: pass raw `code`, and optionally per-line `highlightedLines` from any highlighter (Shiki/Prism/highlight.js) — the gutter stays outside the highlighted content, so it's highlighter-agnostic and wrap-safe. Surface uses new `--code-*` tokens that follow the theme. The toolbar reuses `ActionButton` re-skinned via its tokens.
