---
"@eventuras/ratio-ui": minor
---

New `Announcement` in `core/` — the band for everything a site needs to *say*
about an event: a deadline, planned maintenance, a flag at half mast, a death.
Two forms of one component: `variant="row"` is the one-line notice below the
navbar, `variant="banner"` the taller announcement above it with a serif
`Title`. Composed from parts — `Body`, `Title`, an inline `Link` or a pill
`Action` (one way in, never two), and a `Rule` or `Image` graphic — with
`onDismiss` rendering the close button while the caller owns the state and
whatever remembers it, keyed by message. Content-named rather than
placement-named: with `fluid` it sits just as well at the top of a `Card` or a
`Drawer`.

`tone` is `info` / `warning` / `success` / `error` on the Panel and Badge status
tokens, `neutral` for the quiet linen marking, and `ink` for the mourning band.
It is a labelled region landmark; nothing is announced unless you pass
`role="status"`.
