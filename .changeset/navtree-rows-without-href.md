---
'@eventuras/ratio-ui': patch
---

Fix `NavTree` rows without an `href` rendering as `<a href="#">`.

`href` is documented as optional — "omit on a branch to make the whole row a collapse toggle" — and a row can legitimately have no destination: a folder that groups pages without being one, a section heading, the empty state in NavTree's own `GroupFilter` story (`{ id: 'empty', title: 'No works match.' }`).

Two of the three render paths fell back to `href: node.href ?? '#'`: horizontal mode, and vertical leaf rows. Both produced a row that looks like a link, is announced as a link, and on click jumps to the top of the page and pushes a history entry. Reported from a documentation site where every folder-without-a-page in the sidebar read as a dead link.

Both now render a `<span>` with the same row chrome and `cursor-default`, matching what the icon rail already did. Vertical *branches* without `href` are unchanged — they were already a `<button aria-expanded>` toggle, which is the right affordance.

Rows that carry an `href` are untouched, so nothing that navigated before navigates differently.

Added a `RowsWithoutDestination` story with a play test covering all three shapes: a link row, a toggle branch, and a plain leaf. It fails against the old rendering.
