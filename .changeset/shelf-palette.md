---
'@eventuras/ratio-ui': minor
---

`Shelf` (beta), at `@eventuras/ratio-ui/shelf`: a palette of tiles to pull onto a work surface, such as field types onto a form or parts onto a bench. `Shelf.Group` titles a run of tiles; `Shelf.Tile` has a picture, a name, an optional count, and an optional `locked` reason that keeps it visible but dimmed and says why on hover and focus. It is a rail beside the surface from `lg` and a tray along the bottom below (`shape`), with tiles stacked or inline (`tile`).

Three ways in, all equal: drag a tile (a ghost follows the pointer, and a drop outside any surface or Escape cancels), tap it, or press Enter or Space on it. `onAdd(item, via)` reports each add once, and a live region reads adds and cancels out in the app's words (`labels`). `useShelfSurface({ onDrop })` makes any element a drop surface: it learns where a drop lands in its own coordinates, and `over` follows a drag across it. Pointer events only, one pointer at a time, with no drag-and-drop library.

The icon set gains `Lock`.
