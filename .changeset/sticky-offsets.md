---
"@eventuras/ratio-ui": minor
---

Sticky offsets on a fluid rem scale. `AsideLayout.Aside` and `Sidebar` take
`top` as a px number *or* a CSS length, so `top="calc(var(--spacing) * 16)"`
sits exactly under an `h-16` navbar at every viewport width — the root font
size is a `clamp()`, so any px constant for "the navbar's height" is off by a
few px somewhere. `Sidebar` keeps its `height: calc(100vh - top)` contract for
both forms.

Anchor targets clear sticky chrome the same way: `global.css` now declares
`:where([id]) { scroll-margin-top: var(--scroll-margin-top, 0px) }`, so setting
`--scroll-margin-top` once on the page makes every `#id` jump land below the
header — no per-target `scroll-mt-*` (which `ratio-ui.css` does not ship).
Zero specificity, so an explicit `scroll-mt-*` still wins.
