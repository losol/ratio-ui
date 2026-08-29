---
"@eventuras/ratio-ui": minor
---

Occasions in `Hero`, completing the set opened in `Navbar`. `Hero.Motif` is
the silhouette slot: one SVG in one colour, anchored to the bottom-right
corner and always cropped by the hero's edge, `aria-hidden`. `arcs` draws
concentric multiply rings off the top-right corner, one per colour — the
brand mark's circle at hero scale, for flag colours. `Hero.Watermark` sets
display text as a background layer — years, a volume number, a date — in
outline serif in the surface's own ink, so it reads on light and dark heroes
alike. `variant="memorial"` is the memorial hero: an ink surface with fine
grain and a black band across the top-left corner — a fixed variant whose
effects come with it, not as free tools; add the years with a watermark.

The hero and its parts carry stable hook classes (`ratio-hero`,
`ratio-hero__eyebrow`, `__title`, `__lead`) for an app's `[data-occasion]`
rules; `docs/occasions.md` now covers both components.
