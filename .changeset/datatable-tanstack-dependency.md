---
"@eventuras/datatable": minor
---

TanStack Table is now a dependency, not a peer. `@tanstack/react-table` and
`@tanstack/match-sorter-utils` come with the package at the range it is built
and tested against, so a 9.x older than that can no longer be installed next
to it; `@tanstack/table-core` is gone from the list, since the package never
imports it and `react-table` already brings it.

New `DataTableColumnDef<TData>` type — `ColumnDef` bound to this table's
features — so column arrays can be typed without importing TanStack, and
`columns` is now typed with it instead of `any[]`: columns built for a
different row type than `data` are a type error. Apps can drop their own
TanStack dependencies; keeping them does no harm, as a compatible version
resolves to the same copy.
