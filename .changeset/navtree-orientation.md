---
"@eventuras/ratio-ui": minor
---

**NavTree: horizontal orientation, accent active marker, and a content slot.**

- **`orientation="horizontal"`** — the top-level items as a tab row with an
  accent underline on the active item (the navbar nav-row form, per the
  design's navbar spec). Groups flatten and nesting isn't rendered.
- **Visual change:** the vertical active row now uses the accent (Ochre)
  tint with a 3px accent bar — the same "current" marker as Menu — replacing
  the primary tint.
- **`NavTreeItem.content`** — render arbitrary JSX as an item (no row
  chrome), e.g. a compact `SearchField` living inside a group and filtering
  its siblings. Composed from the call site; NavTree stays in `core`.
  Hidden in `iconOnly` and `horizontal` modes.
