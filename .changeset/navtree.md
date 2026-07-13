---
"@eventuras/ratio-ui": minor
---

**NavTree — hierarchical navigation for sidebars, succeeding `TreeView`.**

`TreeView` grew into `NavTree` (`core/NavTree`), built for admin-console
sidebars and docs navigation alike:

- **Groups with eyebrow labels** — `groups={[{ label: 'Workspace', items }]}`
  renders uppercase section labels between item lists; the ungrouped `items`
  form still works.
- **Per-item icons** — `icon: <Database size={18} />` renders a leading icon.
- **Composable labels & adornments** — `title` is a `ReactNode` (compose
  `<Chip.Dot />`, logos, `<Kbd>`), and `trailing` renders a right-aligned
  adornment such as a count `<Chip>` or a live dot. An optional `id` provides
  the list key when `title` isn't a plain string.
- **Split branch rows** — a branch with an `href` now renders the label as a
  link and the chevron as a separate toggle (replacing the old auto-injected
  "Overview" child link).
- Active row uses the primary-100/900 tint with `aria-current="page"`, rows
  get visible `focus-visible` rings, and `currentPath` still auto-expands
  ancestors.

`TreeView` remains as a **deprecated alias** (`tree` maps to `items`) and will
be removed in a future major:

```tsx
// before
<TreeView tree={nodes} currentPath={path} />
// after
<NavTree items={nodes} currentPath={path} />
```

Also exports a handful of new icons (`LayoutGrid`, `Database`, `ShieldCheck`,
`ScrollText`, `Telescope`, `FlaskConical`, `Landmark`, `BookOpen`) and adds a
full-page **Admin Console** demo story (`Pages/Admin Console`) composing
NavTree, ValueTile, Badge, and Console.
