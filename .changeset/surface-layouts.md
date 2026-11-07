---
'@eventuras/ratio-ui': minor
---

`Surface` (beta), at `@eventuras/ratio-ui/shelf`: where the things from a `Shelf` land, in three layouts. `Surface.Column` is one ordered column with an insertion line; `Surface.Rows` is a column of rows with item widths in twelfths, where a drop between rows makes a new row and a drop beside an item splits its row, wrapping to one column below `md`; `Surface.Grid` is `columns × rows` cells of `cell` pixels, where items snap to cells, never overlap, and keep their cell positions when the grid or cell size changes, with optional corner dots (`showCells`).

Each layout shares one frame: a drop zone with an empty state, one selected item, the keyboard (arrow keys select; Enter picks up, arrow keys move, Enter drops, Escape puts back; Delete removes), pointer drags of items already on it, focus on the item just added from a shelf however it came, an optional undo/redo toolbar over the app's own stack (`history`), and a live region in the app's words (`labels`). The app keeps the list: every change goes to `onChange`, and `onDrop` can refuse a tile. `findFreeCell` and `nextRow` help place a tapped tile.

`Shelf.Tile` takes an optional `size` (`{ w, h }`), handed on as `item.size`, so a grid knows a drop's footprint before it lands. The icon set gains `Undo2` and `Redo2`.
