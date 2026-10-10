---
'@eventuras/ratio-ui-shiki': minor
---

Shiki token colors follow ratio-ui's surface scopes, not only the page's mode.

`DUAL_THEME_CSS` now sets a switch on the same scopes ratio-ui's own code-surface tokens
use — the root mode arms, `.surface-light` and `.surface-dark` — and the token reads it
by inheritance, so the nearest scope decides. A `<CodeBlock>` inside a `.surface-dark`
band on a light page used to get a dark code surface with light-theme token colors (and
the reverse); it now reads as dark code, also when the band sits inside a band of the
other mode. A `SurfaceContexts` story asserts the computed color of a token in each band,
nested included.

Also in this release, unreleased since 0.1.0: the Shiki peer range is `^4` (`shiki`,
`@shikijs/langs`, `@shikijs/themes`), and the Shiki-free `./tokens` entrypoint
(`tokensToLines`, `DualThemeStyles`, `DUAL_THEME_CSS`) with `codeToDualTokens` for
highlighting at build time and rendering without Shiki on the client.
