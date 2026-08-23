---
"@eventuras/ratio-ui": minor
---

`Drawer` gains `size` and `className`. A left/right drawer was always a
viewport fraction — around half the page on a desktop — with no way to ask for
less, so an inspector or activity panel had no shape to fit into.

`size` takes the same `sm | md | lg | xl` scale as `Dialog` (28 / 32 / 42 /
56 rem), so a panel is the same width whichever way it arrives on screen. The
default is `'responsive'`, the original behaviour, so existing drawers are
untouched. It applies to `left` / `right` drawers; `top` / `bottom` sheets are
full-width by definition and stay content-sized up to 85vh.

`className` merges onto the drawer panel, the escape hatch for the cases the
scale doesn't cover — `Drawer` previously accepted none at all.

Note that the widths are rem-based and this design system scales rem with the
viewport (`--font-size-base` is a clamp), so `sm` is 28rem, not a fixed 448px.
