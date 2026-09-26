---
"@eventuras/ratio-ui": patch
---

`Link` with a `button-*` variant now uses `Button`'s size classes, so it is
the same height as a `Button` next to it (it used to inherit a larger font
size). New `size` prop (`sm` | `md` | `lg`, default `md`) to match
`Button`'s sizes.
