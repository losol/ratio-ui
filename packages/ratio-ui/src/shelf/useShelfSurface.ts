// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { registerSurface, type ShelfItem, type ShelfOver, type ShelfPoint } from './shelfDrag';

export interface UseShelfSurfaceOptions {
  /**
   * A tile was dropped here, at `point` in the surface's own coordinates
   * (from its top-left inner corner, scroll included). Place it by the
   * surface's rules: snap it to a grid, put it between two fields. Return
   * `false` to refuse — the drop then counts as cancelled and the shelf's
   * `onAdd` does not fire.
   */
  onDrop: (item: ShelfItem, point: ShelfPoint) => boolean | void;
}

export interface UseShelfSurfaceResult {
  /** Spread on the element that takes drops. */
  surfaceProps: {
    ref: (el: HTMLElement | null) => void;
    'data-shelf-surface': string;
    'data-shelf-over'?: '';
  };
  /** The drag hovering the surface, for a ghost or an insertion line of its own; else `null`. */
  over: ShelfOver | null;
}

/**
 * Makes an element a place a `Shelf` tile can be dragged onto. The surface
 * is found by where it is on screen, so it can sit anywhere in the tree,
 * beside the shelf. While a drag hovers it, it carries `data-shelf-over`
 * (a dashed `--border-2` edge) and `over` says what and where.
 *
 * @example
 * ```tsx
 * const { surfaceProps, over } = useShelfSurface({ onDrop: (item, point) => place(item, snap(point)) });
 * <div {...surfaceProps}>…{over && <Marker at={over.point} />}</div>
 * ```
 *
 * @beta This hook is experimental — its shape may change before release.
 */
export function useShelfSurface({ onDrop }: UseShelfSurfaceOptions): UseShelfSurfaceResult {
  const id = useId();
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [over, setOver] = useState<ShelfOver | null>(null);
  // The latest handler, so a re-render does not re-register the surface.
  const drop = useRef(onDrop);
  useEffect(() => {
    drop.current = onDrop;
  }, [onDrop]);

  useEffect(() => {
    if (!el) return;
    const unregister = registerSurface(id, {
      el,
      onDrop: (item, point) => drop.current(item, point),
      setOver,
    });
    return () => {
      unregister();
      setOver(null);
    };
  }, [el, id]);

  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);

  return {
    surfaceProps: {
      ref,
      'data-shelf-surface': id,
      ...(over ? { 'data-shelf-over': '' as const } : {}),
    },
    over,
  };
}
