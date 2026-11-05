// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Space } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

/** The column counts whose classes the bundled CSS guarantees. */
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6;

export interface GridProps {
  /**
   * Columns per breakpoint. `base` applies from the narrowest screen (one
   * column when unset), the others from Tailwind's `sm`/`md`/`lg`. 1–6 are
   * in the bundled CSS (`GridCols`); a larger count renders its class too,
   * but needs the app's own Tailwind build to supply it.
   * @default { md: 2, lg: 3 }
   */
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  /**
   * Gap between cells, on the spacing scale. Unset keeps the 1rem default.
   */
  gap?: Space;
  paddingClassName?: string;
  wrapperClassName?: string;
  container?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Written out, not built with a template literal: Tailwind only emits the
// classes it can read in the source, so `md:grid-cols-${n}` reached the
// bundle only for the values a story happened to use, and a consumer's
// `cols={{ lg: 2 }}` silently did nothing.
const colClasses: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};
const smColClasses: Record<GridCols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
};
const mdColClasses: Record<GridCols, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};
const lgColClasses: Record<GridCols, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

const gapClasses: Record<Space, string> = {
  none: 'gap-0',
  xs: 'gap-xs',
  sm: 'gap-sm',
  md: 'gap-md',
  lg: 'gap-lg',
  xl: 'gap-xl',
};

const isGridCols = (n: number): n is GridCols => Number.isInteger(n) && n >= 1 && n <= 6;

// The lookup for the guaranteed range; the template literal, as before,
// for anything else, so a `cols={{ lg: 8 }}` an app's Tailwind build
// supplies keeps working.
const colClass = (table: Record<GridCols, string>, prefix: string, n: number | undefined) =>
  n == null ? undefined : isGridCols(n) ? table[n] : `${prefix}grid-cols-${n}`;

const getGridCols = (cols?: GridProps['cols']) =>
  cn(
    colClass(colClasses, '', cols?.base),
    colClass(smColClasses, 'sm:', cols?.sm),
    colClass(mdColClasses, 'md:', cols?.md),
    colClass(lgColClasses, 'lg:', cols?.lg),
  );

/**
 * A responsive grid of equal columns: `cols` per breakpoint, `gap` on the
 * spacing scale. For a row of tiles or cards; the cells are the children.
 *
 * @example
 * <Grid cols={{ base: 2, lg: 4 }} gap="sm">
 *   <ValueTile … />
 * </Grid>
 */
export const Grid: React.FC<GridProps> = ({
  cols = { md: 2, lg: 3 },
  gap,
  paddingClassName,
  wrapperClassName,
  container,
  className,
  children,
}) => {
  const content = (
    <div
      className={cn(
        'grid',
        getGridCols(cols),
        gap ? gapClasses[gap] : 'gap-4',
        container && 'container',
        paddingClassName,
        className,
      )}
    >
      {children}
    </div>
  );

  return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content;
};
