// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Battery,
  Calendar,
  CheckSquare,
  Fan,
  Heading as HeadingIcon,
  Lightbulb,
  List,
  Mail,
  ToggleLeft,
  Type,
} from 'lucide-react';

import {
  Shelf,
  Surface,
  findFreeCell,
  nextRow,
  type ShelfItem,
  type SurfaceGridItem,
  type SurfaceHistory,
  type SurfaceItem,
  type SurfaceItemState,
  type SurfaceRowsItem,
} from './index';

const meta: Meta = {
  title: 'Shelf/Surface (Beta)',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/** A list the app keeps, with an undo stack: the surface only shows the buttons. */
function useHistory<T>(initial: T): [T, (next: T) => void, SurfaceHistory] {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });
  const set = (next: T) => setState((s) => ({ past: [...s.past, s.present], present: next, future: [] }));
  const history: SurfaceHistory = {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    onUndo: () =>
      setState((s) =>
        s.past.length === 0
          ? s
          : { past: s.past.slice(0, -1), present: s.past[s.past.length - 1]!, future: [s.present, ...s.future] },
      ),
    onRedo: () =>
      setState((s) =>
        s.future.length === 0 ? s : { past: [...s.past, s.present], present: s.future[0]!, future: s.future.slice(1) },
      ),
  };
  return [state.present, set, history];
}

/** An id for a new thing of `kind`, not yet in `items`: `text-1`, `text-2`… */
function idFor(kind: string, items: readonly SurfaceItem[]): string {
  let n = 1;
  while (items.some((item) => item.id === `${kind}-${n}`)) n++;
  return `${kind}-${n}`;
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

/** Drags `from` to the screen point `x`,`y` and lets go. */
async function dragTo(from: HTMLElement, x: number, y: number, zone: HTMLElement) {
  const box = from.getBoundingClientRect();
  const x0 = box.left + box.width / 2;
  const y0 = box.top + box.height / 2;
  pointer(from, 'pointerdown', x0, y0);
  pointer(window, 'pointermove', x0 + 20, y0 + 20);
  pointer(window, 'pointermove', x, y);
  await waitFor(() => expect(zone).toHaveAttribute('data-shelf-over'));
  pointer(window, 'pointerup', x, y);
}

// --- Form fields: a column, and rows ------------------------------------------

const FIELDS: Record<string, { name: string; picture: ReactNode }> = {
  text: { name: 'Text', picture: <Type /> },
  email: { name: 'E-mail', picture: <Mail /> },
  choice: { name: 'Choice', picture: <List /> },
  date: { name: 'Date', picture: <Calendar /> },
  checkbox: { name: 'Checkbox', picture: <CheckSquare /> },
  heading: { name: 'Heading', picture: <HeadingIcon /> },
};

interface Field extends SurfaceItem {
  label: string;
}

function FieldShelf({ onAdd }: { onAdd: (item: ShelfItem) => void }) {
  return (
    <Shelf
      aria-label="Fields"
      tile="inline"
      onAdd={(item, via) => via !== 'drag' && onAdd(item)}
      labels={{ added: () => '' }}
    >
      <Shelf.Group title="Text">
        {(['text', 'email'] as const).map((id) => (
          <Shelf.Tile key={id} id={id} name={FIELDS[id]!.name} picture={FIELDS[id]!.picture} />
        ))}
      </Shelf.Group>
      <Shelf.Group title="Choice">
        {(['choice', 'date', 'checkbox'] as const).map((id) => (
          <Shelf.Tile key={id} id={id} name={FIELDS[id]!.name} picture={FIELDS[id]!.picture} />
        ))}
      </Shelf.Group>
      <Shelf.Group title="Layout">
        <Shelf.Tile id="heading" name="Heading" picture={<HeadingIcon />} />
      </Shelf.Group>
    </Shelf>
  );
}

/** A field as the form builder might draw it: a small card with its type and label. */
function FieldCard({ field, state }: { field: Field; state: SurfaceItemState }) {
  return (
    <div
      className="flex h-full min-h-11 items-center gap-2 rounded-(--radius) border border-border-1 bg-card px-3 py-2 text-sm"
      data-state={state.grabbed ? 'grabbed' : undefined}
    >
      <span aria-hidden className="text-(--primary) [&>svg]:size-4">
        {FIELDS[field.kind]?.picture}
      </span>
      <span className="min-w-0 truncate">{field.label}</span>
    </div>
  );
}

const fieldLabels = {
  added: (field: Field) => `${field.label} added to the form.`,
  moved: (field: Field, place: { index: number }) => `${field.label} moved to place ${place.index + 1}.`,
  removed: (field: Field) => `${field.label} removed.`,
};

function ColumnDemo() {
  const [fields, setFields, history] = useHistory<Field[]>([
    { id: 'name', kind: 'text', label: 'Name' },
    { id: 'mail', kind: 'email', label: 'E-mail' },
  ]);
  const make = (item: ShelfItem, id: string): Field => ({ id, kind: item.id, label: item.name });
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <FieldShelf
        onAdd={(item) => setFields([...fields, make(item, idFor(item.id, fields))])}
      />
      <div className="min-w-0 flex-1">
        <Surface.Column<Field>
          aria-label="Form"
          items={fields}
          createItem={(item, base) => make(item, base.id)}
          renderItem={(field, state) => <FieldCard field={field} state={state} />}
          onChange={setFields}
          history={history}
          empty="Drag a field here, or tap one on the shelf"
          labels={fieldLabels}
        />
      </div>
    </div>
  );
}

/**
 * One ordered column, as a form builder needs: drag a field in between
 * two others (the insertion line shows where), or tap it to add it at the
 * end. Focus moves to the new field. Arrow keys choose a field; Enter picks
 * it up, the arrows move it, Enter drops it and Escape puts it back.
 * Delete removes it; undo and redo are the app's stack.
 */
export const Column: Story = {
  render: () => <ColumnDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shelf = within(canvas.getByRole('group', { name: 'Fields' }));
    const form = canvas.getByRole('listbox', { name: 'Form' });

    await step('A tap adds at the end and focuses it', async () => {
      await userEvent.click(shelf.getByRole('button', { name: 'Date' }));
      await waitFor(() => expect(within(form).getAllByRole('option')[2]).toHaveFocus());
      await expect(within(form).getAllByRole('option')[2]).toHaveTextContent('Date');
    });

    await step('The keyboard moves it up', async () => {
      await userEvent.keyboard('{Enter}{ArrowUp}{ArrowUp}{Enter}');
      await waitFor(() => expect(within(form).getAllByRole('option')[0]).toHaveTextContent('Date'));
      await expect(within(form).getAllByRole('option')[0]).toHaveFocus();
    });

    await step('Undo takes the move back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
      await waitFor(() => expect(within(form).getAllByRole('option')[2]).toHaveTextContent('Date'));
    });

    await step('A drag drops between two fields', async () => {
      const options = within(form).getAllByRole('option');
      const first = options[0]!.getBoundingClientRect();
      const zone = form.parentElement!;
      await dragTo(shelf.getByRole('button', { name: 'Checkbox' }), first.left + 40, first.bottom + 2, zone);
      await waitFor(() => expect(within(form).getAllByRole('option')[1]).toHaveTextContent('Checkbox'));
      await expect(within(form).getAllByRole('option')[1]).toHaveFocus();
    });
  },
};

function RowsDemo() {
  const [fields, setFields, history] = useHistory<(Field & SurfaceRowsItem)[]>([
    { id: 'first', kind: 'text', label: 'First name', row: 0, width: 6 },
    { id: 'last', kind: 'text', label: 'Last name', row: 0, width: 6 },
    { id: 'mail', kind: 'email', label: 'E-mail', row: 1, width: 8 },
    { id: 'born', kind: 'date', label: 'Born', row: 1, width: 4 },
  ]);
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <FieldShelf
        onAdd={(item) =>
          setFields([
            ...fields,
            { id: idFor(item.id, fields), kind: item.id, label: item.name, row: nextRow(fields), width: 12 },
          ])
        }
      />
      <div className="min-w-0 flex-1">
        <Surface.Rows<Field & SurfaceRowsItem>
          aria-label="Form"
          items={fields}
          createItem={(item, base) => ({ ...base, label: item.name })}
          renderItem={(field, state) => <FieldCard field={field} state={state} />}
          onChange={setFields}
          history={history}
          empty="Drag a field here, or tap one on the shelf"
        />
      </div>
    </div>
  );
}

/**
 * Rows of fields side by side, widths in twelfths: first and last name
 * share a row. A drop between rows makes a new row; a drop beside a field
 * splits its row, and the widths even out to fill twelve. With the
 * keyboard, up and down move a field out to a row of its own, or into the
 * next row.
 */
export const Rows: Story = {
  render: () => <RowsDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shelf = within(canvas.getByRole('group', { name: 'Fields' }));
    const form = canvas.getByRole('listbox', { name: 'Form' });
    const zone = form.parentElement!;
    const option = (name: string) => within(form).getByRole('option', { name });

    await step('A drop beside a field splits its row into thirds', async () => {
      const last = option('Last name').getBoundingClientRect();
      await dragTo(shelf.getByRole('button', { name: 'Text' }), last.right - 10, last.top + last.height / 2, zone);
      await waitFor(() => expect(option('Text')).toHaveFocus());
      await expect(option('Text').parentElement).toBe(option('First name').parentElement);
    });

    await step('Down moves it out to a row of its own', async () => {
      await userEvent.keyboard('{Enter}{ArrowDown}{Enter}');
      await waitFor(() => expect(option('Text').parentElement).not.toBe(option('First name').parentElement));
      await expect(option('Text').parentElement?.children).toHaveLength(1);
    });

    await step('Undo puts it back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
      await waitFor(() => expect(option('Text').parentElement).toBe(option('First name').parentElement));
    });
  },
};

/**
 * The same rows on a phone: below `md` every row wraps to one column, in
 * reading order, since forms are mostly filled in there. The widths stay in
 * the data, for the wider screen.
 */
export const RowsOnPhone: Story = {
  render: () => <RowsDemo />,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { layout: 'fullscreen' },
};

// --- A bench: the grid --------------------------------------------------------

const PARTS: Record<string, { name: string; picture: ReactNode; size: { w: number; h: number } }> = {
  battery: { name: 'Battery', picture: <Battery />, size: { w: 4, h: 2 } },
  switch: { name: 'Switch', picture: <ToggleLeft />, size: { w: 2, h: 2 } },
  lamp: { name: 'Lamp', picture: <Lightbulb />, size: { w: 2, h: 2 } },
  motor: { name: 'Motor', picture: <Fan />, size: { w: 3, h: 3 } },
};

const SIZES = {
  '8 × 6': { columns: 8, rows: 6, cell: 48 },
  '32 × 16': { columns: 32, rows: 16, cell: 24 },
  '32 × 64': { columns: 32, rows: 64, cell: 24 },
} as const;
type BenchSize = keyof typeof SIZES;

function Part({ part, state }: { part: SurfaceGridItem; state: SurfaceItemState }) {
  const info = PARTS[part.kind];
  return (
    <div
      className="flex h-full w-full items-center justify-center gap-1 rounded-(--radius) border border-border-2 bg-card text-(--primary)"
      style={{ opacity: state.dragging ? 0.85 : 1 }}
    >
      <span aria-hidden className="[&>svg]:size-5">
        {info?.picture}
      </span>
      <span className="sr-only">{`${info?.name ?? part.kind}, column ${part.at.col + 1}, row ${part.at.row + 1}`}</span>
    </div>
  );
}

function BenchDemo() {
  const [size, setSize] = useState<BenchSize>('8 × 6');
  const { columns, rows, cell } = SIZES[size];
  const [parts, setParts, history] = useHistory<SurfaceGridItem[]>([
    { id: 'battery-1', kind: 'battery', at: { col: 0, row: 0 }, size: { w: 4, h: 2 } },
  ]);
  const [note, setNote] = useState('');

  const tap = (item: ShelfItem) => {
    const footprint = item.size ?? { w: 1, h: 1 };
    const at = findFreeCell(parts, footprint, columns, rows);
    if (!at) return setNote(`No room for the ${item.name.toLowerCase()}.`);
    setNote('');
    setParts([...parts, { id: idFor(item.id, parts), kind: item.id, at, size: footprint }]);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <Shelf aria-label="Parts" onAdd={(item, via) => via !== 'drag' && tap(item)} labels={{ added: () => '' }}>
        <Shelf.Group title="Sources">
          {(['battery', 'switch'] as const).map((id) => (
            <Shelf.Tile key={id} id={id} name={PARTS[id]!.name} picture={PARTS[id]!.picture} size={PARTS[id]!.size} />
          ))}
        </Shelf.Group>
        <Shelf.Group title="Loads">
          {(['lamp', 'motor'] as const).map((id) => (
            <Shelf.Tile key={id} id={id} name={PARTS[id]!.name} picture={PARTS[id]!.picture} size={PARTS[id]!.size} />
          ))}
        </Shelf.Group>
      </Shelf>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div role="radiogroup" aria-label="Bench size" className="flex flex-wrap gap-2">
          {(Object.keys(SIZES) as BenchSize[]).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={size === key}
              onClick={() => setSize(key)}
              className="min-h-11 rounded-(--radius) border border-border-1 bg-card px-3 text-sm aria-checked:border-(--primary) aria-checked:text-(--primary)"
            >
              {key}
            </button>
          ))}
        </div>
        <Surface.Grid
          aria-label="Bench"
          columns={columns}
          rows={rows}
          cell={cell}
          showCells
          items={parts}
          renderItem={(part, state) => <Part part={part} state={state} />}
          onChange={setParts}
          history={history}
          empty="Drag a part here from the shelf"
          labels={{
            added: (part, at) => `${PARTS[part.kind]?.name} put on the bench, column ${at.col + 1}, row ${at.row + 1}.`,
            refused: () => 'No room there.',
          }}
        />
        <p aria-live="polite" className="m-0 text-sm text-(--text-muted)">
          {note}
        </p>
      </div>
    </div>
  );
}

/**
 * A bench of cells for the electricity lab. Parts snap to cells, take the
 * footprint their tile gives (`size`), and never overlap: a drop or a move
 * onto a taken cell is refused, and the footprint shows it in red first.
 * Switch the size: items are kept in cells, so every part stays where it
 * was; the 32 × 64 bench scrolls inside its box. Dots mark the cell
 * corners, where terminals would sit.
 */
export const Grid: Story = {
  render: () => <BenchDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shelf = within(canvas.getByRole('group', { name: 'Parts' }));
    const bench = canvas.getByRole('listbox', { name: 'Bench' });
    const zone = bench.parentElement!;

    await step('A tap puts the part in the first free cells', async () => {
      await userEvent.click(shelf.getByRole('button', { name: 'Lamp' }));
      await waitFor(() => expect(within(bench).getByRole('option', { name: 'Lamp, column 5, row 1' })).toHaveFocus());
    });

    await step('Arrow keys move it a cell at a time', async () => {
      await userEvent.keyboard('{Enter}{ArrowDown}{ArrowDown}{Enter}');
      await waitFor(() => expect(within(bench).getByRole('option', { name: 'Lamp, column 5, row 3' })).toHaveFocus());
    });

    await step('A drop onto the battery is refused', async () => {
      const before = within(bench).getAllByRole('option').length;
      const box = bench.getBoundingClientRect();
      await dragTo(shelf.getByRole('button', { name: 'Switch' }), box.left + 48, box.top + 48, zone);
      await expect(within(bench).getAllByRole('option')).toHaveLength(before);
    });

    await step('A drop on free cells snaps', async () => {
      const box = bench.getBoundingClientRect();
      // Centred on the corner between columns 2 and 3, rows 4 and 5.
      await dragTo(shelf.getByRole('button', { name: 'Switch' }), box.left + 48 * 2, box.top + 48 * 4, zone);
      await waitFor(() => expect(within(bench).getByRole('option', { name: 'Switch, column 2, row 4' })).toHaveFocus());
    });

    await step('A larger bench keeps every position', async () => {
      await userEvent.click(canvas.getByRole('radio', { name: '32 × 64' }));
      await expect(within(bench).getByRole('option', { name: 'Battery, column 1, row 1' })).toBeInTheDocument();
      await expect(within(bench).getByRole('option', { name: 'Lamp, column 5, row 3' })).toBeInTheDocument();
      await expect(within(bench).getByRole('option', { name: 'Switch, column 2, row 4' })).toBeInTheDocument();
      await expect(zone.scrollHeight).toBeGreaterThan(zone.clientHeight);
    });
  },
};
