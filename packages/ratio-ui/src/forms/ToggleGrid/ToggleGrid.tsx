// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { Fragment, useState } from 'react';

import { cn } from '../../utils/cn';

export type ToggleGridSize = 'sm' | 'md';

export interface ToggleGridRow {
  /** Stable identity; the first half of a cell key. */
  id: string;
  /** Header at the start of the row. */
  label: React.ReactNode;
  /** Spoken name of the row, when `label` is not plain text. */
  name?: string;
  /**
   * Any CSS colour. Fills the row header and the row's selected cells, so
   * each row reads as its own thing — a note, a person, a track.
   */
  color?: string;
}

export interface ToggleGridColumn {
  /** Stable identity; the second half of a cell key. */
  id: string;
  /** Footer under the column. Omit on every column to drop the footer row. */
  label?: React.ReactNode;
  /** Spoken name of the column, when `label` is missing or not plain text. */
  name?: string;
  /** A brighter cell, to mark the start of a group: the beat, the hour. */
  emphasized?: boolean;
}

/** What changed, alongside the new set of keys. */
export interface ToggleGridChange {
  row: string;
  column: string;
  selected: boolean;
}

/** A cell's new length, alongside the new map of spans. */
export interface ToggleGridSpanChange {
  row: string;
  column: string;
  span: number;
}

/** Built-in text of `ToggleGrid`, spoken as a cell's length is set. Each entry falls back to English. */
export interface ToggleGridLabels {
  /** Announced when an on cell is picked up, waiting for its length. */
  pickedUp?: (cell: string) => string;
  /** Announced when a cell's length is set. */
  length?: (cell: string, span: number) => string;
  /** Announced when a picked-up cell is put down again. */
  putDown?: string;
}

export interface ToggleGridProps {
  rows: ToggleGridRow[];
  columns: ToggleGridColumn[];
  /** Controlled selection: the keys (see `toggleGridKey`) of the cells that are on. */
  selectedKeys?: Iterable<string>;
  /** Uncontrolled start selection. */
  defaultSelectedKeys?: Iterable<string>;
  /** Fires with the whole new selection and the one cell that changed. */
  onSelectionChange?: (keys: Set<string>, change: ToggleGridChange) => void;
  /**
   * How many columns each on cell covers, by key — a held note, a booking
   * over several hours. Keys absent cover one. Plain JSON, so it is stored
   * and rendered on the server as it is. Giving `spans`, `defaultSpans` or
   * `onSpansChange` turns lengths on: pressing an on cell picks it up, a
   * later cell in the row sets the length, the same cell again shortens it
   * to one and then turns it off; Shift+arrow adjusts by one from the
   * keyboard.
   */
  spans?: Record<string, number>;
  /** Uncontrolled start lengths. */
  defaultSpans?: Record<string, number>;
  /** Fires with the whole new map and the one cell whose length changed. */
  onSpansChange?: (spans: Record<string, number>, change: ToggleGridSpanChange) => void;
  /** Column to frame — the step that is playing, the hour it is now. */
  activeColumn?: string | null;
  /**
   * Makes each row header a button; pressed with the row's id. For hearing a
   * note or opening a person.
   */
  onRowPress?: (rowId: string) => void;
  /**
   * Spoken name of a cell. A cell that covers several columns also gets its
   * length and its last column.
   * @default `${row}, ${column}` — or `${row}, ${column} to ${last column}`
   */
  cellName?: (row: ToggleGridRow, column: ToggleGridColumn, span: number, last: ToggleGridColumn) => string;
  /** Cell height. @default 'md' */
  size?: ToggleGridSize;
  isDisabled?: boolean;
  /**
   * Plain markup, nothing to press: the grid as a picture of the data. Needs
   * no JavaScript, so a server component can render a saved melody or a
   * booked week with it.
   */
  readOnly?: boolean;
  labels?: ToggleGridLabels;
  /** Accessible name of the grid. */
  'aria-label'?: string;
  className?: string;
  testId?: string;
}

/** The key of one cell in `selectedKeys` and `spans`. */
export const toggleGridKey = (row: string, column: string): string => `${row}:${column}`;

const SIZE = {
  sm: { cell: 'h-7', header: 'h-7 px-1.5 text-xs', column: 'minmax(1.25rem, 1fr)' },
  md: { cell: 'h-9', header: 'h-9 px-2 text-sm', column: 'minmax(1.5rem, 1fr)' },
} as const;

const DEFAULT_LABELS: Required<ToggleGridLabels> = {
  pickedUp: (cell) =>
    `${cell} picked up. Press a later step to set its length, press it again to shorten or remove it, or press Escape.`,
  length: (cell, span) => `${cell}: ${span} ${span === 1 ? 'step' : 'steps'}.`,
  putDown: 'Put down.',
};

const textOf = (node: React.ReactNode): string | undefined =>
  typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

/**
 * ToggleGrid — a matrix of on/off cells with a header per row and a label
 * per column: which notes play on which beats, who is free at which hour.
 * Each cell is a pressed/unpressed button, so the grid is read and worked
 * cell by cell with a keyboard too. `activeColumn` frames one column, for a
 * playhead or the present hour; a row `color` carries through to its
 * selected cells.
 *
 * Selection is a set of `row:column` keys — build them with `toggleGridKey`.
 * Controlled with `selectedKeys` + `onSelectionChange`, or uncontrolled with
 * `defaultSelectedKeys`. `spans` gives on cells a length in columns — a held
 * note — as a plain map by key, controlled or uncontrolled the same way.
 *
 * `readOnly` renders the grid as plain markup for a server component to show
 * saved data with.
 *
 * @example
 * ```tsx
 * <ToggleGrid
 *   aria-label="Melody"
 *   rows={[{ id: 'c', label: 'C', color: 'oklch(0.82 0.1 25)' }, { id: 'e', label: 'E' }]}
 *   columns={Array.from({ length: 8 }, (_, i) => ({ id: String(i), emphasized: i % 4 === 0 }))}
 *   selectedKeys={cells}
 *   onSelectionChange={setCells}
 *   spans={lengths}
 *   onSpansChange={setLengths}
 *   activeColumn={String(step)}
 * />
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function ToggleGrid({
  rows,
  columns,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  spans: spansProp,
  defaultSpans,
  onSpansChange,
  activeColumn,
  onRowPress,
  cellName,
  size = 'md',
  isDisabled = false,
  readOnly = false,
  labels,
  'aria-label': ariaLabel,
  className,
  testId,
}: Readonly<ToggleGridProps>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [inner, setInner] = useState(() => new Set(defaultSelectedKeys ?? []));
  const selected = selectedKeys !== undefined ? new Set(selectedKeys) : inner;
  const [innerSpans, setInnerSpans] = useState<Record<string, number>>(() => defaultSpans ?? {});
  const spans = spansProp ?? innerSpans;
  const spansEnabled = spansProp !== undefined || defaultSpans !== undefined || onSpansChange !== undefined;
  const interactive = !readOnly && !isDisabled;

  // The cell that waits for its length — picked up by a press, put down by
  // the next press, by Escape, or by setting the length.
  const [pending, setPending] = useState<{ key: string; row: string; index: number } | null>(null);
  const [status, setStatus] = useState('');

  const columnIndex = new Map(columns.map((c, i) => [c.id, i]));
  const spanOf = (key: string) => Math.max(1, Math.floor(spans[key] ?? 1));

  const commitSelection = (next: Set<string>, change: ToggleGridChange) => {
    if (selectedKeys === undefined) setInner(next);
    onSelectionChange?.(next, change);
  };
  const commitSpans = (next: Record<string, number>, change: ToggleGridSpanChange) => {
    if (spansProp === undefined) setInnerSpans(next);
    onSpansChange?.(next, change);
  };

  const nameOf = (row: ToggleGridRow, column: ToggleGridColumn, span = 1) => {
    const index = columnIndex.get(column.id) ?? 0;
    const last = columns[Math.min(columns.length - 1, index + span - 1)] ?? column;
    if (cellName) return cellName(row, column, span, last);
    const rowName = row.name ?? textOf(row.label) ?? row.id;
    const colName = (c: ToggleGridColumn) => c.name ?? textOf(c.label) ?? c.id;
    return span > 1 ? `${rowName}, ${colName(column)} to ${colName(last)}` : `${rowName}, ${colName(column)}`;
  };

  const toggle = (row: ToggleGridRow, column: ToggleGridColumn) => {
    const key = toggleGridKey(row.id, column.id);
    const next = new Set(selected);
    const on = !next.has(key);
    if (on) next.add(key);
    else next.delete(key);
    commitSelection(next, { row: row.id, column: column.id, selected: on });
    if (!on && spans[key] !== undefined) {
      const rest = { ...spans };
      delete rest[key];
      commitSpans(rest, { row: row.id, column: column.id, span: 0 });
    }
  };

  /** Give a cell a length, dropping the cells it now covers from the selection. */
  const setSpan = (row: ToggleGridRow, column: ToggleGridColumn, span: number) => {
    const key = toggleGridKey(row.id, column.id);
    const start = columnIndex.get(column.id) ?? 0;
    const clamped = Math.max(1, Math.min(columns.length - start, span));
    const next = { ...spans };
    if (clamped === 1) delete next[key];
    else next[key] = clamped;
    commitSpans(next, { row: row.id, column: column.id, span: clamped });

    const covered = columns
      .slice(start + 1, start + clamped)
      .map((c) => toggleGridKey(row.id, c.id))
      .filter((k) => selected.has(k));
    if (covered.length > 0) {
      const sel = new Set(selected);
      covered.forEach((k) => sel.delete(k));
      const lastCovered = covered[covered.length - 1]!;
      commitSelection(sel, { row: row.id, column: lastCovered.slice(row.id.length + 1), selected: false });
    }
    setStatus(text.length(nameOf(row, column, clamped), clamped));
  };

  const press = (row: ToggleGridRow, column: ToggleGridColumn) => {
    if (!interactive) return;
    const key = toggleGridKey(row.id, column.id);
    const index = columnIndex.get(column.id) ?? 0;
    if (!spansEnabled) {
      toggle(row, column);
      return;
    }
    if (pending) {
      const picked = pending;
      setPending(null);
      if (picked.key === key) {
        // The same cell: shorten a long one to one step, remove a short one.
        if (spanOf(key) > 1) setSpan(row, column, 1);
        else toggle(row, column);
        return;
      }
      if (picked.row === row.id && index > picked.index) {
        const startColumn = columns[picked.index];
        if (startColumn) setSpan(row, startColumn, index - picked.index + 1);
        return;
      }
      // Anywhere else: the pick-up is dropped and the press is an ordinary one.
    }
    if (selected.has(key)) {
      setPending({ key, row: row.id, index });
      setStatus(text.pickedUp(nameOf(row, column, spanOf(key))));
      return;
    }
    toggle(row, column);
  };

  const onCellKeyDown = (e: React.KeyboardEvent, row: ToggleGridRow, column: ToggleGridColumn) => {
    if (!interactive) return;
    if (e.key === 'Escape') {
      if (pending) {
        setPending(null);
        setStatus(text.putDown);
      }
      return;
    }
    if (!spansEnabled || !e.shiftKey) return;
    const key = toggleGridKey(row.id, column.id);
    if (!selected.has(key)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setPending(null);
      setSpan(row, column, spanOf(key) + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };

  const s = SIZE[size];
  const hasFooter = columns.some((c) => c.label !== undefined);
  const activeIndex = activeColumn != null ? columnIndex.get(activeColumn) : undefined;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn('overflow-x-auto', isDisabled && 'opacity-60', className)}
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `auto repeat(${columns.length}, ${s.column})` }}
      >
        {rows.map((row) => {
          const headerClass = cn(
            'flex items-center justify-center rounded-lg font-bold',
            row.color ? 'text-(--text-dark)' : 'bg-card text-(--text)',
            s.header,
          );
          const headerStyle = row.color ? { background: row.color } : undefined;
          const cells: React.ReactNode[] = [];
          for (let i = 0; i < columns.length; i++) {
            const column = columns[i]!;
            const key = toggleGridKey(row.id, column.id);
            const on = selected.has(key);
            const span = on && spansEnabled ? Math.min(spanOf(key), columns.length - i) : 1;
            const active =
              activeIndex !== undefined && activeIndex >= i && activeIndex < i + span;
            const isPending = pending?.key === key;
            const name = nameOf(row, column, span);
            const cellClass = cn(
              'rounded-lg border-2 outline-none',
              'transition-[background-color,border-color,transform,box-shadow] duration-150',
              'focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
              s.cell,
              on
                ? cn('border-transparent', !row.color && 'bg-(--primary)')
                : cn('border-border-1', column.emphasized ? 'bg-card-hover' : 'bg-card'),
              interactive && 'cursor-pointer',
              interactive && !on && 'hover:border-border-2',
              isDisabled && 'cursor-not-allowed',
              active && 'border-(--primary)',
              active && on && span === 1 && 'scale-105',
              isPending && 'shadow-[0_0_0_3px_var(--focus-ring)]',
            );
            const cellStyle: React.CSSProperties = {
              ...(on && row.color ? { background: row.color } : {}),
              ...(span > 1 ? { gridColumn: `span ${span}` } : {}),
            };
            cells.push(
              readOnly ? (
                <span
                  key={column.id}
                  role="img"
                  aria-label={`${name}${on ? ', on' : ', off'}`}
                  className={cellClass}
                  style={cellStyle}
                />
              ) : (
                <button
                  key={column.id}
                  type="button"
                  aria-label={name}
                  aria-pressed={on}
                  disabled={isDisabled}
                  onClick={() => press(row, column)}
                  onKeyDown={(e) => onCellKeyDown(e, row, column)}
                  className={cellClass}
                  style={cellStyle}
                />
              ),
            );
            i += span - 1;
          }
          return (
            <Fragment key={row.id}>
              {onRowPress && !readOnly ? (
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onRowPress(row.id)}
                  className={cn(
                    headerClass,
                    'cursor-pointer outline-none transition-transform',
                    'focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
                    'active:scale-105 disabled:cursor-not-allowed',
                  )}
                  style={headerStyle}
                >
                  {row.label}
                </button>
              ) : (
                <div className={headerClass} style={headerStyle}>
                  {row.label}
                </div>
              )}
              {cells}
            </Fragment>
          );
        })}
        {hasFooter && (
          <>
            <span />
            {columns.map((column) => (
              <span
                key={column.id}
                aria-hidden
                className={cn(
                  'text-center text-xs font-semibold tabular-nums',
                  activeColumn != null && column.id === activeColumn
                    ? 'text-(--primary)'
                    : 'text-(--text-subtle)',
                )}
              >
                {column.label}
              </span>
            ))}
          </>
        )}
      </div>
      {spansEnabled && !readOnly && (
        <span className="sr-only" aria-live="polite">
          {status}
        </span>
      )}
    </div>
  );
}
