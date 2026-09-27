---
'@eventuras/ratio-ui': minor
---

Bureau theme: new opt-in `@eventuras/ratio-ui/themes/bureau-fonts.css` ships self-hosted WOFF2 for Pixelify Sans, Archivo and Space Mono (latin and latin-ext, SIL OFL 1.1). Import it next to `themes/bureau.css` to get the theme's own type instead of the system fallbacks.

Bureau also sets `--font-serif` to the pixel display face, so components that set display text with `font-serif` (Hero, Section, ValueTile, Avatar initials, the Menu header, DescriptionList facts) follow the theme.

Pagination: adds space between the buttons and the page status.
