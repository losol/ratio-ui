---
'@eventuras/ratio-ui': minor
---

**CommandPalette: injection-safe result highlighting (`description` + `highlights`), `descriptionHtml` deprecated.**

`CommandPaletteItem` now takes a plain-text `description` plus optional
`highlights` — `[start, end)` character ranges the component wraps in `<mark>`
itself. No HTML is injected, so search-result excerpts from untrusted content
are safe by default:

```ts
{ id, title, description: 'Streaming logs and audit trails', highlights: [[0, 9]] }
```

Out-of-bounds ranges are clamped and overlapping ones skipped, so a provider
can hand over raw match offsets without pre-validating them.

- `descriptionHtml` is **deprecated** — it injects raw HTML via
  `dangerouslySetInnerHTML` and is an XSS vector for untrusted values. It still
  renders (trusted/pre-sanitized content only) but is ignored when
  `description` is set, and will be removed in the next major. Migrate excerpt
  highlighting from an HTML string to `description` + `highlights`.

This takes raw HTML off CommandPalette's default render path — the library's
only remaining `dangerouslySetInnerHTML` is now the opt-in, deprecated
`descriptionHtml` fallback.
