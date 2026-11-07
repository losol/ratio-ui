import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Shelf,
  Surface,
  findFreeCell,
  type ShelfItem,
  type SurfaceGridItem,
  type SurfaceHistory,
  type SurfaceItem,
  type SurfaceRowsItem,
} from '../src/shelf';
import { fitWidths, rowsPlace, rowsRemove, rowsStep } from '../src/shelf/surfaceLayout';

// jsdom lays nothing out: the zone sits at 100,100–500,500 on screen, and
// each test says where its items are drawn, in screen pixels.
const ZONE = { left: 100, top: 100, width: 400, height: 400 };
let boxes: Record<string, { left: number; top: number; width: number; height: number }> = {};

/** Says where an item is drawn, for the mocked layout. */
function drawAt(id: string, box: { left: number; top: number; width: number; height: number }) {
  boxes[id] = box;
}

function rect({ left, top, width, height }: { left: number; top: number; width: number; height: number }): DOMRect {
  const r = { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height };
  return { ...r, toJSON: () => r } as DOMRect;
}

const original = HTMLElement.prototype.getBoundingClientRect;
beforeEach(() => {
  boxes = {};
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.classList.contains('surface-zone')) return rect(ZONE);
    const id = this.dataset.surfaceId;
    if (id && boxes[id]) return rect(boxes[id]);
    return original.call(this);
  };
});
afterEach(() => {
  HTMLElement.prototype.getBoundingClientRect = original;
  cleanup();
});

const pointer = { pointerId: 1, button: 0, isPrimary: true };
const said = () => document.querySelector('.surface [aria-live="polite"]')?.textContent?.trim();
const focusedId = () => (document.activeElement as HTMLElement | null)?.dataset.surfaceId;
const option = (id: string) => document.querySelector<HTMLElement>(`[data-surface-id="${id}"]`)!;

/** Drags the tile named `name` from the shelf and lets go at screen `x`,`y`. */
function dragTile(name: string | RegExp, x: number, y: number) {
  const tile = screen.getByRole('button', { name });
  fireEvent.pointerDown(tile, { ...pointer, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { ...pointer, clientX: x, clientY: y });
  fireEvent.pointerUp(window, { ...pointer, clientX: x, clientY: y });
}

function Tiles({ onAdd }: { onAdd?: (item: ShelfItem) => void }) {
  return (
    <Shelf aria-label="Parts" onAdd={(item, via) => via !== 'drag' && onAdd?.(item)}>
      <Shelf.Group title="Parts">
        <Shelf.Tile id="text" name="Text" />
        <Shelf.Tile id="lamp" name="Lamp" size={{ w: 2, h: 2 }} />
      </Shelf.Group>
    </Shelf>
  );
}

// --- Column ----------------------------------------------------------------

function ColumnDemo({
  start = [],
  spy,
  history,
}: {
  start?: SurfaceItem[];
  spy?: (items: SurfaceItem[]) => void;
  history?: SurfaceHistory;
}) {
  const [items, setItems] = useState<SurfaceItem[]>(start);
  // Each item 48px tall with 8px between, from the zone's top-left padding.
  items.forEach((item, i) => drawAt(item.id, { left: 112, top: 112 + i * 56, width: 376, height: 48 }));
  return (
    <>
      <Tiles onAdd={(tile) => setItems((prev) => [...prev, { id: `${tile.id}-tap`, kind: tile.id }])} />
      <Surface.Column
        aria-label="Form"
        items={items}
        history={history}
        renderItem={(item) => <span>{item.id}</span>}
        onChange={(next) => {
          spy?.(next);
          setItems(next);
        }}
        empty="Drag a field here"
        testId="form"
      />
    </>
  );
}

const abc = [
  { id: 'a', kind: 'text' },
  { id: 'b', kind: 'text' },
  { id: 'c', kind: 'text' },
];

describe('Surface', () => {
  it('shows the empty state, and describes the surface with it', () => {
    render(<ColumnDemo />);
    const list = screen.getByRole('listbox', { name: 'Form' });
    expect(list.getAttribute('tabindex')).toBe('0');
    expect(list.getAttribute('aria-describedby')).toContain(screen.getByText('Drag a field here').id);
  });

  it('adds a tile dropped from the shelf and moves focus to it', () => {
    const spy = vi.fn();
    render(<ColumnDemo spy={spy} />);
    dragTile('Text', 200, 150);
    expect(spy).toHaveBeenCalledWith([{ id: 'text-1', kind: 'text' }]);
    expect(focusedId()).toBe('text-1');
    expect(option('text-1').getAttribute('aria-selected')).toBe('true');
    expect(said()).toBe('text added, position 1.');
  });

  it('moves focus to an item added by a tap or Enter on the shelf', () => {
    render(<ColumnDemo start={abc} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Text' }), { key: 'Enter' });
    expect(focusedId()).toBe('text-tap');
    expect(said()).toBe('text added, position 4.');
  });

  it('drops between two items, where the pointer is', () => {
    const spy = vi.fn();
    render(<ColumnDemo start={abc} spy={spy} />);
    const tile = screen.getByRole('button', { name: 'Text' });
    fireEvent.pointerDown(tile, { ...pointer, clientX: 10, clientY: 10 });
    // Below a's middle (136), above b's (192): the gap after a.
    fireEvent.pointerMove(window, { ...pointer, clientX: 200, clientY: 170 });
    const line = document.querySelector<HTMLElement>('.surface-insert');
    expect(line?.style.top).toBe(`${(60 + 68) / 2}px`);
    fireEvent.pointerUp(window, { ...pointer, clientX: 200, clientY: 170 });
    expect(spy.mock.calls[0]![0].map((item: SurfaceItem) => item.id)).toEqual(['a', 'text-1', 'b', 'c']);
  });

  it('reorders by keyboard: Enter picks up, arrows move, Enter drops', () => {
    const spy = vi.fn();
    render(<ColumnDemo start={abc} spy={spy} />);
    const b = option('b');
    b.focus();
    fireEvent.keyDown(b, { key: 'Enter' });
    expect(b.hasAttribute('data-grabbed')).toBe(true);
    fireEvent.keyDown(option('b'), { key: 'ArrowUp' });
    expect(said()).toBe('text moved, position 1.');
    expect(spy).not.toHaveBeenCalled();
    fireEvent.keyDown(option('b'), { key: 'Enter' });
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0]![0].map((item: SurfaceItem) => item.id)).toEqual(['b', 'a', 'c']);
    expect(focusedId()).toBe('b');
  });

  it('puts a picked-up item back on Escape', () => {
    const spy = vi.fn();
    render(<ColumnDemo start={abc} spy={spy} />);
    option('a').focus();
    fireEvent.keyDown(option('a'), { key: ' ' });
    fireEvent.keyDown(option('a'), { key: 'ArrowDown' });
    fireEvent.keyDown(option('a'), { key: 'ArrowDown' });
    fireEvent.keyDown(option('a'), { key: 'Escape' });
    expect(spy).not.toHaveBeenCalled();
    expect([...document.querySelectorAll('[role="option"]')].map((el) => (el as HTMLElement).dataset.surfaceId)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(said()).toBe('text put back, position 1.');
  });

  it('moves the selection with the arrow keys', () => {
    render(<ColumnDemo start={abc} />);
    option('a').focus();
    fireEvent.keyDown(option('a'), { key: 'ArrowDown' });
    expect(focusedId()).toBe('b');
    fireEvent.keyDown(option('b'), { key: 'End' });
    expect(focusedId()).toBe('c');
    expect(option('c').getAttribute('tabindex')).toBe('0');
    expect(option('a').getAttribute('tabindex')).toBe('-1');
  });

  it('reorders by pointer drag', () => {
    const spy = vi.fn();
    render(<ColumnDemo start={abc} spy={spy} />);
    const c = option('c');
    fireEvent.pointerDown(c, { ...pointer, clientX: 200, clientY: 236 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 200, clientY: 120 });
    expect(option('c').hasAttribute('data-dragging')).toBe(true);
    fireEvent.pointerUp(window, { ...pointer, clientX: 200, clientY: 120 });
    expect(spy.mock.calls[0]![0].map((item: SurfaceItem) => item.id)).toEqual(['c', 'a', 'b']);
  });

  it('removes the selected item with Delete and selects the next', () => {
    const spy = vi.fn();
    render(<ColumnDemo start={abc} spy={spy} />);
    option('b').focus();
    fireEvent.keyDown(option('b'), { key: 'Delete' });
    expect(spy.mock.calls[0]![0].map((item: SurfaceItem) => item.id)).toEqual(['a', 'c']);
    expect(said()).toBe('text removed.');
    expect(focusedId()).toBe('c');
  });

  it('calls back from the undo toolbar and from Ctrl+Z', () => {
    const history = { canUndo: true, canRedo: false, onUndo: vi.fn(), onRedo: vi.fn() };
    render(<ColumnDemo start={abc} history={history} />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(history.onUndo).toHaveBeenCalledOnce();
    expect((screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement).disabled).toBe(true);
    option('a').focus();
    fireEvent.keyDown(option('a'), { key: 'z', ctrlKey: true });
    expect(history.onUndo).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(option('a'), { key: 'z', ctrlKey: true, shiftKey: true });
    expect(history.onRedo).not.toHaveBeenCalled();
  });

  it('refuses a drop its onDrop says no to', () => {
    const onChange = vi.fn();
    const onAdd = vi.fn();
    render(
      <>
        <Shelf aria-label="Parts" onAdd={onAdd}>
          <Shelf.Tile id="text" name="Text" />
        </Shelf>
        <Surface.Column aria-label="Form" items={[]} renderItem={() => null} onChange={onChange} onDrop={() => false} />
      </>,
    );
    dragTile('Text', 200, 150);
    expect(onChange).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
    expect(said()).toBe('Text cannot go there.');
  });
});

// --- Rows ------------------------------------------------------------------

function RowsDemo({ start, spy }: { start: SurfaceRowsItem[]; spy: (items: SurfaceRowsItem[]) => void }) {
  const [items, setItems] = useState(start);
  // Rows 48px tall, 8px apart; a row's 376px split by twelfths.
  let row = -1;
  let x = 0;
  items.forEach((item) => {
    if (item.row !== row) {
      row = item.row;
      x = 0;
    }
    const width = (376 * item.width) / 12;
    drawAt(item.id, { left: 112 + x, top: 112 + item.row * 56, width, height: 48 });
    x += width;
  });
  return (
    <>
      <Tiles />
      <Surface.Rows
        aria-label="Form"
        items={items}
        renderItem={(item) => <span>{item.id}</span>}
        onChange={(next) => {
          spy(next);
          setItems(next);
        }}
      />
    </>
  );
}

const names: SurfaceRowsItem[] = [
  { id: 'first', kind: 'text', row: 0, width: 6 },
  { id: 'last', kind: 'text', row: 0, width: 6 },
  { id: 'email', kind: 'text', row: 1, width: 12 },
];

const shape = (items: SurfaceRowsItem[]) => items.map((item) => `${item.row}:${item.id}:${item.width}`);

describe('Surface.Rows', () => {
  it('makes a new row for a drop between rows', () => {
    const spy = vi.fn();
    render(<RowsDemo start={names} spy={spy} />);
    // Row 0 ends at 160, row 1 starts at 168.
    dragTile('Text', 300, 164);
    expect(shape(spy.mock.calls[0]![0])).toEqual(['0:first:6', '0:last:6', '1:text-1:12', '2:email:12']);
    expect(focusedId()).toBe('text-1');
  });

  it('splits a row for a drop beside an item, the widths fitting twelve', () => {
    const spy = vi.fn();
    render(<RowsDemo start={names} spy={spy} />);
    // The right half of e-mail, in the middle of its row.
    dragTile('Text', 400, 192);
    expect(shape(spy.mock.calls[0]![0])).toEqual(['0:first:6', '0:last:6', '1:email:6', '1:text-1:6']);
  });

  it('splits a row of two into thirds', () => {
    const spy = vi.fn();
    render(<RowsDemo start={names} spy={spy} />);
    // The left half of first.
    dragTile('Text', 130, 136);
    expect(shape(spy.mock.calls[0]![0])).toEqual(['0:text-1:4', '0:first:4', '0:last:4', '1:email:12']);
  });

  it('moves an item out to a row of its own, and back, by keyboard', () => {
    const spy = vi.fn();
    render(<RowsDemo start={names} spy={spy} />);
    option('last').focus();
    fireEvent.keyDown(option('last'), { key: 'Enter' });
    fireEvent.keyDown(option('last'), { key: 'ArrowDown' });
    fireEvent.keyDown(option('last'), { key: 'Enter' });
    expect(shape(spy.mock.calls[0]![0])).toEqual(['0:first:12', '1:last:12', '2:email:12']);
    fireEvent.keyDown(option('last'), { key: 'Enter' });
    fireEvent.keyDown(option('last'), { key: 'ArrowDown' });
    fireEvent.keyDown(option('last'), { key: 'Enter' });
    expect(shape(spy.mock.calls[1]![0])).toEqual(['0:first:12', '1:email:6', '1:last:6']);
  });
});

describe('row rules', () => {
  it('fits widths to twelve by the largest remainder', () => {
    expect(fitWidths([6], 12)).toEqual([12]);
    expect(fitWidths([4, 4], 12)).toEqual([6, 6]);
    expect(fitWidths([8, 4], 8)).toEqual([5, 3]);
    expect(fitWidths([1, 1, 1, 1, 1], 12)).toEqual([3, 3, 2, 2, 2]);
  });

  it('widens the row an item leaves', () => {
    expect(shape(rowsRemove(names, 'first'))).toEqual(['0:last:12', '1:email:12']);
    const moved = rowsPlace(names, names[0]!, { row: 2, index: 0, newRow: true })!;
    expect(shape(moved)).toEqual(['0:last:12', '1:email:12', '2:first:12']);
  });

  it('swaps within a row and keeps the widths', () => {
    const wide = [
      { id: 'a', kind: 'x', row: 0, width: 8 },
      { id: 'b', kind: 'x', row: 0, width: 4 },
    ];
    expect(shape(rowsStep(wide, 'a', 'right')!)).toEqual(['0:b:4', '0:a:8']);
    expect(rowsStep(wide, 'a', 'left')).toBeNull();
  });
});

// --- Grid ------------------------------------------------------------------

function GridDemo({
  start,
  spy,
  columns = 8,
  rows = 6,
  cell = 20,
}: {
  start: SurfaceGridItem[];
  spy: (items: SurfaceGridItem[]) => void;
  columns?: number;
  rows?: number;
  cell?: number;
}) {
  const [items, setItems] = useState(start);
  items.forEach((item) =>
    drawAt(item.id, {
      left: 100 + item.at.col * cell,
      top: 100 + item.at.row * cell,
      width: item.size.w * cell,
      height: item.size.h * cell,
    }),
  );
  return (
    <>
      <Tiles />
      <Surface.Grid
        aria-label="Bench"
        columns={columns}
        rows={rows}
        cell={cell}
        showCells
        items={items}
        renderItem={(item) => <span>{item.kind}</span>}
        onChange={(next) => {
          spy(next);
          setItems(next);
        }}
      />
    </>
  );
}

const battery: SurfaceGridItem = { id: 'battery', kind: 'battery', at: { col: 0, row: 0 }, size: { w: 2, h: 1 } };

describe('Surface.Grid', () => {
  it('snaps a drop to cells, centred on the pointer, with the tile’s size', () => {
    const spy = vi.fn();
    render(<GridDemo start={[battery]} spy={spy} />);
    // 70,70 in the grid: a 2×2 footprint centred there starts at cell 3,3 (2.5 rounded).
    dragTile('Lamp', 170, 170);
    expect(spy.mock.calls[0]![0][1]).toEqual({ id: 'lamp-1', kind: 'lamp', at: { col: 3, row: 3 }, size: { w: 2, h: 2 } });
    expect(focusedId()).toBe('lamp-1');
    expect(said()).toBe('lamp added, column 4, row 4.');
  });

  it('shows the footprint while a drag hovers, and refuses an occupied cell', () => {
    const spy = vi.fn();
    const onAdd = vi.fn();
    render(
      <>
        <Shelf aria-label="More" onAdd={onAdd}>
          <Shelf.Tile id="motor" name="Motor" size={{ w: 2, h: 2 }} />
        </Shelf>
        <GridDemo start={[battery]} spy={spy} />
      </>,
    );
    const tile = screen.getByRole('button', { name: 'Motor' });
    fireEvent.pointerDown(tile, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 120, clientY: 120 });
    const footprint = document.querySelector<HTMLElement>('.surface-footprint')!;
    expect(footprint.hasAttribute('data-refused')).toBe(true);
    expect(footprint.style.width).toBe('40px');
    fireEvent.pointerUp(window, { ...pointer, clientX: 120, clientY: 120 });
    expect(spy).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
    expect(said()).toBe('Motor cannot go there.');
  });

  it('moves by one cell per arrow, and refuses a move onto an occupied cell', () => {
    const spy = vi.fn();
    const lamp = { id: 'lamp', kind: 'lamp', at: { col: 3, row: 0 }, size: { w: 1, h: 1 } };
    render(<GridDemo start={[battery, lamp]} spy={spy} />);
    option('lamp').focus();
    fireEvent.keyDown(option('lamp'), { key: 'Enter' });
    fireEvent.keyDown(option('lamp'), { key: 'ArrowLeft' });
    expect(said()).toBe('lamp moved, column 3, row 1.');
    fireEvent.keyDown(option('lamp'), { key: 'ArrowLeft' });
    expect(said()).toBe('lamp cannot go there.');
    fireEvent.keyDown(option('lamp'), { key: 'ArrowDown' });
    fireEvent.keyDown(option('lamp'), { key: 'Enter' });
    expect(spy.mock.calls[0]![0][1].at).toEqual({ col: 2, row: 1 });
  });

  it('keeps every position in cells when the grid or cell size changes', () => {
    const spy = vi.fn();
    const lamp = { id: 'lamp', kind: 'lamp', at: { col: 5, row: 4 }, size: { w: 1, h: 1 } };
    const { rerender } = render(<GridDemo start={[battery, lamp]} spy={spy} />);
    expect(option('lamp').style.left).toBe('100px');
    expect(screen.getByRole('listbox', { name: 'Bench' }).style.width).toBe('160px');
    rerender(<GridDemo start={[battery, lamp]} spy={spy} columns={32} rows={64} cell={24} />);
    expect(option('lamp').style.left).toBe('120px');
    expect(option('lamp').style.top).toBe('96px');
    expect(screen.getByRole('listbox', { name: 'Bench' }).style.height).toBe(`${64 * 24}px`);
    expect(spy).not.toHaveBeenCalled();
  });

  it('moves an item by pointer drag, snapped', () => {
    const spy = vi.fn();
    render(<GridDemo start={[battery]} spy={spy} />);
    // Held 10px into the battery, let go 85px right and 60px down.
    fireEvent.pointerDown(option('battery'), { ...pointer, clientX: 110, clientY: 110 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 195, clientY: 170 });
    fireEvent.pointerUp(window, { ...pointer, clientX: 195, clientY: 170 });
    expect(spy.mock.calls[0]![0][0].at).toEqual({ col: 4, row: 3 });
  });

  it('finds a free cell for a tap', () => {
    expect(findFreeCell([battery], { w: 2, h: 2 }, 8, 6)).toEqual({ col: 2, row: 0 });
    expect(findFreeCell([battery], { w: 9, h: 1 }, 8, 6)).toBeNull();
  });

  it('carries a tile’s size with the item it hands out', () => {
    const onAdd = vi.fn();
    render(
      <Shelf aria-label="Parts" onAdd={onAdd}>
        <Shelf.Tile id="lamp" name="Lamp" size={{ w: 2, h: 3 }} />
      </Shelf>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lamp' }), { detail: 1 });
    expect(onAdd).toHaveBeenCalledWith({ id: 'lamp', name: 'Lamp', size: { w: 2, h: 3 } }, 'tap');
  });
});
