// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * The rules of the three surface layouts, as pure functions over item
 * lists: where a thing may go, and the list after it went there. No React,
 * no DOM, so each rule is tested on its own.
 */

import type { ShelfSize } from './shelfDrag';

/** A thing on a surface. `kind` is usually the id of the shelf tile it came from. */
export interface SurfaceItem {
  id: string;
  kind: string;
}

/** A thing in `Surface.Rows`: its row, and its width in twelfths (1–12). */
export interface SurfaceRowsItem extends SurfaceItem {
  row: number;
  width: number;
}

/** A cell on a grid, counted from 0 at the top-left. */
export interface SurfaceCell {
  col: number;
  row: number;
}

/** A footprint in cells. */
export type SurfaceSize = ShelfSize;

/** A thing in `Surface.Grid`, in cell units: its top-left cell and its footprint. */
export interface SurfaceGridItem extends SurfaceItem {
  at: SurfaceCell;
  size: SurfaceSize;
}

/** Where an item is in `Surface.Column`: its index, from 0. */
export interface SurfaceColumnPlace {
  index: number;
}

/**
 * Where an item is, or goes, in `Surface.Rows`: the row and the index in
 * it, from 0. For a drop, `newRow` says whether it opens a row of its own at
 * `row` or joins row `row` at `index`.
 */
export interface SurfaceRowsPlace {
  row: number;
  index: number;
  newRow?: boolean;
}

/** One unit of movement: what an arrow key asks for. */
export type SurfaceDirection = 'up' | 'down' | 'left' | 'right';

/** A row holds twelve twelfths. */
export const TWELVE = 12;

/** A fresh id for a thing of `kind`, not yet on the surface: `lamp-1`, `lamp-2`… */
export function freshId(kind: string, items: readonly SurfaceItem[]): string {
  const taken = new Set(items.map((item) => item.id));
  for (let n = 1; ; n++) {
    const id = `${kind}-${n}`;
    if (!taken.has(id)) return id;
  }
}

// --- Column --------------------------------------------------------------

/** `item` put at `index` of the list (the item itself taken out first, if it was there). */
export function columnPlace<T extends SurfaceItem>(items: readonly T[], item: T, index: number): T[] {
  const rest = items.filter((other) => other.id !== item.id);
  const at = Math.max(0, Math.min(rest.length, index));
  return [...rest.slice(0, at), item, ...rest.slice(at)];
}

/** The item `id` moved one place up or down, or `null` at the end it is already at. */
export function columnStep<T extends SurfaceItem>(items: readonly T[], id: string, dir: SurfaceDirection): T[] | null {
  const from = items.findIndex((item) => item.id === id);
  if (from < 0) return null;
  const to = dir === 'up' || dir === 'left' ? from - 1 : from + 1;
  if (to < 0 || to >= items.length) return null;
  return columnPlace(items, items[from]!, to);
}

// --- Rows ----------------------------------------------------------------

/** The items in rows, top to bottom, each in its order; empty rows dropped. */
export function rowsOf<T extends SurfaceRowsItem>(items: readonly T[]): T[][] {
  const byRow = new Map<number, T[]>();
  for (const item of items) {
    const row = byRow.get(item.row);
    if (row) row.push(item);
    else byRow.set(item.row, [item]);
  }
  return [...byRow.keys()].sort((a, b) => a - b).map((key) => byRow.get(key)!);
}

/** Rows back to a flat list, numbered 0, 1, 2… */
export function rowsFlat<T extends SurfaceRowsItem>(rows: readonly (readonly T[])[]): T[] {
  return rows.filter((row) => row.length > 0).flatMap((row, r) => row.map((item) => (item.row === r ? item : { ...item, row: r })));
}

/**
 * `widths` scaled to add up to `total`, each at least 1, rounded by the
 * largest remainder so the sum is exact. `[4, 4]` to 12 is `[6, 6]`.
 */
export function fitWidths(widths: readonly number[], total: number): number[] {
  if (widths.length === 0) return [];
  if (widths.length >= total) return widths.map(() => 1);
  const safe = widths.map((w) => Math.max(1, w));
  const sum = safe.reduce((a, b) => a + b, 0);
  const exact = safe.map((w) => (w * total) / sum);
  const out = exact.map((e) => Math.max(1, Math.floor(e)));
  let left = total - out.reduce((a, b) => a + b, 0);
  const byRemainder = exact.map((e, i) => ({ i, r: e - Math.floor(e) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % out.length, left--) out[byRemainder[k]!.i]! += 1;
  // Raising a share to its minimum of 1 can overshoot: take back from the widest.
  while (left < 0) {
    const widest = out.indexOf(Math.max(...out));
    out[widest]! -= 1;
    left++;
  }
  return out;
}

function withWidths<T extends SurfaceRowsItem>(row: readonly T[], widths: readonly number[]): T[] {
  return row.map((item, i) => (item.width === widths[i] ? item : { ...item, width: widths[i]! }));
}

/** The width a newcomer takes in a row of `others` items: an equal share. */
export function shareOf(others: number): number {
  return Math.max(1, Math.round(TWELVE / (others + 1)));
}

/**
 * `item` put at `place`, taken first from where it was if it is already
 * on the surface. A new row holds it alone at full width; joining a row
 * gives it an equal share and narrows the others to fit twelve; the row it
 * left widens to fill twelve again. A move within its own row keeps the
 * widths. Returns `null` when the row is full (twelve items).
 *
 * `place` counts rows and indices as they are with the item still where it
 * was, so a place read off the screen can be passed as it is.
 */
export function rowsPlace<T extends SurfaceRowsItem>(items: readonly T[], item: T, place: SurfaceRowsPlace): T[] | null {
  const rows = rowsOf(items).map((row) => [...row]);
  const fromRow = rows.findIndex((row) => row.some((other) => other.id === item.id));
  let placed: T;

  if (place.newRow) {
    placed = { ...item, width: TWELVE };
    rows.splice(Math.max(0, Math.min(rows.length, place.row)), 0, [placed]);
  } else {
    const target = rows[place.row];
    if (!target) return null;
    const index = Math.max(0, Math.min(target.length, place.index));
    if (place.row === fromRow) {
      placed = { ...item, width: target.find((other) => other.id === item.id)!.width };
      target.splice(index, 0, placed);
    } else {
      if (target.length + 1 > TWELVE) return null;
      const share = shareOf(target.length);
      placed = { ...item, width: share };
      const narrowed = withWidths(target, fitWidths(target.map((other) => other.width), TWELVE - share));
      narrowed.splice(index, 0, placed);
      rows[place.row] = narrowed;
    }
  }

  // Take the item out of where it was, and widen what is left of that row.
  for (const row of rows) {
    const i = row.findIndex((other) => other.id === item.id && other !== placed);
    if (i < 0) continue;
    row.splice(i, 1);
    if (row.length > 0 && !row.includes(placed)) {
      row.splice(0, row.length, ...withWidths(row, fitWidths(row.map((other) => other.width), TWELVE)));
    }
  }
  return rowsFlat(rows);
}

/** Where the item `id` is: its row and its index in that row. */
export function rowsPlaceOf<T extends SurfaceRowsItem>(items: readonly T[], id: string): SurfaceRowsPlace | null {
  const rows = rowsOf(items);
  for (let r = 0; r < rows.length; r++) {
    const index = rows[r]!.findIndex((item) => item.id === id);
    if (index >= 0) return { row: r, index };
  }
  return null;
}

/**
 * The item `id` moved one unit. Left and right swap it with its neighbour
 * in the row. Up and down: an item that shares its row steps out into a
 * row of its own above or below; an item alone in its row joins the row
 * above or below, at its end. `null` when there is nowhere to go.
 */
export function rowsStep<T extends SurfaceRowsItem>(items: readonly T[], id: string, dir: SurfaceDirection): T[] | null {
  const rows = rowsOf(items);
  const at = rowsPlaceOf(items, id);
  if (!at) return null;
  const row = rows[at.row]!;
  const item = row[at.index]!;
  if (dir === 'left' || dir === 'right') {
    const to = dir === 'left' ? at.index - 1 : at.index + 1;
    if (to < 0 || to >= row.length) return null;
    // The index counts with the item still in the row: past the neighbour is one further.
    return rowsPlace(items, item, { row: at.row, index: dir === 'left' ? to : to + 1 });
  }
  const shared = row.length > 1;
  if (dir === 'up') {
    if (shared) return rowsPlace(items, item, { row: at.row, index: 0, newRow: true });
    if (at.row === 0) return null;
    return rowsPlace(items, item, { row: at.row - 1, index: rows[at.row - 1]!.length });
  }
  if (shared) return rowsPlace(items, item, { row: at.row + 1, index: 0, newRow: true });
  if (at.row === rows.length - 1) return null;
  return rowsPlace(items, item, { row: at.row + 1, index: rows[at.row + 1]!.length });
}

/** The item `id` taken off, its row widened to fill twelve again. */
export function rowsRemove<T extends SurfaceRowsItem>(items: readonly T[], id: string): T[] {
  const rows = rowsOf(items).map((row) => {
    if (!row.some((item) => item.id === id)) return row;
    const rest = row.filter((item) => item.id !== id);
    return withWidths(rest, fitWidths(rest.map((item) => item.width), TWELVE));
  });
  return rowsFlat(rows);
}

/** The number a new row at the end gets: for a tap that adds below the rest. */
export function nextRow(items: readonly SurfaceRowsItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.row + 1), 0);
}

// --- Grid ----------------------------------------------------------------

/** Whether a footprint at `at` stays inside a `columns × rows` grid. */
export function gridInBounds(at: SurfaceCell, size: SurfaceSize, columns: number, rows: number): boolean {
  return at.col >= 0 && at.row >= 0 && at.col + size.w <= columns && at.row + size.h <= rows;
}

/** The item a footprint at `at` would cover, other than `except`; else `null`. */
export function gridCollision<T extends SurfaceGridItem>(
  items: readonly T[],
  at: SurfaceCell,
  size: SurfaceSize,
  except?: string,
): T | null {
  for (const item of items) {
    if (item.id === except) continue;
    const apart =
      at.col + size.w <= item.at.col ||
      item.at.col + item.size.w <= at.col ||
      at.row + size.h <= item.at.row ||
      item.at.row + item.size.h <= at.row;
    if (!apart) return item;
  }
  return null;
}

/** Whether a footprint fits at `at`: inside the grid and on free cells only. */
export function gridFits(
  items: readonly SurfaceGridItem[],
  at: SurfaceCell,
  size: SurfaceSize,
  columns: number,
  rows: number,
  except?: string,
): boolean {
  return gridInBounds(at, size, columns, rows) && !gridCollision(items, at, size, except);
}

/**
 * The cell whose footprint is centred on `point` (in pixels, `cell` px per
 * cell), kept inside the grid: the snap a drop lands on.
 */
export function gridSnap(
  point: { x: number; y: number },
  size: SurfaceSize,
  cell: number,
  columns: number,
  rows: number,
): SurfaceCell {
  const col = Math.round(point.x / cell - size.w / 2);
  const row = Math.round(point.y / cell - size.h / 2);
  return {
    col: Math.max(0, Math.min(Math.max(0, columns - size.w), col)),
    row: Math.max(0, Math.min(Math.max(0, rows - size.h), row)),
  };
}

/** The first cell, reading left to right and top to bottom, where `size` fits; else `null`. For a tap. */
export function findFreeCell(
  items: readonly SurfaceGridItem[],
  size: SurfaceSize,
  columns: number,
  rows: number,
): SurfaceCell | null {
  for (let row = 0; row + size.h <= rows; row++) {
    for (let col = 0; col + size.w <= columns; col++) {
      if (!gridCollision(items, { col, row }, size)) return { col, row };
    }
  }
  return null;
}

/** The cell one step from `at` in `dir`. */
export function gridStepCell(at: SurfaceCell, dir: SurfaceDirection): SurfaceCell {
  if (dir === 'up') return { col: at.col, row: at.row - 1 };
  if (dir === 'down') return { col: at.col, row: at.row + 1 };
  if (dir === 'left') return { col: at.col - 1, row: at.row };
  return { col: at.col + 1, row: at.row };
}

/**
 * The nearest item from `from` in `dir`, by the centres of their
 * footprints; `null` when nothing lies that way. For arrow-key selection.
 */
export function nearestIn<T extends { id: string }>(
  from: { x: number; y: number },
  dir: SurfaceDirection,
  candidates: readonly (T & { x: number; y: number })[],
): T | null {
  let best: T | null = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    const dx = c.x - from.x;
    const dy = c.y - from.y;
    const along = dir === 'right' ? dx : dir === 'left' ? -dx : dir === 'down' ? dy : -dy;
    const across = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
    if (along <= 0.001) continue;
    // Straight ahead wins over a little to the side.
    const score = along + across * 2;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}
