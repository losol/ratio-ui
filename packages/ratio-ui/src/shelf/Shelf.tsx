// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Lock } from '../icons';
import { cn } from '../utils/cn';
import {
  claimPointer,
  pointIn,
  releasePointer,
  surfaceAt,
  type ShelfItem,
  type ShelfVia,
  type SurfaceEntry,
} from './shelfDrag';
import './Shelf.css';

/** `rail` stands beside the surface, `tray` runs along the bottom; `auto` is a rail from `lg`, a tray below. */
export type ShelfShape = 'auto' | 'rail' | 'tray';

/** `stacked`: the picture over the name. `inline`: the picture to the left of it. */
export type ShelfTileLayout = 'stacked' | 'inline';

/** Built-in text of `Shelf`, read out by its live region. Each entry falls back to English. */
export interface ShelfLabels {
  /** Announced when a tile is added, whichever way. */
  added?: (item: ShelfItem, via: ShelfVia) => string;
  /** Announced when a drag ends outside any surface, is refused, or Escape stops it. */
  cancelled?: (item: ShelfItem) => string;
  /** Announced when a locked tile is pressed. */
  locked?: (item: ShelfItem, reason: string) => string;
  /** The visible count on a tile: «3 igjen». */
  count?: (count: number) => string;
}

const DEFAULT_LABELS: Required<ShelfLabels> = {
  added: (item) => `${item.name} added.`,
  cancelled: (item) => `${item.name} not added.`,
  locked: (item, reason) => `${item.name} is locked. ${reason}`,
  count: (count) => `${count} left`,
};

export interface ShelfProps {
  /** `auto` (default) is a rail from the `lg` breakpoint and a tray below it. */
  shape?: ShelfShape;
  /**
   * How tiles lay out. By default stacked in a rail and inline in a tray;
   * `inline` suits a narrow rail or long names.
   */
  tile?: ShelfTileLayout;
  /**
   * A tile was added: once per add. For a drag it fires after the surface's
   * `onDrop` took it. For a tap or the keyboard the surface adds it at its
   * own sensible place, and moves focus to the added thing.
   */
  onAdd?: (item: ShelfItem, via: ShelfVia) => void;
  labels?: ShelfLabels;
  /** Accessible name of the shelf. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  children?: ReactNode;
  testId?: string;
}

interface ShelfContextValue {
  text: Required<ShelfLabels>;
  activate: (item: ShelfItem, via: 'tap' | 'keyboard', locked: string | undefined) => void;
  press: (item: ShelfItem, e: React.PointerEvent<HTMLButtonElement>, visual: ReactNode) => void;
  /** Whether a drag just ended, so the click it leaves behind is not a tap. */
  justDragged: () => boolean;
  showHint: (id: string, reason: string) => void;
  hideHint: (id: string) => void;
}

const ShelfContext = createContext<ShelfContextValue | null>(null);

/** A press that moves less than this is a tap, not a drag. */
const DRAG_THRESHOLD = 8;

interface Ghost {
  visual: ReactNode;
  layout: ShelfTileLayout;
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Shelf — a palette of things to pull onto a work surface: field types onto
 * a form, code blocks onto a line, parts onto a bench. Tiles sit in groups;
 * the surface, made with `useShelfSurface`, decides what an added thing
 * does. The shelf only reports; undo belongs to the surface.
 *
 * Three ways in, all equal: drag a tile onto a surface (a ghost follows the
 * pointer; a drop outside any surface, or Escape, cancels); tap it; or Tab
 * to it and press Enter or Space. Each add fires `onAdd` once, with how it
 * came, and is read out in the app's words (`labels`).
 *
 * Pointer events only, one pointer at a time: no drag-and-drop library and
 * no HTML5 drag and drop.
 *
 * @example
 * ```tsx
 * <Shelf aria-label="Parts" onAdd={(item, via) => add(item, via)}>
 *   <Shelf.Group title="Sources">
 *     <Shelf.Tile id="battery" name="Battery" picture={<BatteryIcon />} />
 *   </Shelf.Group>
 * </Shelf>
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function ShelfRoot({
  shape = 'auto',
  tile,
  onAdd,
  labels,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  children,
  testId,
}: Readonly<ShelfProps>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [said, setSaid] = useState('');
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [hint, setHint] = useState<{ id: string; reason: string } | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const scrollerRef = useRef<HTMLDivElement>(null);

  // The latest props for a drag's handlers, which outlive the render they began in.
  const latest = useRef({ onAdd, text });
  useEffect(() => {
    latest.current = { onAdd, text };
  });

  // A running press: ends it quietly, for an unmount mid-drag.
  const session = useRef<(() => void) | null>(null);
  useEffect(() => () => session.current?.(), []);

  const dragClick = useRef(false);

  // The same words twice are still news: a no-break space makes them new text.
  const announce = (message: string) => setSaid((prev) => (prev === message ? `${message}\u00a0` : message));

  const added = (item: ShelfItem, via: ShelfVia) => {
    latest.current.onAdd?.(item, via);
    announce(latest.current.text.added(item, via));
  };

  const activate: ShelfContextValue['activate'] = (item, via, locked) => {
    if (locked) announce(text.locked(item, locked));
    else added(item, via);
  };

  const press: ShelfContextValue['press'] = (item, e, visual) => {
    if (e.button !== 0 || !e.isPrimary) return;
    const pointerId = e.pointerId;
    if (!claimPointer(pointerId)) return;

    const tileEl = e.currentTarget;
    const box = tileEl.getBoundingClientRect();
    const grab = { x: e.clientX - box.left, y: e.clientY - box.top };
    const start = { x: e.clientX, y: e.clientY };
    const layout: ShelfTileLayout = getComputedStyle(tileEl).flexDirection === 'column' ? 'stacked' : 'inline';
    let dragging = false;
    let target: SurfaceEntry | null = null;

    function hover(next: SurfaceEntry | null, x: number, y: number) {
      if (target && target !== next) target.setOver(null);
      target = next;
      target?.setOver({ item, point: pointIn(target.el, x, y) });
    }

    function end() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey, true);
      releasePointer(pointerId);
      session.current = null;
      if (!dragging) return;
      setGhost(null);
      target?.setOver(null);
      // The click that ends a drag comes now, if it comes: after it, a press is a press again.
      dragClick.current = true;
      setTimeout(() => (dragClick.current = false), 0);
    }

    function cancel() {
      const was = dragging;
      end();
      if (was) announce(latest.current.text.cancelled(item));
    }

    function onMove(ev: PointerEvent) {
      if (ev.pointerId !== pointerId) return;
      if (!dragging) {
        if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < DRAG_THRESHOLD) return;
        dragging = true;
      }
      ev.preventDefault();
      setGhost({ visual, layout, width: box.width, height: box.height, x: ev.clientX - grab.x, y: ev.clientY - grab.y });
      hover(surfaceAt(ev.clientX, ev.clientY), ev.clientX, ev.clientY);
    }

    function onUp(ev: PointerEvent) {
      if (ev.pointerId !== pointerId) return;
      // A press that never became a drag is a tap: the click that follows adds it.
      if (!dragging) return end();
      const at = surfaceAt(ev.clientX, ev.clientY);
      end();
      if (at && at.onDrop(item, pointIn(at.el, ev.clientX, ev.clientY)) !== false) added(item, 'drag');
      else announce(latest.current.text.cancelled(item));
    }

    function onCancel(ev: PointerEvent) {
      if (ev.pointerId === pointerId) cancel();
    }

    function onKey(ev: KeyboardEvent) {
      if (ev.key !== 'Escape' || !dragging) return;
      ev.preventDefault();
      ev.stopPropagation();
      cancel();
    }

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey, true);
    session.current = end;
  };

  // The edge that has more beyond it fades, so a tray that scrolls shows it does.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const sideways = el.scrollWidth > el.clientWidth + 1;
      const at = sideways ? Math.abs(el.scrollLeft) : el.scrollTop;
      const room = sideways ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      const next = { start: at > 1, end: room > 1 && at < room - 1 };
      setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [children]);

  const ctx: ShelfContextValue = {
    text,
    activate,
    press,
    justDragged: () => dragClick.current,
    showHint: (id, reason) => setHint({ id, reason }),
    hideHint: (id) => setHint((prev) => (prev?.id === id ? null : prev)),
  };

  return (
    <ShelfContext.Provider value={ctx}>
      <div
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-testid={testId}
        data-shape={shape}
        data-tile={tile}
        className={cn('shelf', className)}
      >
        <div
          ref={scrollerRef}
          className="shelf-scroller"
          data-edge-start={edges.start ? '' : undefined}
          data-edge-end={edges.end ? '' : undefined}
        >
          {children}
        </div>
        {hint && (
          <p className="shelf-hint" aria-hidden>
            <Lock aria-hidden size={14} />
            {hint.reason}
          </p>
        )}
        <span className="sr-only" aria-live="polite">
          {said}
        </span>
      </div>
      {ghost &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden
            className="shelf-ghost"
            data-testid={testId ? `${testId}-ghost` : undefined}
            style={{ width: ghost.width, height: ghost.height, transform: `translate(${ghost.x}px, ${ghost.y}px)` }}
          >
            <div className="shelf-tile shelf-ghost-tile" data-layout={ghost.layout}>
              {ghost.visual}
            </div>
          </div>,
          document.body,
        )}
    </ShelfContext.Provider>
  );
}
ShelfRoot.displayName = 'Shelf';

export interface ShelfGroupProps {
  /** Shown over the group's tiles, and its accessible name. */
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** A titled run of tiles on the shelf. */
export function ShelfGroup({ title, className, children }: Readonly<ShelfGroupProps>) {
  const titleId = useId();
  return (
    <div role="group" aria-labelledby={title ? titleId : undefined} className={cn('shelf-group', className)}>
      {title && (
        <div id={titleId} className="shelf-group-title">
          {title}
        </div>
      )}
      <ul className="shelf-group-tiles">{children}</ul>
    </div>
  );
}
ShelfGroup.displayName = 'Shelf.Group';

export interface ShelfTileProps {
  /** Stable identity; what `onAdd` and `onDrop` hand back. */
  id: string;
  /** Shown, and spoken in the announcements. */
  name: string;
  /** An icon from the set, or an illustration of the app's own. */
  picture?: ReactNode;
  /** How many are left, shown with `labels.count`. Display only: pass `locked` when none are left. */
  count?: number;
  /**
   * Why the tile cannot be added yet: «Unlocks in Two lamps». The tile stays
   * visible, dimmed with a lock, and says why on hover and focus.
   */
  locked?: string;
  /** A layout of the tile's own, in place of picture, name and count. `name` still names the item. */
  children?: ReactNode;
  className?: string;
}

/** A thing on the shelf. Tap, Enter or drag it onto a surface. */
export function ShelfTile({ id, name, picture, count, locked, children, className }: Readonly<ShelfTileProps>) {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error('[ratio-ui] Shelf.Tile must be rendered inside a Shelf.');
  const reasonId = useId();
  // When the keyboard last added: the click a key can leave behind is not a tap.
  const keyedAt = useRef(-Infinity);
  const item: ShelfItem = { id, name };

  const visual = children ?? (
    <>
      {picture && (
        <span aria-hidden className="shelf-tile-picture">
          {picture}
        </span>
      )}
      <span className="shelf-tile-text">
        <span className="shelf-tile-name">{name}</span>
        {count !== undefined && <span className="shelf-tile-count">{ctx.text.count(count)}</span>}
      </span>
      {locked && <Lock aria-hidden size={14} className="shelf-tile-lock" />}
    </>
  );

  return (
    <li className="shelf-item">
      <button
        type="button"
        className={cn('shelf-tile', className)}
        data-locked={locked ? '' : undefined}
        aria-disabled={locked ? true : undefined}
        aria-describedby={locked ? reasonId : undefined}
        onPointerDown={(e) => {
          if (!locked) ctx.press(item, e, visual);
        }}
        onClick={(e) => {
          if (ctx.justDragged()) return;
          if (e.detail === 0 && performance.now() - keyedAt.current < 500) return;
          ctx.activate(item, 'tap', locked);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          if (e.repeat) return;
          keyedAt.current = performance.now();
          ctx.activate(item, 'keyboard', locked);
        }}
        onKeyUp={(e) => {
          // Space activates a button on its release: this one has acted already.
          if (e.key === ' ') e.preventDefault();
        }}
        onPointerEnter={() => locked && ctx.showHint(id, locked)}
        onPointerLeave={() => ctx.hideHint(id)}
        onFocus={() => locked && ctx.showHint(id, locked)}
        onBlur={() => ctx.hideHint(id)}
      >
        {visual}
        {locked && (
          <span id={reasonId} className="sr-only">
            {locked}
          </span>
        )}
      </button>
    </li>
  );
}
ShelfTile.displayName = 'Shelf.Tile';
