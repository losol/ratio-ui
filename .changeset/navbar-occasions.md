---
"@eventuras/ratio-ui": minor
---

Occasions in `Navbar` — the named openings an app can fill on a marked day
(a season, a pride week, a national day) without touching layout. `Navbar.Motif` is
the motif slot at the bar's right edge: one SVG silhouette in `currentColor`,
32px tall, hidden below 880px, `aria-hidden`; `entry` slides it in once on
page load and then keeps still. `wash` paints one multiply zone per colour
behind the bar (flag colours).

The bar and its parts now carry stable hook classes (`ratio-navbar`,
`ratio-navbar__brand`, `__links`, `__link`, `__actions`) so an app can style
an occasion's surface and text from one `[data-occasion]` rule. And
`data-motion="none"` on `<html>` (or any ancestor) stops every animation and
transition beneath it — the switch a mourning occasion flips. The recipe is
in `docs/occasions.md`.
