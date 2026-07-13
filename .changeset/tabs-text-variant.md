---
"@eventuras/ratio-ui": minor
---

**Tabs — refreshed to a single chrome-less underline style, plus fixes.**

`Tabs` now has one look: a 2px active underline over a hairline rule, muted
inactive labels, and unframed panels (content sits directly on the surface).
The previous filled tab list with framed panels is gone.

**Visual change (no API change):** if you relied on the old filled look —
tinted tab fills and the panel's border/background — your tabs will now render
in the lighter underline style. Props are unchanged.

```tsx
<Tabs>
  <Tabs.Item title="View">…</Tabs.Item>
  <Tabs.Item title="JSON">…</Tabs.Item>
  <Tabs.Item title="XML">…</Tabs.Item>
</Tabs>
```

Also fixed and refreshed:

- **Fixed: items wrapped in a fragment rendered as one empty tab.**
  `React.Children.toArray` doesn't flatten `<>…</>`, so
  `<Tabs><>…items…</></Tabs>` produced a single unlabeled tab and no panel.
  Fragments are now unwrapped when collecting `Tabs.Item` children.
- **Focus is visible again:** tabs and the panel show a `--focus-ring` ring on
  keyboard focus (previously `outline-none` with no replacement).
- **`Tabs.Item` accepts `isDisabled`** — a disabled tab is skipped by pointer
  and keyboard.
- `Tabs` is now a Client Component (`'use client'`), as required by React Aria,
  and `className` applies to the tabs root instead of an extra wrapper `<div>`.
