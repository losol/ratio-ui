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
- `onAdd(item, via)` — `item` is `{ id, name }`
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
