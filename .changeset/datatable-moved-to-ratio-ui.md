---
'@eventuras/datatable': patch
---

Moved into `losol/ratio-ui`. The package consumes `@eventuras/ratio-ui` from the
workspace again rather than from npm — which supersedes the note on 0.5.29, where
that entry described the arrangement while datatable still lived in
`losol/eventuras`. It no longer depends on `@eventuras/ratio-ui-next` at all.

Alongside the move:

- Column headers declare `scope="col"`, so screen readers announce them as
  column headers while navigating the grid.
- The client-side page-size effect now re-runs when `pageSize` or
  `clientsidePagination` change, instead of only on mount — page size no longer
  goes stale when those props change.
