---
"@eventuras/ratio-ui": minor
---

New `EmptyState` in `core/` — what a list, table or panel shows when it holds
nothing. Covers the two cases that look alike and read differently: nothing
created yet (offer the action that fills it), or a filter that matched nothing
(say so, or the reader concludes the list is broken). `title` is required;
`icon`, `description` and `action` are optional.

`size="sm"` is the row inside a list or table, `md` (default) the panel filling
a card. DOM attributes reach the root, so a filter-driven empty state can carry
`role="status"`; nothing is announced by default.
