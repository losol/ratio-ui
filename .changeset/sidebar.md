---
"@eventuras/ratio-ui": minor
---

**Sidebar — the sticky aside chrome for admin consoles and docs shells.**

`layout/Sidebar` wraps the pattern previously hand-rolled around every
`NavTree`: fixed `width` (default 236px), sticky under the app header via
`top`, right hairline border, and a flex column with slots (same vocabulary as
`Drawer`):

- `Sidebar.Header` — pinned top (logo / workspace switcher)
- `Sidebar.Body` — the scrollable middle
- `Sidebar.Footer` — pinned bottom behind a hairline

```tsx
<Sidebar width={236} top={62} aria-label="Console">
  <Sidebar.Header>…logo…</Sidebar.Header>
  <Sidebar.Body>
    <NavTree groups={groups} currentPath={path} />
  </Sidebar.Body>
  <Sidebar.Footer>…theme toggle…</Sidebar.Footer>
</Sidebar>
```

**Icon rail:** `collapsed` (+ `collapsedWidth`, default 64) narrows the sidebar
with an animated width, and `NavTree` gains **`iconOnly`** — rows collapse to
centered icons with the title as accessible name and native tooltip, group
labels become hairlines, and nesting isn't rendered. One consumer-owned state
drives both.

Content-agnostic and deliberately thin: hide it on small screens
(`className="hidden lg:flex"`) and reuse the same nav inside a `Drawer` — the
stories show the pairing. Also exports `MenuIcon` (burger).
