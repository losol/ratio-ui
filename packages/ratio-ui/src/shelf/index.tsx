// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// No 'use client' here, on purpose: `Shelf.tsx` is a client module, so a
// server component sees its exports as client references, and a static
// attached inside it would read as `undefined` across the boundary. The
// statics go onto a plain function this module owns instead — the same
// shape as `forms/Patchbay/index.tsx`.

import type { ReactElement } from 'react';

import { ShelfGroup, ShelfRoot, ShelfTile, type ShelfProps } from './Shelf';

/** Server-safe carrier for the compound statics; renders the client root. */
function ShelfShell(props: Readonly<ShelfProps>): ReactElement {
  return <ShelfRoot {...props} />;
}
ShelfShell.displayName = 'Shelf';

/**
 * Shelf — a palette of tiles to pull onto a work surface. See `ShelfRoot`
 * for the full description; `Shelf.Group` is a titled run of tiles and
 * `Shelf.Tile` a thing on the shelf. A surface takes drops with
 * `useShelfSurface`.
 */
export const Shelf = Object.assign(ShelfShell, { Group: ShelfGroup, Tile: ShelfTile });

export type { ShelfProps, ShelfGroupProps, ShelfTileProps, ShelfLabels, ShelfShape, ShelfTileLayout } from './Shelf';
export type { ShelfItem, ShelfOver, ShelfPoint, ShelfVia } from './shelfDrag';
export { useShelfSurface } from './useShelfSurface';
export type { UseShelfSurfaceOptions, UseShelfSurfaceResult } from './useShelfSurface';
