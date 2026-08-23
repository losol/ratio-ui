---
"@eventuras/datatable": minor
---

**Breaking:** upgrades to TanStack Table v9. The peer dependencies now require
`@tanstack/react-table`, `@tanstack/table-core` and
`@tanstack/match-sorter-utils` at `^9.0.0`; a consumer still on v8 must
upgrade with this release.

v9 is a rewrite rather than a version bump — features are opt-in, row models
moved into feature slots, and the shared types carry the feature set as their
first type argument. This package now registers exactly what it uses: column
and global filtering, client pagination, expandable rows, and column
visibility (the last one because v8 bundled it, so callers could always hide
columns through the `state` escape hatch).

What this means for callers:

- `createColumnHelper<Row>()` is unchanged. It is now this package's own
  helper, bound to the registered features, so you don't have to name them.
- The feature set is exported as `dataTableFeatures`, with `DataTableFeatures`
  and `DataTableRow<T>` types for naming a row or state type.
- `state` is now `Partial<TableState<DataTableFeatures>>`.
- The `TableState` re-export is gone — v9's `TableState` needs the feature
  set, so import it from `@tanstack/react-table` with `DataTableFeatures`.
- Everything else — `columns`, `data`, search, pagination, `expanded`,
  `onRowClick`, `emptyState`, `rowCountLabel` — behaves as before.
