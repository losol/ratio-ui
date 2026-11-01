---
'@eventuras/ratio-ui': minor
---

New `RowTable` (beta) in `@eventuras/ratio-ui/core/RowTable`: the list of an admin overview, one row per item with column definitions (`header`, `render`, `width`, `hideBelow`, `align`). `rowHref` makes every row a link through an overlay on the first cell, with a hover background and a chevron; `empty` takes the rows' place. Built as a grid with ARIA table roles, so the rows stack below `stackBelow` while the header stays readable to screen readers.
