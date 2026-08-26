// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { RefObject, useRef } from 'react';

interface SheetDragOptions {
  /** The sheet panel to move while dragging. */
  sheetRef: RefObject<HTMLElement | null>;
  /** Dismiss direction: a bottom sheet drags down, a top sheet drags up. */
  side: 'top' | 'bottom';
  onDismiss: () => void;
}

// Dismiss when released past a third of the sheet, or on a quick flick.
const DISTANCE_FRACTION = 0.35;
const FLICK_VELOCITY = 0.5; // px/ms
const VELOCITY_WINDOW = 120; // ms of samples used for the flick check

/**
 * Pointer-drag for a sheet's handle: the sheet follows the pointer, springs
 * back below the threshold and dismisses past it (or on a flick). Returns
 * pointer handlers to spread on the handle element.
 */
export function useSheetDrag({ sheetRef, side, onDismiss }: SheetDragOptions) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const samples = useRef<{ t: number; y: number }[]>([]);

  // Movement along the dismiss axis only (down for bottom, up for top).
  const along = (clientY: number) => {
    const delta = clientY - startY.current;
    return side === 'bottom' ? Math.max(0, delta) : Math.min(0, delta);
  };

  const settle = (sheet: HTMLElement, dismiss: boolean) => {
    sheet.style.transition = '';
    if (dismiss) {
      // Close first; release the dragged position two frames later so the
      // class-based exit transition takes over from where the pointer left it.
      onDismiss();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          sheet.style.translate = '';
        }),
      );
    } else {
      sheet.style.translate = '';
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (!sheet || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragging.current = true;
    startY.current = e.clientY;
    samples.current = [{ t: e.timeStamp, y: e.clientY }];
    e.currentTarget.setPointerCapture(e.pointerId);
    // Follow the pointer 1:1 — the class transition would lag behind it.
    sheet.style.transition = 'none';
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (!dragging.current || !sheet) return;
    const delta = e.clientY - startY.current;
    const a = along(e.clientY);
    // Rubber-band the wrong direction so the sheet feels held, not stuck.
    const resist = (delta - a) / 4;
    sheet.style.translate = `0 ${a + resist}px`;
    samples.current.push({ t: e.timeStamp, y: e.clientY });
    if (samples.current.length > 8) samples.current.shift();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    if (!dragging.current || !sheet) return;
    dragging.current = false;
    const a = along(e.clientY);
    const recent = samples.current.filter(s => e.timeStamp - s.t <= VELOCITY_WINDOW);
    const first = recent[0] ?? { t: e.timeStamp - 1, y: e.clientY };
    const dt = Math.max(1, e.timeStamp - first.t);
    const travelled = side === 'bottom' ? e.clientY - first.y : first.y - e.clientY;
    const dismiss =
      Math.abs(a) > sheet.offsetHeight * DISTANCE_FRACTION || travelled / dt > FLICK_VELOCITY;
    settle(sheet, dismiss);
  };

  const onPointerCancel = () => {
    const sheet = sheetRef.current;
    if (!dragging.current || !sheet) return;
    dragging.current = false;
    settle(sheet, false);
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
