// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import './RowTable.css';

export type RowTableBreakpoint = 'sm' | 'md' | 'lg';

export interface RowTableColumn<T> {
  /** Stable key for the column. */
  key: string;
  /** The column's name. Read by screen readers even where the header row is hidden. */
  header: React.ReactNode;
  /** The cell's content for a row. */
  render: (row: T) => React.ReactNode;
  /**
   * The column's grid track: `'1fr'`, `'auto'`, `'8rem'`, `'minmax(0, 2fr)'`.
   * @default 'minmax(0, 1fr)'
   */
  width?: string;
  /** Leave the column out below this breakpoint, on every row. */
  hideBelow?: RowTableBreakpoint;
  /** Align the cell's text to the trailing edge: numbers, dates. Stacked cells stay at the start. */
  align?: 'start' | 'end';
}

export interface RowTableProps<T> {
  columns: RowTableColumn<T>[];
  rows: T[];
  /** A stable id per row: the key of its element. */
  rowKey: (row: T) => string | number;
  /**
   * Makes every row a link to this URL. The first column's cell holds the
   * link; an overlay stretches it over the whole row, and a chevron closes
   * the row. Other controls in a row go above the overlay with
   * `className="ratio-row-table__action"`.
   */
  rowHref?: (row: T) => string;
  /** Rendered for the row links, e.g. `next/link`. Takes `href`, `className` and children. @default 'a' */
  linkComponent?: React.ElementType;
  /**
   * Below this breakpoint the rows stack their cells and the header row is
   * only visually hidden.
   * @default 'md'
   */
  stackBelow?: RowTableBreakpoint;
  /** Shown instead of the rows when there are none: an `EmptyState`. */
  empty?: React.ReactNode;
  /** Name of the table. Or point `aria-labelledby` at the heading above it. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  testId?: string;
}

const BREAKPOINT_ORDER: Record<RowTableBreakpoint, number> = { sm: 0, md: 1, lg: 2 };

/** The grid template at a breakpoint: the tracks of the columns visible there, plus the chevron's. */
function templateAt<T>(columns: RowTableColumn<T>[], at: RowTableBreakpoint, withChevron: boolean): string {
  const tracks = columns
    .filter((c) => !c.hideBelow || BREAKPOINT_ORDER[c.hideBelow] <= BREAKPOINT_ORDER[at])
    .map((c) => c.width ?? 'minmax(0, 1fr)');
  if (withChevron) tracks.push('auto');
  return tracks.join(' ');
}

/**
 * RowTable — the list of an admin overview: one row per item, columns with a
 * header, every row a link. Built as a grid, not a `<table>`, so the rows
 * stack on a phone and the whole row is clickable without a cell escaping
 * the layout; the ARIA table roles keep the column names for a screen
 * reader.
 *
 * The first column is the row's title and carries its link. Put the table in
 * a `Card` with `padding="none"` for the framed look, and give it a name.
 * The columns line up across rows through CSS subgrid (every browser since
 * 2023); without it each row sizes its own columns.
 *
 * @beta The prop shape may change before release.
 *
 * @example
 * <RowTable
 *   aria-label="Events"
 *   columns={[
 *     { key: 'title', header: 'Event', width: 'minmax(0, 2fr)', render: (e) => e.title },
 *     { key: 'date', header: 'Starts', render: (e) => e.starts, hideBelow: 'lg' },
 *     { key: 'status', header: 'Status', width: 'auto', render: (e) => <Badge>{e.status}</Badge> },
 *   ]}
 *   rows={events}
 *   rowKey={(e) => e.id}
 *   rowHref={(e) => `/admin/events/${e.id}`}
 *   empty={<EmptyState size="sm" title="No events yet" />}
 * />
 */
export function RowTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  linkComponent: LinkComponent = 'a',
  stackBelow = 'md',
  empty,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  testId,
}: Readonly<RowTableProps<T>>) {
  const withChevron = rowHref != null;
  const style = {
    '--row-table-cols-sm': templateAt(columns, 'sm', withChevron),
    '--row-table-cols-md': templateAt(columns, 'md', withChevron),
    '--row-table-cols-lg': templateAt(columns, 'lg', withChevron),
  } as React.CSSProperties;

  return (
    <div
      className={cn('ratio-row-table', className)}
      data-stack-below={stackBelow}
      data-testid={testId}
      style={style}
    >
      <div
        role="table"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="ratio-row-table__table"
      >
        <div role="rowgroup">
          <div role="row" className="ratio-row-table__row ratio-row-table__row--header">
            {columns.map((column) => (
              <div
                key={column.key}
                role="columnheader"
                data-hide-below={column.hideBelow}
                data-align={column.align}
                className="ratio-row-table__cell text-xs font-medium uppercase tracking-wider text-(--text-muted)"
              >
                {column.header}
              </div>
            ))}
            {withChevron && (
              <div role="columnheader" className="ratio-row-table__cell ratio-row-table__cell--decor" />
            )}
          </div>
        </div>
        {rows.length > 0 && (
          <div role="rowgroup">
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <div
                  key={rowKey(row)}
                  role="row"
                  className={cn('ratio-row-table__row', href != null && 'ratio-row-table__row--link')}
                >
                  {columns.map((column, index) => {
                    const content = column.render(row);
                    const isTitle = index === 0;
                    return (
                      <div
                        key={column.key}
                        role="cell"
                        data-hide-below={column.hideBelow}
                        data-align={column.align}
                        className={cn(
                          'ratio-row-table__cell text-sm',
                          isTitle ? 'font-medium text-(--text)' : 'text-(--text-muted)',
                        )}
                      >
                        {isTitle && href != null ? (
                          <LinkComponent href={href} className="ratio-row-table__link">
                            {content}
                          </LinkComponent>
                        ) : (
                          content
                        )}
                      </div>
                    );
                  })}
                  {withChevron && (
                    <div
                      role="cell"
                      aria-hidden="true"
                      className="ratio-row-table__cell ratio-row-table__cell--decor text-(--text-subtle)"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {rows.length === 0 && empty}
    </div>
  );
}
