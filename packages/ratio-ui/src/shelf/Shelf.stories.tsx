// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  Battery,
  CheckSquare,
  Calendar,
  Fan,
  Gauge,
  Heading as HeadingIcon,
  Lightbulb,
  List,
  Mail,
  ToggleLeft,
  Type,
} from 'lucide-react';

import { Shelf, useShelfSurface, type ShelfItem, type ShelfVia } from './index';

const meta: Meta<typeof Shelf> = {
  title: 'Shelf/Shelf (Beta)',
  component: Shelf,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The parts of the electricity lab, two of them still locked. */
function Parts({ lampsLeft = 2 }: { lampsLeft?: number }) {
  return (
    <>
      <Shelf.Group title="Sources">
        <Shelf.Tile id="battery" name="Battery" picture={<Battery />} />
      </Shelf.Group>
      <Shelf.Group title="Control">
        <Shelf.Tile id="switch" name="Switch" picture={<ToggleLeft />} />
      </Shelf.Group>
      <Shelf.Group title="Loads">
        <Shelf.Tile id="lamp" name="Lamp" picture={<Lightbulb />} count={lampsLeft} />
        <Shelf.Tile id="motor" name="Motor" picture={<Fan />} locked="Unlocks in «Two lamps»" />
        <Shelf.Tile id="meter" name="Meter" picture={<Gauge />} locked="Unlocks in «Measure it»" />
      </Shelf.Group>
    </>
  );
}

/**
 * A rail beside the surface, the picture over the name. `auto` (the default
 * shape) is this from the `lg` breakpoint.
 */
export const RailStacked: Story = {
  args: { shape: 'rail', 'aria-label': 'Parts', onAdd: fn() },
  render: (args) => (
    <Shelf {...args}>
      <Parts />
    </Shelf>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Battery/ }));
    await expect(args.onAdd).toHaveBeenCalledWith({ id: 'battery', name: 'Battery' }, 'tap');
  },
};

/**
 * A tray along the bottom, the picture beside the name. It scrolls
 * sideways, and the edge with more beyond it fades. `auto` is this below
 * `lg`.
 */
export const TrayInline: Story = {
  args: { shape: 'tray', 'aria-label': 'Fields', onAdd: fn() },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Shelf {...args}>
        <Shelf.Group title="Text">
          <Shelf.Tile id="text" name="Text" picture={<Type />} />
          <Shelf.Tile id="email" name="E-mail" picture={<Mail />} />
        </Shelf.Group>
        <Shelf.Group title="Choice">
          <Shelf.Tile id="choice" name="Choice" picture={<List />} />
          <Shelf.Tile id="checkbox" name="Checkbox" picture={<CheckSquare />} />
          <Shelf.Tile id="date" name="Date" picture={<Calendar />} />
        </Shelf.Group>
        <Shelf.Group title="Layout">
          <Shelf.Tile id="heading" name="Heading" picture={<HeadingIcon />} />
        </Shelf.Group>
      </Shelf>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'E-mail' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAdd).toHaveBeenCalledWith({ id: 'email', name: 'E-mail' }, 'keyboard');
    await expect(args.onAdd).toHaveBeenCalledOnce();
  },
};

/**
 * Locked tiles stay on the shelf, dimmed with a lock, and say why on hover
 * and focus. Pressing one reads the reason out and adds nothing. A count
 * says how many are left.
 */
export const Locked: Story = {
  args: { shape: 'rail', tile: 'inline', 'aria-label': 'Parts', onAdd: fn() },
  render: (args) => (
    <Shelf {...args}>
      <Parts />
    </Shelf>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const motor = canvas.getByRole('button', { name: /Motor/ });
    await expect(motor).toHaveAttribute('aria-disabled', 'true');
    await expect(motor).toHaveAccessibleDescription('Unlocks in «Two lamps»');
    await userEvent.click(motor);
    await expect(args.onAdd).not.toHaveBeenCalled();
    await waitFor(() => expect(canvas.getByText('Motor is locked. Unlocks in «Two lamps»')).toBeInTheDocument());
  },
};

// --- A bench: a surface that places what comes, by any of the three ways. --

const CELL = 72;
const COLS = 6;
const ROWS = 4;

interface Placed {
  key: number;
  item: ShelfItem;
  col: number;
  row: number;
}

const PICTURES: Record<string, ReactNode> = {
  battery: <Battery />,
  switch: <ToggleLeft />,
  lamp: <Lightbulb />,
};

/**
 * The bench snaps a dropped part to its grid; a tap or Enter puts it in
 * the first free cell and moves focus to it, so the arrow keys could take
 * over from there. The log under it says which way each part came.
 */
function BenchDemo({ onAdd }: { onAdd?: (item: ShelfItem, via: ShelfVia) => void }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const next = useRef(0);
  const focusKey = useRef<number | null>(null);
  const cells = useRef(new Map<number, HTMLButtonElement>());

  const taken = (col: number, row: number) => placed.some((p) => p.col === col && p.row === row);
  const put = (item: ShelfItem, col: number, row: number) => {
    const key = next.current++;
    setPlaced((prev) => [...prev, { key, item, col, row }]);
    return key;
  };

  const { surfaceProps, over } = useShelfSurface({
    onDrop: (item, point) => {
      const col = Math.min(COLS - 1, Math.max(0, Math.floor(point.x / CELL)));
      const row = Math.min(ROWS - 1, Math.max(0, Math.floor(point.y / CELL)));
      // A cell holds one part: a drop on a taken one is refused, and cancels.
      if (taken(col, row)) return false;
      put(item, col, row);
    },
  });

  useEffect(() => {
    if (focusKey.current === null) return;
    cells.current.get(focusKey.current)?.focus();
    focusKey.current = null;
  });

  const add = (item: ShelfItem, via: ShelfVia) => {
    onAdd?.(item, via);
    setLog((prev) => [`${item.name} via ${via}`, ...prev].slice(0, 5));
    if (via === 'drag') return;
    for (let i = 0; i < COLS * ROWS; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      if (!taken(col, row)) {
        focusKey.current = put(item, col, row);
        return;
      }
    }
  };

  const lampsLeft = 2 - placed.filter((p) => p.item.id === 'lamp').length;
  const hover = over ? { col: Math.floor(over.point.x / CELL), row: Math.floor(over.point.y / CELL) } : null;

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <Shelf
        aria-label="Parts"
        onAdd={add}
        labels={{
          added: (item) => `${item.name} put on the bench.`,
          cancelled: (item) => `${item.name} back on the shelf.`,
          count: (n) => `${n} left`,
        }}
      >
        <Shelf.Group title="Sources">
          <Shelf.Tile id="battery" name="Battery" picture={<Battery />} />
          <Shelf.Tile id="switch" name="Switch" picture={<ToggleLeft />} />
        </Shelf.Group>
        <Shelf.Group title="Loads">
          {lampsLeft > 0 ? (
            <Shelf.Tile id="lamp" name="Lamp" picture={<Lightbulb />} count={lampsLeft} />
          ) : (
            <Shelf.Tile id="lamp" name="Lamp" picture={<Lightbulb />} count={0} locked="No lamps left" />
          )}
          <Shelf.Tile id="motor" name="Motor" picture={<Fan />} locked="Unlocks in «Two lamps»" />
        </Shelf.Group>
      </Shelf>
      <div className="flex min-w-0 flex-col gap-2">
        <div
          {...surfaceProps}
          data-testid="bench"
          aria-label="Bench"
          role="group"
          className="relative overflow-hidden rounded-lg border border-border-1 bg-card"
          style={{
            width: CELL * COLS,
            maxWidth: '100%',
            height: CELL * ROWS,
            backgroundImage:
              'linear-gradient(var(--border-1) 1px, transparent 1px), linear-gradient(90deg, var(--border-1) 1px, transparent 1px)',
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        >
          {hover && (
            <span
              aria-hidden
              className="absolute rounded-md bg-(--primary) opacity-20"
              style={{ left: hover.col * CELL, top: hover.row * CELL, width: CELL, height: CELL }}
            />
          )}
          {placed.map((p) => (
            <button
              key={p.key}
              type="button"
              ref={(el) => {
                if (el) cells.current.set(p.key, el);
                else cells.current.delete(p.key);
              }}
              aria-label={`${p.item.name}, column ${p.col + 1}, row ${p.row + 1}`}
              className="absolute flex items-center justify-center rounded-md border border-border-2 bg-card text-(--primary)"
              style={{ left: p.col * CELL + 6, top: p.row * CELL + 6, width: CELL - 12, height: CELL - 12 }}
            >
              {PICTURES[p.item.id]}
            </button>
          ))}
        </div>
        <ol data-testid="log" className="m-0 list-none p-0 text-sm text-(--text-muted)">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Dispatches a pointer event the way a mouse would. */
function pointer(target: EventTarget, type: string, x: number, y: number) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      clientX: x,
      clientY: y,
    }),
  );
}

/**
 * The three ways in, side by side: drag a part onto the bench (it snaps to
 * a cell; a drop off the bench, on a taken cell, or Escape cancels), tap
 * one, or Tab to one and press Enter. A rail from `lg`, a tray below.
 */
export const Bench: Story = {
  args: { onAdd: fn() },
  render: (args) => <BenchDemo onAdd={args.onAdd} />,
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shelf = within(canvas.getByRole('group', { name: 'Parts' }));
    const log = () => canvas.getByTestId('log');

    await step('Tap adds', async () => {
      await userEvent.click(shelf.getByRole('button', { name: /Battery/ }));
      await expect(args.onAdd).toHaveBeenLastCalledWith({ id: 'battery', name: 'Battery' }, 'tap');
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Battery, column 1, row 1' })).toHaveFocus());
    });

    await step('Enter adds', async () => {
      shelf.getByRole('button', { name: /Switch/ }).focus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onAdd).toHaveBeenLastCalledWith({ id: 'switch', name: 'Switch' }, 'keyboard');
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Switch, column 2, row 1' })).toBeInTheDocument());
    });

    await step('Dragging onto the bench drops at the pointer', async () => {
      const lamp = shelf.getByRole('button', { name: /Lamp/ });
      const from = lamp.getBoundingClientRect();
      const bench = canvas.getByTestId('bench').getBoundingClientRect();
      const x0 = from.left + from.width / 2;
      const y0 = from.top + from.height / 2;
      // The middle of the bench's fourth column, third row.
      const x = bench.left + CELL * 3.5;
      const y = bench.top + CELL * 2.5;
      pointer(lamp, 'pointerdown', x0, y0);
      pointer(window, 'pointermove', x0 + 20, y0 + 20);
      pointer(window, 'pointermove', x, y);
      await waitFor(() => expect(canvas.getByTestId('bench')).toHaveAttribute('data-shelf-over'));
      pointer(window, 'pointerup', x, y);
      await expect(args.onAdd).toHaveBeenLastCalledWith({ id: 'lamp', name: 'Lamp' }, 'drag');
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Lamp, column 4, row 3' })).toBeInTheDocument());
      await expect(log()).toHaveTextContent('Lamp via drag');
    });

    await step('Escape cancels a drag', async () => {
      const calls = (args.onAdd as ReturnType<typeof fn>).mock.calls.length;
      const battery = shelf.getByRole('button', { name: /Battery/ });
      const from = battery.getBoundingClientRect();
      const bench = canvas.getByTestId('bench').getBoundingClientRect();
      pointer(battery, 'pointerdown', from.left + 10, from.top + 10);
      pointer(window, 'pointermove', bench.left + CELL * 5.5, bench.top + CELL * 3.5);
      await userEvent.keyboard('{Escape}');
      pointer(window, 'pointerup', bench.left + CELL * 5.5, bench.top + CELL * 3.5);
      await expect((args.onAdd as ReturnType<typeof fn>).mock.calls.length).toBe(calls);
      await expect(canvas.getByTestId('bench')).not.toHaveAttribute('data-shelf-over');
    });
  },
};
