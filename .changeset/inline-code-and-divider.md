---
'@eventuras/ratio-ui': minor
---

Add `InlineCode` and `Divider` core components.

- `InlineCode` renders a `<code>` pill styled with the shared `--code-*` tokens,
  so inline snippets match `CodeBlock` and stay legible in every theme.
- `Divider` renders a token-driven thematic break (`--border-2`) rather than a
  fixed grey rule.

Both ship their own theme-aware CSS that travels with the component import, so
they work regardless of which CSS entrypoint the app uses.
