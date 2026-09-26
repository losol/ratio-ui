---
"@eventuras/ratio-ui": minor
---

`Pagination` takes `labels` to translate its text: `navigation`, `previous`,
`next` and `status` (a function of the current and total page numbers). Each falls
back to the English default. The root is now a `<nav>` landmark, named by
`labels.navigation` (default "Pagination"). `PaginationProps` and
`PaginationLabels` are exported.
