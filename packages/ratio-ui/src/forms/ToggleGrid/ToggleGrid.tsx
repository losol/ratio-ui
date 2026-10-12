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

export interface ToggleGridProps {
  rows: ToggleGridRow[];
  columns: ToggleGridColumn[];
  /** Controlled selection: the keys (see `toggleGridKey`) of the cells that are on. */
  selectedKeys?: Iterable<string>;
  /** Uncontrolled start selection. */
  defaultSelectedKeys?: Iterable<string>;
  /** Fires with the whole new selection and the one cell that changed. */
  onSelectionChange?: (keys: Set<string>, change: ToggleGridChange) => void;
  /** Column to frame — the step that is playing, the hour it is now. */
  activeColumn?: string | null;
  /**
   * Makes each row header a button; pressed with the row's id. For hearing a
   * note or opening a person.
   */
  onRowPress?: (rowId: string) => void;
  /** Spoken name of a cell. @default `${row}, ${column}` */
  cellName?: (row: ToggleGridRow, column: ToggleGridColumn) => string;
  /** Cell height. @default 'md' */
  size?: ToggleGridSize;
  isDisabled?: boolean;
  /** Accessible name of the grid. */
  'aria-label'?: string;
  className?: string;
  testId?: string;
}

/** The key of one cell in `selectedKeys`. */
export const toggleGridKey = (row: string, column: string): string => `${row}:${column}`;

const SIZE = {
  sm: { cell: 'h-7', header: 'h-7 px-1.5 text-xs', column: 'minmax(1.25rem, 1fr)' },
  md: { cell: 'h-9', header: 'h-9 px-2 text-sm', column: 'minmax(1.5rem, 1fr)' },
} as const;

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
 * `defaultSelectedKeys`.
 *
 * @example
 * ```tsx
 * <ToggleGrid
 *   aria-label="Melody"
 *   rows={[{ id: 'c', label: 'C', color: 'oklch(0.82 0.1 25)' }, { id: 'e', label: 'E' }]}
 *   columns={Array.from({ length: 8 }, (_, i) => ({ id: String(i), emphasized: i % 4 === 0 }))}
 *   selectedKeys={cells}
 *   onSelectionChange={setCells}
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
  activeColumn,
  onRowPress,
  cellName,
  size = 'md',
  isDisabled = false,
  'aria-label': ariaLabel,
  className,
  testId,
}: Readonly<ToggleGridProps>) {
  const [inner, setInner] = useState(() => new Set(defaultSelectedKeys ?? []));
  const selected = selectedKeys !== undefined ? new Set(selectedKeys) : inner;

  const toggle = (row: ToggleGridRow, column: ToggleGridColumn) => {
    const key = toggleGridKey(row.id, column.id);
    const next = new Set(selected);
    const on = !next.has(key);
    if (on) next.add(key);
    else next.delete(key);
    if (selectedKeys === undefined) setInner(next);
    onSelectionChange?.(next, { row: row.id, column: column.id, selected: on });
  };

  const nameOf = (row: ToggleGridRow, column: ToggleGridColumn) =>
    cellName
      ? cellName(row, column)
      : `${row.name ?? textOf(row.label) ?? row.id}, ${column.name ?? textOf(column.label) ?? column.id}`;

  const s = SIZE[size];
  const hasFooter = columns.some((c) => c.label !== undefined);

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
          return (
            <Fragment key={row.id}>
              {onRowPress ? (
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
              {columns.map((column) => {
                const on = selected.has(toggleGridKey(row.id, column.id));
                const active = activeColumn != null && column.id === activeColumn;
                return (
                  <button
                    key={column.id}
                    type="button"
                    aria-label={nameOf(row, column)}
                    aria-pressed={on}
                    disabled={isDisabled}
                    onClick={() => toggle(row, column)}
                    className={cn(
                      'rounded-lg border-2 outline-none',
                      'transition-[background-color,border-color,transform] duration-150',
                      'focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
                      'disabled:cursor-not-allowed',
                      !isDisabled && 'cursor-pointer',
                      s.cell,
                      on
                        ? cn('border-transparent', !row.color && 'bg-(--primary)')
                        : cn(
                            'border-border-1',
                            column.emphasized ? 'bg-card-hover' : 'bg-card',
                            !isDisabled && 'hover:border-border-2',
                          ),
                      active && 'border-(--primary)',
                      active && on && 'scale-105',
                    )}
                    style={on && row.color ? { background: row.color } : undefined}
                  />
                );
              })}
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
    </div>
  );
}
