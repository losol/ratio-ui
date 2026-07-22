---
'@eventuras/markdown': minor
---

Fix dark mode. Code blocks, inline code, blockquotes and rules were rendered
with hardcoded light Tailwind greys and turned near-invisible under
`data-theme="dark"`. Rendering now delegates to ratio-ui's theme-aware
components, so no hardcoded colours remain in the component map:

- fenced code blocks → `CodeBlock`
- inline code → `InlineCode`
- blockquotes → `Blockquote`
- thematic breaks → `Divider`

Requires `@eventuras/ratio-ui` `^2.15.0` (peer range raised from `^2.13.0`) for
the new `InlineCode` and `Divider` primitives.
