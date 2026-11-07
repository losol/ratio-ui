# Shelf

A palette of things to pull onto a work surface: field types onto a form,
code blocks onto a line, parts onto a bench. Tiles sit in titled groups; the
surface, made with `useShelfSurface`, decides what an added thing does and
where it goes. The shelf only reports; undo belongs to the surface.

```tsx
import { Shelf, useShelfSurface } from '@eventuras/ratio-ui/shelf';

<Shelf aria-label="Parts" onAdd={(item, via) => add(item, via)}>
  <Shelf.Group title="Sources">
    <Shelf.Tile id="battery" name="Battery" picture={<BatteryIcon />} />
  </Shelf.Group>
  <Shelf.Group title="Loads">
    <Shelf.Tile id="lamp" name="Lamp" picture={<LampIcon />} count={2} />
    <Shelf.Tile id="motor" name="Motor" picture={<MotorIcon />} locked="Unlocks in «Two lamps»" />
  </Shelf.Group>
</Shelf>;

// The surface registers itself and learns where a drop lands, in its own coordinates.
const { surfaceProps, over } = useShelfSurface({
  onDrop: (item, point) => place(item, snap(point)),
});
<div {...surfaceProps}>…{over && <Marker item={over.item} at={over.point} />}</div>;
```

## Three ways in, all equal

1. **Drag** a tile onto a surface. A ghost of the tile follows the pointer;
   the surface under it gets a dashed `--border-2` edge (`data-shelf-over`).
   A drop outside any surface cancels, as does Escape during the drag or a
   surface's `onDrop` returning `false`.
2. **Tap** a tile. The surface adds it at its own sensible place: the end
   of the form, the current line, a free cell. A press that moves less than
   8px is a tap.
3. **Keyboard**: Tab to the tile, Enter or Space adds it as a tap does. The
   surface should then move focus to the added thing, so the arrow keys can
   move it.

Each add fires `onAdd(item, via)` once, `via` being `'drag'`, `'tap'` or
`'keyboard'`; for a drag it fires after the surface's `onDrop`. Adds,
cancels and presses on a locked tile are read out by a live region, in the
words of `labels`.

Pointer events only, one pointer at a time: no drag-and-drop library and no
HTML5 drag and drop, which is unreliable on touch. On touch, a sideways
swipe scrolls a tray (an up-and-down one scrolls a rail); a press heading
the other way drags.

## Props

### `Shelf`

- `shape` — `'auto'` (default: a rail from `lg`, a tray below), `'rail'` or `'tray'`
- `tile` — `'stacked'` (picture over the name) or `'inline'` (picture to the
  left); by default stacked in a rail and inline in a tray
- `onAdd(item, via)` — `item` is `{ id, name }`, plus `size` when the tile gives one
- `labels` — `added(item, via)`, `cancelled(item)`, `locked(item, reason)`,
  `count(n)`; each falls back to English
- `aria-label` / `aria-labelledby`, `className`, `testId`

### `Shelf.Group`

- `title` — shown over the tiles and names the group

### `Shelf.Tile`

- `id`, `name` — what `onAdd` and `onDrop` hand back; `name` is also shown and spoken
- `picture` — an icon from the set or an illustration of the app's own
- `count` — how many are left, shown with `labels.count`; display only, so
  pass `locked` when none are left
- `locked` — why it cannot be added yet. The tile stays visible, dimmed
  with a lock, is `aria-disabled`, and says why on hover and focus
- `children` — a layout of the tile's own in place of picture, name and count
- `size` — `{ w, h }`, the footprint the thing takes on a grid, in cells. It
  travels with the item (`item.size`), so a `Surface.Grid` knows where a
  drop fits before it lands

### `useShelfSurface({ onDrop })`

- `onDrop(item, point)` — `point` is in the surface's own coordinates, from
  its top-left inner corner with its scroll included. Return `false` to
  refuse the drop.
- Returns `surfaceProps` to spread on the surface element (it carries a
  `ref`; merge it if you need your own) and `over`, `{ item, point }` while
  a drag hovers the surface, else `null`, for a ghost or an insertion line
  of the surface's own.

Surfaces are found by where they are on screen, so a surface can sit
anywhere in the tree, beside the shelf rather than inside it.

## Look

Tiles are small cards (`--card`, `--border-1`, `--radius`), at least 44px
tall. The ghost lifts with `--card-shadow-md`; locked tiles use
`--text-subtle` and the lock icon. A tray fades the edge that has more
beyond it. The lift is the only motion, and `data-motion="none"` or
reduced motion stops it. `--shelf-rail-width` sets the rail's width
(default `14rem`).

# Surface

Where the things from a shelf land. `Surface` wraps `useShelfSurface` in
the frame every surface needs, in three layouts; what a field, a code line
or a lamp looks like stays with the app (`renderItem`).

```tsx
import { Shelf, Surface, findFreeCell } from '@eventuras/ratio-ui/shelf';

<Surface.Grid
  aria-label="Bench"
  columns={32}
  rows={16}
  cell={24}
  showCells
  items={parts} // { id, kind, at: { col, row }, size: { w, h } }
  renderItem={(part, state) => <Part part={part} selected={state.selected} />}
  onChange={setParts}
  onDrop={(item, at) => allowed(item, at)} // false refuses
  empty="Drag a part here from the shelf"
  history={{ canUndo, canRedo, onUndo, onRedo }}
/>;

<Surface.Rows
  aria-label="Form"
  items={fields} // { id, kind, row, width }, width in twelfths
  renderItem={(field, state) => <FieldCard field={field} {...state} />}
  onChange={setFields}
/>;
```

The surface never changes `items` itself: every add, move and removal
hands the new list to `onChange`, so undo is the app's stack.

## The frame

- **A drop zone.** A drag from a shelf over it gets the dashed `--border-2`
  edge, and an insertion line (column, rows) or the dropped thing's
  footprint (grid, red when it does not fit) shows where it would land.
  `empty` is shown while nothing is on it.
- **One selected item.** Tab reaches the surface (the selected item, else
  the first); the arrow keys move the selection, Home and End go to the
  ends. Enter or Space picks the item up, the arrow keys then move it one
  unit at a time, Enter drops it and Escape puts it back. Delete or
  Backspace removes it. A pick-up commits once, on Enter, so one move is
  one undo step. Items can also be dragged with a pointer; on touch a
  press must rest 300ms before it drags, so a quick swipe still scrolls.
  A press on an `input`, `textarea`, `select`, a contenteditable or an
  element with `data-surface-nodrag` inside an item does not drag, and keys
  pressed in those stay theirs.
- **Focus follows an add.** The item just added from a shelf is selected
  and focused, whether it came by a drag, a tap or a key. A drop the
  surface places itself; for a tap or a key the app adds the item from
  the shelf's `onAdd` (with `findFreeCell` or `nextRow` for a sensible
  place), and the surface focuses the new item that appears.
- **History.** With `history` (`{ canUndo, canRedo, onUndo, onRedo }`) the
  surface shows undo and redo buttons and takes Ctrl/⌘+Z, and
  Ctrl/⌘+Shift+Z or Ctrl+Y.
- **Announced.** A live region reads out adds, moves, removals, refusals,
  pick-ups and put-backs in the words of `labels`. The shelf reads an add
  out too; give one of them `added: () => ''` to say it once.

## Layouts

### `Surface.Column`

One ordered column; the order is the array order. Items are
`{ id, kind, …yours }`. A drop goes into the gap the pointer is in; the
arrow keys move a picked-up item up or down.

### `Surface.Rows`

A column of rows; each row holds items side by side, with `width` in
twelfths (1–12; 12, 6, 4 and 8 are the usual). Items are
`{ id, kind, row, width, …yours }`; rows go by `row`, items in a row by
array order. The surface renumbers rows 0, 1, 2… whenever it changes them.

- A drop between rows, or near a row's top or bottom edge, makes a new
  row at full width.
- A drop beside an item splits its row: the newcomer takes an equal share
  (6 of 12 beside one, 4 beside two) and the others narrow in proportion
  to fit twelve. The row an item leaves widens again to fill twelve. A
  move within a row keeps the widths. A row holds at most twelve items.
- Left and right swap a picked-up item with its neighbour. Up and down:
  an item that shares its row steps out into a row of its own; an item
  alone in its row joins the row above or below, at its end.
- Below `md` (48rem) every row wraps to one column, in reading order.

### `Surface.Grid`

`columns × rows` cells of `cell` pixels. Items are
`{ id, kind, at: { col, row }, size: { w, h }, …yours }`, all in cell
units, so changing `columns`, `rows` or `cell` keeps every position.

- A drop snaps the footprint, centred on the pointer, to cells, inside the
  grid. The footprint is the tile's `size`, else `itemSize` (default
  `{ w: 1, h: 1 }`).
- A drop or a move onto an occupied cell, or past the edge, is refused.
- The arrow keys choose the nearest item that way; once an item is picked
  up they move it one cell at a time.
- `showCells` draws a dot at each cell corner, where connection points sit.
- A grid larger than its box scrolls inside it; `--surface-grid-max-height`
  sets the box's height (default `32rem`).
- Items are cell-sized, so the 44px minimum target is the app's to keep
  with its `cell` and sizes. Items that a smaller grid no longer holds are
  kept as they are, clipped; what to do with them is the app's call.

## Props

Shared by the three layouts:

- `items`, `renderItem(item, { selected, grabbed, dragging })`, `onChange(items)`
- `onDrop(shelfItem, place)` — return `false` to refuse a tile; `place` is
  `{ index }` (column), `{ row, index, newRow }` (rows) or `{ col, row }` (grid)
- `createItem(shelfItem, base)` — makes the item a dropped tile becomes.
  `base` has a fresh `id` (`lamp-1`), the tile's id as `kind`, and the
  place (`row` and `width`, or `at` and `size`). Default: `base` itself
- `empty` — shown while the surface is empty
- `labels` — `added(item, place)`, `moved(item, place)`, `removed(item)`,
  `refused(item)`, `picked(item, place)`, `cancelled(item, place)`,
  `instructions`, `undo`, `redo`; each falls back to English
- `history` — `{ canUndo, canRedo, onUndo, onRedo }`
- `selectedId` / `onSelect(id)` — a controlled selection
- `aria-label` / `aria-labelledby`, `className`, `testId`

`Surface.Grid` adds `columns`, `rows`, `cell`, `itemSize` and `showCells`.

Helpers for a tap: `findFreeCell(items, size, columns, rows)` (the first
free cell, reading order, or `null`) and `nextRow(items)` (the row number
below the rest).

## Look

The zone is a card (`--card`, `--border-1`, `--radius-lg`). The selected
item gets a `--primary` ring, keyboard focus adds `--focus-ring`, and a
picked-up item lifts with `--card-shadow-md`. Toolbar buttons are 44px
square. The lift is the only motion; `data-motion="none"` or reduced
motion stops it. Pointer events only: no drag-and-drop library and no HTML5
drag and drop.
