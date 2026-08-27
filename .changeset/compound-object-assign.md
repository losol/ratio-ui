---
"@eventuras/ratio-ui": patch
---

Internal: Hero, ValueTile, Sidebar, Footer, and Section now build their
compound exports with `Object.assign` inference instead of a hand-rolled
`*Component` interface plus cast — matching Heading and DescriptionList.
No runtime API change; the slot prop interfaces these components use are
now exported (`HeroSlotProps`, `SectionTitleProps`, `SidebarSlotProps`,
`ValueTileValueProps`, `ValueTileCaptionProps`, …), and the never
re-exported `*Component` interfaces are gone.
