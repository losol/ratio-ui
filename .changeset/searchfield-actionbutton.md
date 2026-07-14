---
"@eventuras/ratio-ui": minor
---

**SearchField & ActionButton — sizes, a real clear button, round variant, and React Aria alignment.**

`SearchField`:

- **`size`** — `'sm' | 'md' | 'lg'` (default `md`); `sm` is the compact
  variant for sidebars and toolbars (the "Filter types…" pattern).
- **The clear button now actually renders** — the docs always claimed one, but
  React Aria only wires a clear button when the field contains a button. It's
  an `ActionButton round` hooked up automatically through React Aria's
  ButtonContext, shown only while the field has content (Escape still clears).
- More React Aria surface: `onClear`, `name`, `autoFocus`, plus `testId`.
- **Visual change:** `md`/`lg` now match Button's heights (~38px/~50px) instead
  of the chunky `p-4` + `border-2` form default, so a SearchField sits level
  with buttons in the same toolbar row.
- New `FilterNavigation` story shows the sidebar pattern: a small SearchField
  live-filtering a `NavTree`.

`ActionButton`:

- **Rebuilt on React Aria's `Button`** — unified press handling and RAC
  context participation (which is what powers the SearchField clear button).
  `onPress` and `isDisabled` are available; `onClick`/`disabled` keep working.
- **`round`** — fully circular chrome for burger/bell buttons and clear-X
  affordances.
- **The `subtle` look is now the default** (card-toned chrome); the former
  transparent default is available as `variant="ghost"`, and the `subtle`
  variant name is gone (beta). Token-scoped consumers (Console, CodeBlock)
  re-skin via `--action-button-*` and are unaffected.
- **Fixed: icon + plain-text buttons lost their horizontal padding.** The
  CSS-based icon-only check (`:only-child`) doesn't see text nodes, so
  `<Pause /> Pause` was treated as icon-only and rendered flush. Icon-only
  detection is now element-based; icon-only buttons still stay square.
- Now a Client Component (`'use client'`), as required by React Aria.

Also exports `Bell`, `Pause`, and `Play` icons, and the ActionButton stories are consolidated to five scriptorium-themed examples.
