---
"@eventuras/ratio-ui": minor
---

**NavTree: `defaultOpen` on branches and `defaultExpandedDepth` on the tree.**

- `{ title: 'Resources', defaultOpen: true, … }` — one branch starts expanded
  without containing the current page.
- `defaultExpandedDepth={1}` — every top-level branch starts expanded
  (`Infinity` opens everything).

Both share the active branch's semantics: the user's toggle wins until
`currentPath` changes, then the defaults re-assert — and the chevron's first
click now collapses a branch that's open via a default (the toggle shares the
derived base).

`NavTreeItem` is now a union (`NavTreeLinkItem | NavTreeContentItem`):
regular rows keep a required `title` — the accessible name — while `content`
items may omit it, so no more placeholder `title: ""`. Mixing `content` with
row props (`href`, `icon`, `children`, …) is now a type error instead of
being silently ignored.

The `LinkComponent` prop type now declares everything NavTree actually passes
(`style` for the depth indent, `aria-current`, rail `aria-label`/`title`) —
adapters that only forward `className` silently lose the indent and the
active/rail semantics, so spread the rest: `({ href, ...rest }) => <Link
to={href} {...rest} />`.
