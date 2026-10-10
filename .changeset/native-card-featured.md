---
'@eventuras/ratio-ui-core': minor
'@eventuras/ratio-ui-native': minor
---

ratio-ui-core: `components.card.featured` (beta) — the frame of the card that should stand out: `borderWidth`, `borderColor` and `shadow`, the native counterpart of the web's `--card-featured-*` tokens. Bureau's is an 8px primary border with no shadow, held to `themes/bureau.css` by its drift test. `Theme` now requires the key.

ratio-ui-native: `Card` takes `featured`, framed by the theme's `components.card.featured`, with its shadow in place of the elevation's. A featured card keeps its frame while pressed.
