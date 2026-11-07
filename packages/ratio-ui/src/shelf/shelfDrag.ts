// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * What the shelf and its surfaces share: the surfaces on the page and the
 * one drag there can be at a time. Module state rather than context, so a
 * surface can sit anywhere in the tree — beside the shelf, not under it.
 */

/** A footprint in cells: `w` across, `h` down. */
export interface ShelfSize {
  w: number;
  h: number;
}

/** A thing on the shelf, as the shelf hands it to the app. */
export interface ShelfItem {
  id: string;
  /** The tile's name, as shown and spoken. */
  name: string;
  /**
   * The footprint the thing takes on a grid, when its tile gives one, so a
   * surface knows it before the drop lands. Absent when the tile has none.
   */
  size?: ShelfSize;
}

/** How a tile came onto the surface. */
export type ShelfVia = 'drag' | 'tap' | 'keyboard';

/** A point in a surface's own coordinates: from its top-left inner corner, scroll included. */
export interface ShelfPoint {
  x: number;
  y: number;
}

/** A drag hovering a surface: what, and where. */
export interface ShelfOver {
  item: ShelfItem;
  point: ShelfPoint;
}

export interface SurfaceEntry {
  el: HTMLElement;
  /** Return `false` to refuse the drop: it then counts as cancelled. */
  onDrop: (item: ShelfItem, point: ShelfPoint) => boolean | void;
  setOver: (over: ShelfOver | null) => void;
}

// Registration order: a later surface (often a nested one) wins where two overlap.
const surfaces = new Map<string, SurfaceEntry>();

export function registerSurface(id: string, entry: SurfaceEntry): () => void {
  surfaces.set(id, entry);
  return () => {
    if (surfaces.get(id) === entry) surfaces.delete(id);
  };
}

/** The point, in a surface's coordinates, of a pointer at `clientX`/`clientY`. */
export function pointIn(el: HTMLElement, clientX: number, clientY: number): ShelfPoint {
  const box = el.getBoundingClientRect();
  return {
    x: clientX - box.left - el.clientLeft + el.scrollLeft,
    y: clientY - box.top - el.clientTop + el.scrollTop,
  };
}

/** The surface under the pointer, if any. */
export function surfaceAt(clientX: number, clientY: number): SurfaceEntry | null {
  let hit: SurfaceEntry | null = null;
  surfaces.forEach((entry) => {
    const box = entry.el.getBoundingClientRect();
    if (clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) hit = entry;
  });
  return hit;
}

// One pointer at a time, across every shelf on the page.
let activePointer: number | null = null;

export function claimPointer(id: number): boolean {
  if (activePointer !== null && activePointer !== id) return false;
  activePointer = id;
  return true;
}

export function releasePointer(id: number): void {
  if (activePointer === id) activePointer = null;
}

// Adds the shelves report, for surfaces that move focus to what came in by
// a tap or a key (the app adds those itself, from `onAdd`).
const addListeners = new Set<(item: ShelfItem, via: ShelfVia) => void>();

export function subscribeShelfAdds(listener: (item: ShelfItem, via: ShelfVia) => void): () => void {
  addListeners.add(listener);
  return () => {
    addListeners.delete(listener);
  };
}

export function notifyShelfAdd(item: ShelfItem, via: ShelfVia): void {
  addListeners.forEach((listener) => listener(item, via));
}
