---
"@eventuras/datatable": minor
---

`DataTable` renders through Ratio UI's `Table` instead of hardcoded Tailwind
grays, so hairlines, header tone and cell rhythm come from the theme's tokens
and the table tracks light/dark with the rest of the page. The zebra striping
(`even:bg-gray-50 dark:odd:bg-gray-900`) is gone — rows are separated by the
theme's hairline, as everywhere else in the design system.

New props for the admin-list patterns the component was missing:

- `expanded` / `onExpandedChange` — controlled expansion, mirroring TanStack.
  `expanded={true}` unfolds every row, so a toolbar switch can drive the
  density of a long list. Uncontrolled, the table still keeps one row open at
  a time; `expansionMode="multiple"` lifts that.
- `onRowClick` — the pointer convenience an admin list is expected to have.
  Clicks that land on a control inside the row (a link, the expander) stay
  with that control, and the row is deliberately not focusable: keep the real
  destination in a cell for keyboard and screen-reader users.
- `emptyState` — shown in place of the rows when nothing matches, with the
  header left standing so columns don't jump.
- `rowCountLabel` — a count under the table, e.g. `7 of 51 rows`. The same
  numbers reach `renderToolbar` as a second argument.

`DataTable` is now generic in its row type — inferred from `data`, so
`onRowClick`, `renderSubComponent` and `getRowCanExpand` are typed instead of
`any`. `DataTableProps` and `DataTableExpansionMode` are exported.
