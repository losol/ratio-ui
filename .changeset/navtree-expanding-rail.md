---
"@eventuras/ratio-ui": minor
---

`NavTree` gains controlled expansion — `expandedKeys`, `defaultExpandedKeys`,
`onExpandedChange` (after React Aria's Tree) — and a `context` item that names
the record a branch is scoped to, with an optional close button. Together they
make the expanding rail: derive `expandedKeys` from the route and a record's
sections unfold under the list's branch, one at a time, matching the URL. See
the *Expanding rail* story. Uncontrolled trees behave as before.

`.surface-dark` / `.surface-light` are now complete theme contexts (text,
muted/subtle, borders, cards, brand, status), not just a `--text` flip. For
that to work the semantic `--color-*` aliases moved to `@theme inline`, so
`bg-card` compiles to `var(--card)` — a custom property resolves its `var()`
where it is declared, and the old `:root` alias ignored scoped overrides.
Palette scales are unchanged. If your own CSS read an alias directly
(`var(--color-card)`), switch to the token (`var(--card)`). `Footer`'s private
`.ratio-footer--dark` scope is gone; it uses `surface-dark`.

Dark-theme `--text-muted` / `--text-subtle` are retuned from Linen steps (tan
and olive on the cool surface) to low-chroma warm greys — `oklch(0.81 0.012 85)`
and `oklch(0.69 0.012 85)` — ≥ 5:1 on every dark surface.

`Users` joins the icon barrel.
