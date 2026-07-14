---
"@eventuras/ratio-ui": minor
---

**Navbar — composition parts for app headers.**

The navbar can now be assembled from parts (existing `Brand`/`Content` are
untouched):

- **`Navbar.Search`** — a growing, width-capped zone for a search control.
  It's a slot: drop a `SearchField` in from the call site (`core/` can't
  depend on `forms/`).
- **`Navbar.Links`** + **`Navbar.Link`** — horizontal pill links with `icon`,
  `isCurrent` (tinted pill + `aria-current="page"`), and `LinkComponent`
  injection for SPA routers.
- **`Navbar.Actions`** — the right-hand cluster (bell, theme, user menu).
- **`Navbar.Spacer`** — flexible gap.

- **`Navbar.Row`** — stack rows for the editorial 2-row layout, with
  variants `utility` (slim tinted strip), `brand`, and `nav`. Rows are
  separated by background tone, never borders.

Root gains **`elevated`** — elevation instead of lines, per the design
("baren står på en subtil skygge"): card background and a soft shadow, never
borders. Centered it's a floating card (rounded from `md`, full-bleed below);
with **`fluid`** (full-width row for admin consoles) it's a flat app header.

`Drawer` gains a **`side`** prop (`'left' | 'right' | 'top' | 'bottom'`,
default `right`) — nav sheets from the left, action sheets from the bottom
(rounded lip, content-sized up to 85vh), notification trays from the top. Its
close affordance is now a round ghost `ActionButton` instead of a full
secondary `Button` pill.

**`Navbar.Toggle` + `Navbar.Collapse`** own the mobile pattern: a round
burger button that morphs into an X in place, and a disclosure panel folding
out under the bar — `aria-expanded`/`aria-controls` and panel ids wired
automatically (no state at the call site). Pairs are linked by
`controls`/`id` (default `'menu'`), so a navbar can host several independent
panels — e.g. a search toggle and a burger — with one open at a time. Panels
unmount when closed. `Navbar` is now a Client Component (`'use client'`).

The stories use staged collapse (search needs `lg`, links `md`) so nothing
wraps awkwardly at mid widths.

```tsx
<Navbar sticky elevated fluid>
  <Navbar.Brand>…logo…</Navbar.Brand>
  <Navbar.Links>
    <Navbar.Link href="/" isCurrent>Dashboard</Navbar.Link>
  </Navbar.Links>
  <Navbar.Search><SearchField size="sm" … /></Navbar.Search>
  <Navbar.Spacer />
  <Navbar.Actions>…bell, user menu…</Navbar.Actions>
</Navbar>
```
