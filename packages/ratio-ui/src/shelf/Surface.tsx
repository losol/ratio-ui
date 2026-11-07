// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Redo2, Undo2 } from '../icons';
import { cn } from '../utils/cn';
import { claimPointer, pointIn, releasePointer, subscribeShelfAdds, type ShelfItem, type ShelfPoint } from './shelfDrag';
import {
  columnPlace,
  columnStep,
  freshId,
  gridFits,
  gridSnap,
  gridStepCell,
  nearestIn,
  rowsOf,
  rowsPlace,
  rowsPlaceOf,
  rowsRemove,
  rowsStep,
  shareOf,
  TWELVE,
  type SurfaceCell,
  type SurfaceColumnPlace,
  type SurfaceDirection,
  type SurfaceGridItem,
  type SurfaceItem,
  type SurfaceRowsItem,
  type SurfaceRowsPlace,
  type SurfaceSize,
} from './surfaceLayout';
import { useShelfSurface } from './useShelfSurface';
import './Surface.css';

// --- Public types ----------------------------------------------------------

/** How an item is right now, for `renderItem` to show. */
export interface SurfaceItemState {
  /** The one selected item: arrow keys, Enter and Delete act on it. */
  selected: boolean;
  /** Picked up with Enter: the arrow keys move it until Enter drops it or Escape puts it back. */
  grabbed: boolean;
  /** Being dragged by a pointer. */
  dragging: boolean;
}

/** Undo and redo, kept by the app: the surface only shows the buttons and keys. */
export interface SurfaceHistory {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Text of a surface, read out by its live region or shown as button names.
 * Each entry falls back to English. A function that returns `''` says
 * nothing — useful for `added`, which the shelf reads out too.
 */
export interface SurfaceLabels<T, P> {
  /** A thing came onto the surface from a shelf, whichever way. */
  added?: (item: T, place: P) => string;
  /** A thing moved, by a key step, a key drop or a pointer drop. */
  moved?: (item: T, place: P) => string;
  /** A thing was taken off with Delete. */
  removed?: (item: T) => string;
  /** A drop or a move was refused: no room there, or `onDrop` said no. */
  refused?: (item: T | ShelfItem) => string;
  /** A thing was picked up with Enter. */
  picked?: (item: T, place: P) => string;
  /** Escape, or a drag let go off the surface, put a thing back where it was. */
  cancelled?: (item: T, place: P) => string;
  /** How the keys work, given to the surface as its description. */
  instructions?: string;
  /** The undo button's name. */
  undo?: string;
  /** The redo button's name. */
  redo?: string;
}

/** What the three layouts share. `P` is where a thing is; `B` is what `createItem` is handed. */
export interface SurfaceBaseProps<T extends SurfaceItem, P, B> {
  /** The things on the surface. The surface never changes them itself: it hands a new list to `onChange`. */
  items: readonly T[];
  /** Draws one thing. The surface wraps it in a focusable, selectable box. */
  renderItem: (item: T, state: SurfaceItemState) => ReactNode;
  /** The list after an add, a move or a removal. */
  onChange: (items: T[]) => void;
  /**
   * A shelf tile is about to land at `place`. Return `false` to refuse it:
   * the drop then counts as cancelled and the shelf's `onAdd` does not fire.
   */
  onDrop?: (item: ShelfItem, place: P) => boolean | void;
  /**
   * Makes the thing a dropped tile becomes. `base` holds a fresh `id`, the
   * tile's id as `kind`, and where it lands; add fields of your own to it.
   * Defaults to `base` as it is.
   */
  createItem?: (item: ShelfItem, base: B) => T;
  /** Shown while nothing is on the surface: «Drag something here, or tap a tile». */
  empty?: ReactNode;
  labels?: SurfaceLabels<T, P>;
  /** Shows undo and redo buttons, and takes Ctrl/⌘+Z and Ctrl/⌘+Shift+Z or Ctrl+Y on the surface. */
  history?: SurfaceHistory;
  /** The selected item's id, for a controlled selection; `null` for none. */
  selectedId?: string | null;
  /** The selection changed: by a key, a press, or an add. */
  onSelect?: (id: string | null) => void;
  /** Accessible name of the surface. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  testId?: string;
}

// --- The frame -------------------------------------------------------------

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** Where each item is drawn, in the drop zone's own coordinates. */
type Geometry = Map<string, Rect>;

/** A layout's rules, as the frame calls them. `G` is a target: where a drop or move would go. */
interface Engine<T extends SurfaceItem, P, B, G> {
  /** Reading order: what Home, End and the Tab stop go by. */
  order: (items: readonly T[]) => T[];
  /** Where a tile from the shelf would land, dropped at `point`. */
  dropTarget: (point: ShelfPoint, shelf: ShelfItem, items: readonly T[], geo: Geometry) => G | null;
  /** Where item `id` would land, the pointer at `point`, held `grab` from its top-left corner. */
  moveTarget: (point: ShelfPoint, grab: ShelfPoint, id: string, items: readonly T[], geo: Geometry) => G | null;
  /** Whether there is room at the target. */
  fits: (target: G, items: readonly T[]) => boolean;
  /** The target as a place, for `onDrop`. */
  placeOf: (target: G, items: readonly T[]) => P;
  add: (
    items: readonly T[],
    shelf: ShelfItem,
    target: G,
    create: (shelf: ShelfItem, base: B) => T,
  ) => { items: T[]; item: T } | null;
  move: (items: readonly T[], id: string, target: G) => T[] | null;
  step: (items: readonly T[], id: string, dir: SurfaceDirection) => T[] | null;
  where: (items: readonly T[], id: string) => P | null;
  remove: (items: readonly T[], id: string) => T[];
  neighbour: (items: readonly T[], id: string, dir: SurfaceDirection) => string | null;
  /** A marker for the target while a drag hovers: an insertion line, a footprint. */
  marker: (target: G, ok: boolean, items: readonly T[], geo: Geometry) => ReactNode;
  /** Where a thing is, in words, for the default labels: «position 3». */
  describe: (place: P) => string;
}

type Layout = 'column' | 'rows' | 'grid';

interface FrameProps<T extends SurfaceItem, P, B, G> extends SurfaceBaseProps<T, P, B> {
  layout: Layout;
  engine: Engine<T, P, B, G>;
  /** Draws the items: `option` wraps one item in its focusable box. */
  body: (items: readonly T[], option: (item: T, look?: { style?: CSSProperties; className?: string }) => ReactElement) => ReactNode;
  listClassName?: string;
  listStyle?: CSSProperties;
  listData?: Record<string, string | undefined>;
}

const KEYS: Record<string, SurfaceDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** A press that moves less than this is a press, not a drag. */
const DRAG_THRESHOLD = 8;
/** On touch, a press must rest this long before it drags; a quicker swipe scrolls. */
const TOUCH_HOLD = 300;
/** A tap or key add from a shelf counts for the next new item within this. */
const ADD_WINDOW = 1000;

const NO_DRAG = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-surface-nodrag]';

const nameOf = (item: SurfaceItem | ShelfItem) => ('name' in item ? item.name : item.kind);

function defaultLabels<T extends SurfaceItem, P>(describe: (place: P) => string): Required<SurfaceLabels<T, P>> {
  return {
    added: (item, place) => `${item.kind} added, ${describe(place)}.`,
    moved: (item, place) => `${item.kind} moved, ${describe(place)}.`,
    removed: (item) => `${item.kind} removed.`,
    refused: (item) => `${nameOf(item)} cannot go there.`,
    picked: (item, place) =>
      `${item.kind} picked up, ${describe(place)}. Arrow keys move it, Enter drops it, Escape puts it back.`,
    cancelled: (item, place) => `${item.kind} put back, ${describe(place)}.`,
    instructions:
      'Arrow keys choose a thing. Enter picks it up, arrow keys move it, Enter drops it, Escape puts it back. Delete removes it.',
    undo: 'Undo',
    redo: 'Redo',
  };
}

function SurfaceFrame<T extends SurfaceItem, P, B, G>({
  layout,
  engine,
  body,
  listClassName,
  listStyle,
  listData,
  items,
  renderItem,
  onChange,
  onDrop,
  createItem,
  empty,
  labels,
  history,
  selectedId,
  onSelect,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  testId,
}: Readonly<FrameProps<T, P, B, G>>) {
  const uid = useId();
  const text = { ...defaultLabels<T, P>(engine.describe), ...labels };
  const create = createItem ?? ((_: ShelfItem, base: B) => base as unknown as T);

  const [ownSelected, setOwnSelected] = useState<string | null>(null);
  const wanted = selectedId !== undefined ? selectedId : ownSelected;
  const selected = wanted !== null && items.some((item) => item.id === wanted) ? wanted : null;

  // A keyboard pick-up: the list it started from, and the list as moved so far.
  const [grab, setGrab] = useState<{ id: string; from: readonly T[]; draft: T[] } | null>(null);
  // A pointer drag of an item already on the surface.
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; target: G | null; geo: Geometry } | null>(
    null,
  );
  const [said, setSaid] = useState('');

  const rootRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef(new Map<string, HTMLElement>());
  const wantFocus = useRef<string | 'list' | null>(null);
  const focusInside = useRef(false);
  const pendingAdd = useRef<number | null>(null);
  const prevIds = useRef<Set<string>>(new Set(items.map((item) => item.id)));
  const dragClick = useRef(false);
  const session = useRef<(() => void) | null>(null);

  // The latest props for handlers that outlive the render they began in.
  const latest = useRef({ items, onChange, onDrop, create, engine, text, onSelect, selectedId });
  useEffect(() => {
    latest.current = { items, onChange, onDrop, create, engine, text, onSelect, selectedId };
  });

  // The same words twice are still news: a no-break space makes them new text.
  const announce = useCallback((message: string) => {
    if (!message) return;
    setSaid((prev) => (prev === message ? `${message}\u00a0` : message));
  }, []);

  const select = useCallback((id: string | null) => {
    const { selectedId: controlled, onSelect: report } = latest.current;
    if (controlled === undefined) setOwnSelected(id);
    report?.(id);
  }, []);

  /** Where each item is drawn, in the zone's coordinates (scroll included). */
  const measure = useCallback((): Geometry => {
    const geo: Geometry = new Map();
    const zone = zoneRef.current;
    if (!zone) return geo;
    itemEls.current.forEach((el, id) => {
      const box = el.getBoundingClientRect();
      const p = pointIn(zone, box.left, box.top);
      geo.set(id, { left: p.x, top: p.y, right: p.x + box.width, bottom: p.y + box.height, width: box.width, height: box.height });
    });
    return geo;
  }, []);

  // --- Drops from a shelf ---------------------------------------------------

  const { surfaceProps, over } = useShelfSurface({
    onDrop: (shelf, point) => {
      const { items: now, onChange: change, onDrop: ask, create: make, engine: rules, text: words } = latest.current;
      const target = rules.dropTarget(point, shelf, now, measure());
      if (target === null || !rules.fits(target, now) || ask?.(shelf, rules.placeOf(target, now)) === false) {
        announce(words.refused(shelf));
        return false;
      }
      const result = rules.add(now, shelf, target, make);
      if (!result) {
        announce(words.refused(shelf));
        return false;
      }
      change(result.items);
      select(result.item.id);
      wantFocus.current = result.item.id;
      const place = rules.where(result.items, result.item.id);
      if (place !== null) announce(words.added(result.item, place));
    },
  });

  // Where the items are drawn, measured once as a drag from the shelf comes over.
  const [overGeo, setOverGeo] = useState<Geometry | null>(null);
  const hovering = over !== null;
  useLayoutEffect(() => {
    // Layout can only be read once committed; this is React's measure-then-render pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverGeo(hovering ? measure() : null);
  }, [hovering, measure]);

  // A tap or a key on a shelf: the app adds the thing from `onAdd`, and the
  // next new item here is it. Focus goes to it, as it does after a drop.
  useEffect(
    () =>
      subscribeShelfAdds((_, via) => {
        if (via !== 'drag') pendingAdd.current = performance.now();
      }),
    [],
  );

  const shown = grab ? grab.draft : items;
  const reading = engine.order(shown);
  const tabStop = selected ?? reading[0]?.id ?? null;

  useLayoutEffect(() => {
    const ids = new Set(items.map((item) => item.id));
    const before = prevIds.current;
    prevIds.current = ids;
    if (pendingAdd.current !== null) {
      const fresh = items.filter((item) => !before.has(item.id));
      if (performance.now() - pendingAdd.current > ADD_WINDOW) pendingAdd.current = null;
      else if (fresh.length > 0) {
        pendingAdd.current = null;
        const item = fresh[fresh.length - 1]!;
        select(item.id);
        wantFocus.current = item.id;
        const place = engine.where(items, item.id);
        if (place !== null) announce(text.added(item, place));
      }
    }

    const target = wantFocus.current;
    if (target !== null) {
      const el = target === 'list' ? listRef.current : itemEls.current.get(target);
      if (el) {
        wantFocus.current = null;
        if (document.activeElement !== el) el.focus();
        focusInside.current = true;
      }
    } else if (focusInside.current && rootRef.current && !rootRef.current.contains(document.activeElement)) {
      // The focused item went (an undo, a re-render that moved it): stay on the surface.
      (tabStop ? itemEls.current.get(tabStop) : listRef.current)?.focus();
    }
  });

  // An unmount mid-drag ends the drag quietly.
  useEffect(() => () => session.current?.(), []);


  // --- Keyboard -------------------------------------------------------------

  const focusItem = (id: string) => {
    select(id);
    wantFocus.current = id;
    itemEls.current.get(id)?.focus();
  };

  const remove = (id: string) => {
    const item = items.find((other) => other.id === id);
    if (!item) return;
    const order = engine.order(items);
    const i = order.findIndex((other) => other.id === id);
    const next = order[i + 1] ?? order[i - 1] ?? null;
    setGrab(null);
    onChange(engine.remove(items, id));
    announce(text.removed(item));
    select(next?.id ?? null);
    wantFocus.current = next?.id ?? 'list';
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const from = e.target as HTMLElement;
    // Keys pressed inside a control of the app's own item are the control's.
    if (from !== e.currentTarget && !from.hasAttribute('data-surface-id')) return;

    const dir = KEYS[e.key];
    if (grab) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const item = grab.draft.find((other) => other.id === grab.id)!;
      if (dir) {
        e.preventDefault();
        const next = engine.step(grab.draft, grab.id, dir);
        wantFocus.current = grab.id;
        if (!next) return announce(text.refused(item));
        setGrab({ ...grab, draft: next });
        const place = engine.where(next, grab.id);
        if (place !== null) announce(text.moved(next.find((other) => other.id === grab.id)!, place));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.repeat) return;
        setGrab(null);
        wantFocus.current = grab.id;
        if (grab.draft !== grab.from) {
          onChange(grab.draft);
          const place = engine.where(grab.draft, grab.id);
          if (place !== null) announce(text.moved(item, place));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelGrab(grab);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        remove(grab.id);
      } else if (e.key === 'Tab') {
        cancelGrab(grab);
      }
      return;
    }

    const mod = e.ctrlKey || e.metaKey;
    if (history && mod && !e.altKey) {
      const key = e.key.toLowerCase();
      const redo = (key === 'z' && e.shiftKey) || (key === 'y' && !e.shiftKey);
      if (key === 'z' || key === 'y') {
        e.preventDefault();
        if (redo ? history.canRedo : history.canUndo) (redo ? history.onRedo : history.onUndo)();
        return;
      }
    }
    if (mod || e.altKey) return;
    // The focused item is the one the keys act on, even before its selection has rendered.
    const focused = from.dataset.surfaceId;
    const current = focused && items.some((item) => item.id === focused) ? focused : selected;
    if (dir) {
      e.preventDefault();
      if (!current) {
        if (reading[0]) focusItem(reading[0].id);
        return;
      }
      const next = engine.neighbour(shown, current, dir);
      if (next) focusItem(next);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const to = e.key === 'Home' ? reading[0] : reading[reading.length - 1];
      if (to) focusItem(to.id);
    } else if ((e.key === 'Enter' || e.key === ' ') && current && from !== e.currentTarget) {
      e.preventDefault();
      if (e.repeat) return;
      const item = items.find((other) => other.id === current)!;
      setGrab({ id: current, from: items, draft: items as T[] });
      wantFocus.current = current;
      const place = engine.where(items, current);
      if (place !== null) announce(text.picked(item, place));
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && current) {
      e.preventDefault();
      remove(current);
    }
  };

  function cancelGrab(now: typeof grab) {
    if (!now) return;
    setGrab(null);
    wantFocus.current = now.id;
    const item = now.from.find((other) => other.id === now.id);
    const place = item ? latest.current.engine.where(now.from, now.id) : null;
    if (item && place !== null) announce(latest.current.text.cancelled(item, place));
  }

  // Focus leaving the surface ends a pick-up. Checked a moment later: moving
  // an item in the page can blur it for an instant, and focus comes back.
  const onBlur = (e: React.FocusEvent) => {
    const root = rootRef.current;
    const to = e.relatedTarget as Node | null;
    const leave = () => {
      focusInside.current = false;
      cancelGrab(grab);
    };
    if (to) {
      if (root && !root.contains(to)) leave();
      return;
    }
    setTimeout(() => {
      if (rootRef.current && !rootRef.current.contains(document.activeElement)) leave();
    }, 0);
  };

  // --- Pointer drags of items on the surface ---------------------------------

  const press = (item: T, e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !e.isPrimary || grab) return;
    if ((e.target as HTMLElement).closest(NO_DRAG)) return;
    select(item.id);
    const zone = zoneRef.current;
    const pointerId = e.pointerId;
    if (!zone || !claimPointer(pointerId)) return;

    const start = { x: e.clientX, y: e.clientY };
    const geo = measure();
    const own = geo.get(item.id);
    const at = pointIn(zone, e.clientX, e.clientY);
    const grabAt = { x: at.x - (own?.left ?? at.x), y: at.y - (own?.top ?? at.y) };
    const touch = e.pointerType === 'touch';
    let armed = !touch;
    let dragging = false;
    const hold = touch ? setTimeout(() => (armed = true), TOUCH_HOLD) : null;

    const targetAt = (x: number, y: number) =>
      latest.current.engine.moveTarget(pointIn(zone, x, y), grabAt, item.id, latest.current.items, geo);

    const inside = (x: number, y: number) => {
      const box = zone.getBoundingClientRect();
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
    };

    function end() {
      if (hold) clearTimeout(hold);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('touchmove', onTouchMove);
      releasePointer(pointerId);
      session.current = null;
      if (!dragging) return;
      setDrag(null);
      dragClick.current = true;
      setTimeout(() => (dragClick.current = false), 0);
    }

    function putBack() {
      const was = dragging;
      end();
      if (!was) return;
      const place = latest.current.engine.where(latest.current.items, item.id);
      if (place !== null) announce(latest.current.text.cancelled(item, place));
    }

    function onMove(ev: PointerEvent) {
      if (ev.pointerId !== pointerId) return;
      if (!dragging) {
        if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < DRAG_THRESHOLD) return;
        // A touch that moves before it has rested is a scroll, not a drag.
        if (!armed) return end();
        dragging = true;
      }
      ev.preventDefault();
      const target = inside(ev.clientX, ev.clientY) ? targetAt(ev.clientX, ev.clientY) : null;
      setDrag({ id: item.id, dx: ev.clientX - start.x, dy: ev.clientY - start.y, target, geo });
    }

    function onUp(ev: PointerEvent) {
      if (ev.pointerId !== pointerId) return;
      if (!dragging) return end();
      if (!inside(ev.clientX, ev.clientY)) return putBack();
      const { items: now, engine: rules, onChange: change, text: words } = latest.current;
      const target = targetAt(ev.clientX, ev.clientY);
      end();
      const next = target !== null && rules.fits(target, now) ? rules.move(now, item.id, target) : null;
      if (!next) return announce(words.refused(item));
      change(next);
      wantFocus.current = item.id;
      const place = rules.where(next, item.id);
      if (place !== null) announce(words.moved(next.find((other) => other.id === item.id) ?? item, place));
    }

    function onCancel(ev: PointerEvent) {
      if (ev.pointerId === pointerId) putBack();
    }

    function onKey(ev: KeyboardEvent) {
      if (ev.key !== 'Escape' || !dragging) return;
      ev.preventDefault();
      ev.stopPropagation();
      putBack();
    }

    // Once a touch drag runs, the page must not scroll under it.
    function onTouchMove(ev: TouchEvent) {
      if (armed && ev.cancelable) ev.preventDefault();
    }

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey, true);
    if (touch) window.addEventListener('touchmove', onTouchMove, { passive: false });
    session.current = end;
  };

  // --- Rendering ------------------------------------------------------------

  const option = (item: T, look?: { style?: CSSProperties; className?: string }): ReactElement => {
    const isSelected = item.id === selected;
    const isGrabbed = grab?.id === item.id;
    const isDragging = drag?.id === item.id;
    const style: CSSProperties = isDragging
      ? { ...look?.style, transform: `translate(${drag.dx}px, ${drag.dy}px)` }
      : (look?.style ?? {});
    return (
      <div
        key={item.id}
        ref={(el) => {
          if (el) itemEls.current.set(item.id, el);
          else itemEls.current.delete(item.id);
        }}
        role="option"
        aria-selected={isSelected}
        tabIndex={item.id === tabStop ? 0 : -1}
        data-surface-id={item.id}
        data-selected={isSelected ? '' : undefined}
        data-grabbed={isGrabbed ? '' : undefined}
        data-dragging={isDragging ? '' : undefined}
        className={cn('surface-item', look?.className)}
        style={style}
        onPointerDown={(e) => press(item, e)}
        onFocus={(e) => {
          focusInside.current = true;
          if (e.target === e.currentTarget && item.id !== selected) select(item.id);
        }}
      >
        {renderItem(item, { selected: isSelected, grabbed: isGrabbed, dragging: isDragging })}
      </div>
    );
  };

  let marker: ReactNode = null;
  if (over && overGeo) {
    const target = engine.dropTarget(over.point, over.item, items, overGeo);
    if (target !== null) marker = engine.marker(target, engine.fits(target, items), items, overGeo);
  } else if (drag?.target != null) {
    marker = engine.marker(drag.target, engine.fits(drag.target, items), items, drag.geo);
  }

  const emptyId = `${uid}-empty`;
  const helpId = `${uid}-help`;
  const zoneRefMerged = (el: HTMLElement | null) => {
    zoneRef.current = el;
    surfaceProps.ref(el);
  };

  return (
    <div ref={rootRef} className={cn('surface', className)} data-layout={layout} data-testid={testId}>
      {history && (
        <div role="toolbar" aria-label={ariaLabel ? `${ariaLabel}: history` : 'History'} className="surface-toolbar">
          <button
            type="button"
            className="surface-tool"
            aria-label={text.undo}
            title={text.undo}
            disabled={!history.canUndo}
            onClick={history.onUndo}
          >
            <Undo2 aria-hidden size={18} />
          </button>
          <button
            type="button"
            className="surface-tool"
            aria-label={text.redo}
            title={text.redo}
            disabled={!history.canRedo}
            onClick={history.onRedo}
          >
            <Redo2 aria-hidden size={18} />
          </button>
        </div>
      )}
      <div
        {...surfaceProps}
        ref={zoneRefMerged}
        className="surface-zone"
        data-testid={testId ? `${testId}-zone` : undefined}
      >
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={items.length === 0 && empty ? `${emptyId} ${helpId}` : helpId}
          tabIndex={tabStop ? -1 : 0}
          className={cn('surface-list', listClassName)}
          style={listStyle}
          {...listData}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onFocus={() => (focusInside.current = true)}
          onClickCapture={(e) => {
            // The click a drag leaves behind is not a press on the app's controls.
            if (!dragClick.current) return;
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {body(shown, option)}
          {layout === 'grid' && marker}
          {items.length === 0 && empty != null && (
            <div id={emptyId} className="surface-empty">
              {empty}
            </div>
          )}
        </div>
        {layout !== 'grid' && marker}
      </div>
      <span id={helpId} className="sr-only">
        {text.instructions}
      </span>
      <span className="sr-only" aria-live="polite">
        {said}
      </span>
    </div>
  );
}

// --- Column ------------------------------------------------------------------

/** What `Surface.Column` hands `createItem`. */
export type SurfaceColumnBase = SurfaceItem;

export type SurfaceColumnProps<T extends SurfaceItem = SurfaceItem> = SurfaceBaseProps<T, SurfaceColumnPlace, SurfaceColumnBase>;

interface ColumnTarget {
  /** The index the item ends at. */
  index: number;
  /** The gap the line is drawn in, counted with the moving item still in the list. */
  line: number;
}

/** How many of `items` lie above `y`, by their middles: the gap a drop at `y` goes into. */
function gapAt<T extends SurfaceItem>(y: number, items: readonly T[], geo: Geometry): number {
  let gap = 0;
  for (const item of items) {
    const box = geo.get(item.id);
    if (box && y > box.top + box.height / 2) gap += 1;
  }
  return gap;
}

/** A line across the zone at `y`, from `left` to `right`. */
function lineAcross(y: number, left: number, right: number): ReactElement {
  return <span aria-hidden className="surface-insert" data-axis="across" style={{ top: y, left, width: right - left }} />;
}

function lineDown(x: number, top: number, bottom: number): ReactElement {
  return <span aria-hidden className="surface-insert" data-axis="down" style={{ left: x, top, height: bottom - top }} />;
}

/** The middle of the gap before item `i` of `boxes` (or after the last). */
function gapY(boxes: Rect[], i: number): number {
  const gap = boxes.length > 1 ? Math.max(0, boxes[1]!.top - boxes[0]!.bottom) : 8;
  if (i <= 0) return boxes[0]!.top - gap / 2;
  if (i >= boxes.length) return boxes[boxes.length - 1]!.bottom + gap / 2;
  return (boxes[i - 1]!.bottom + boxes[i]!.top) / 2;
}

function columnEngine<T extends SurfaceItem>(): Engine<T, SurfaceColumnPlace, SurfaceColumnBase, ColumnTarget> {
  return {
    order: (items) => [...items],
    dropTarget: (point, _shelf, items, geo) => {
      const gap = gapAt(point.y, items, geo);
      return { index: gap, line: gap };
    },
    moveTarget: (point, _grab, id, items, geo) => {
      const line = gapAt(point.y, items, geo);
      const from = items.findIndex((item) => item.id === id);
      return { index: line > from ? line - 1 : line, line };
    },
    fits: () => true,
    placeOf: (target) => ({ index: target.index }),
    add: (items, shelf, target, create) => {
      const item = create(shelf, { id: freshId(shelf.id, items), kind: shelf.id });
      return { items: columnPlace(items, item, target.index), item };
    },
    move: (items, id, target) => {
      const item = items.find((other) => other.id === id);
      return item ? columnPlace(items, item, target.index) : null;
    },
    step: columnStep,
    where: (items, id) => {
      const index = items.findIndex((item) => item.id === id);
      return index < 0 ? null : { index };
    },
    remove: (items, id) => items.filter((item) => item.id !== id),
    neighbour: (items, id, dir) => {
      const i = items.findIndex((item) => item.id === id);
      const to = dir === 'up' || dir === 'left' ? i - 1 : i + 1;
      return items[to]?.id ?? null;
    },
    marker: (target, _ok, items, geo) => {
      const boxes = items.map((item) => geo.get(item.id)).filter((box): box is Rect => !!box);
      if (boxes.length === 0) return null;
      const left = Math.min(...boxes.map((box) => box.left));
      const right = Math.max(...boxes.map((box) => box.right));
      return lineAcross(gapY(boxes, target.line), left, right);
    },
    describe: (place) => `position ${place.index + 1}`,
  };
}

/**
 * Surface.Column — one ordered column: the fields of a form, the steps of a
 * recipe. A drop goes between two items, where the insertion line shows;
 * items move up and down by drag or by the arrow keys once picked up.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function SurfaceColumn<T extends SurfaceItem = SurfaceItem>(props: Readonly<SurfaceColumnProps<T>>) {
  const engine = columnEngine<T>();
  return (
    <SurfaceFrame
      {...props}
      layout="column"
      engine={engine}
      body={(items, option) => items.map((item) => option(item))}
    />
  );
}
SurfaceColumn.displayName = 'Surface.Column';

// --- Rows --------------------------------------------------------------------

/** What `Surface.Rows` hands `createItem`: where it lands and the width it gets. */
export interface SurfaceRowsBase extends SurfaceItem {
  row: number;
  width: number;
}

export type SurfaceRowsProps<T extends SurfaceRowsItem = SurfaceRowsItem> = SurfaceBaseProps<T, SurfaceRowsPlace, SurfaceRowsBase>;

interface Band {
  top: number;
  bottom: number;
  boxes: { id: string; box: Rect }[];
  /** Whether the row's items sit side by side (or stack, below `md`). */
  across: boolean;
}

function bandsOf<T extends SurfaceRowsItem>(items: readonly T[], geo: Geometry): Band[] {
  return rowsOf(items).map((row) => {
    const boxes = row.map((item) => ({ id: item.id, box: geo.get(item.id) })).filter((b): b is { id: string; box: Rect } => !!b.box);
    const top = Math.min(...boxes.map((b) => b.box.top));
    const bottom = Math.max(...boxes.map((b) => b.box.bottom));
    const across = boxes.length < 2 || boxes.every((b) => Math.abs(b.box.top - boxes[0]!.box.top) < 4);
    return { top, bottom, boxes, across };
  });
}

/** Where a drop at `point` goes: a new row in a gap between rows, or beside an item in one. */
function rowsTarget<T extends SurfaceRowsItem>(point: ShelfPoint, items: readonly T[], geo: Geometry): SurfaceRowsPlace {
  const bands = bandsOf(items, geo).filter((band) => band.boxes.length > 0);
  for (let r = 0; r < bands.length; r++) {
    const band = bands[r]!;
    if (point.y < band.top) return { row: r, index: 0, newRow: true };
    if (point.y > band.bottom) continue;
    // Near a row's top or bottom edge, the drop opens a row of its own.
    const edge = Math.min(12, (band.bottom - band.top) / 4);
    if (band.across && point.y < band.top + edge) return { row: r, index: 0, newRow: true };
    if (band.across && point.y > band.bottom - edge) return { row: r + 1, index: 0, newRow: true };
    let index = 0;
    for (const { box } of band.boxes) {
      const before = band.across ? point.x < box.left + box.width / 2 : point.y < box.top + box.height / 2;
      if (before) break;
      index += 1;
    }
    return { row: r, index };
  }
  return { row: bands.length, index: 0, newRow: true };
}

function rowsMarker(place: SurfaceRowsPlace, bands: Band[]): ReactNode {
  if (bands.length === 0) return null;
  const all = bands.flatMap((band) => band.boxes.map((b) => b.box));
  const left = Math.min(...all.map((box) => box.left));
  const right = Math.max(...all.map((box) => box.right));
  if (place.newRow) {
    const edges = bands.map((band) => ({ top: band.top, bottom: band.bottom }) as Rect);
    return lineAcross(gapY(edges, place.row), left, right);
  }
  const band = bands[place.row];
  if (!band) return null;
  const boxes = band.boxes.map((b) => b.box);
  if (!band.across) return lineAcross(gapY(boxes, place.index), boxes[0]!.left, boxes[0]!.right);
  const gap = boxes.length > 1 ? Math.max(0, boxes[1]!.left - boxes[0]!.right) : 8;
  const x =
    place.index <= 0
      ? boxes[0]!.left - gap / 2
      : place.index >= boxes.length
        ? boxes[boxes.length - 1]!.right + gap / 2
        : (boxes[place.index - 1]!.right + boxes[place.index]!.left) / 2;
  return lineDown(x, band.top, band.bottom);
}

/** A place in the rows, and the item moving there when it is one already on the surface. */
type RowsTarget = SurfaceRowsPlace & { id?: string };

function rowsEngine<T extends SurfaceRowsItem>(): Engine<T, SurfaceRowsPlace, SurfaceRowsBase, RowsTarget> {
  return {
    order: (items) => rowsOf(items).flat(),
    dropTarget: (point, _shelf, items, geo) => rowsTarget(point, items, geo),
    moveTarget: (point, _grab, id, items, geo) => ({ ...rowsTarget(point, items, geo), id }),
    fits: (place, items) => {
      if (place.newRow) return true;
      const row = rowsOf(items)[place.row];
      return !!row && (row.some((item) => item.id === place.id) || row.length < TWELVE);
    },
    placeOf: (place) => ({ row: place.row, index: place.index, newRow: !!place.newRow }),
    add: (items, shelf, place, create) => {
      const row = rowsOf(items)[place.row];
      const width = place.newRow || !row ? TWELVE : shareOf(row.length);
      const item = create(shelf, { id: freshId(shelf.id, items), kind: shelf.id, row: place.row, width });
      const next = rowsPlace(items, item, place);
      return next ? { items: next, item: next.find((other) => other.id === item.id)! } : null;
    },
    move: (items, id, place) => {
      const item = items.find((other) => other.id === id);
      return item ? rowsPlace(items, item, { row: place.row, index: place.index, newRow: place.newRow }) : null;
    },
    step: rowsStep,
    where: rowsPlaceOf,
    remove: rowsRemove,
    neighbour: (items, id, dir) => {
      const rows = rowsOf(items);
      const at = rowsPlaceOf(items, id);
      if (!at) return null;
      if (dir === 'left' || dir === 'right') {
        const flat = rows.flat();
        const i = flat.findIndex((item) => item.id === id);
        return flat[dir === 'left' ? i - 1 : i + 1]?.id ?? null;
      }
      const other = rows[dir === 'up' ? at.row - 1 : at.row + 1];
      if (!other) return null;
      // The item in that row nearest under or over this one's middle, in twelfths.
      const middle = (row: readonly T[], i: number) =>
        row.slice(0, i).reduce((sum, item) => sum + item.width, 0) + row[i]!.width / 2;
      const here = middle(rows[at.row]!, at.index);
      let best = other[0]!;
      let bestDistance = Infinity;
      other.forEach((item, i) => {
        const distance = Math.abs(middle(other, i) - here);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = item;
        }
      });
      return best.id;
    },
    marker: (place, _ok, items, geo) => rowsMarker(place, bandsOf(items, geo)),
    describe: (place) => `row ${place.row + 1}, place ${place.index + 1}`,
  };
}

/**
 * Surface.Rows — a column of rows, each holding one or more items side by
 * side, with a width in twelfths: first name and last name on one row of a
 * form. A drop between rows makes a new row; a drop beside an item splits
 * its row, and the widths are evened out to fill twelve. Rows wrap to one
 * column below `md`, where forms are mostly filled in.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function SurfaceRows<T extends SurfaceRowsItem = SurfaceRowsItem>(props: Readonly<SurfaceRowsProps<T>>) {
  const engine = rowsEngine<T>();
  return (
    <SurfaceFrame
      {...props}
      layout="rows"
      engine={engine}
      body={(items, option) =>
        rowsOf(items).map((row) => (
          <div key={row[0]!.id} role="none" className="surface-row">
            {row.map((item) =>
              option(item, { style: { '--surface-span': Math.max(1, Math.min(TWELVE, item.width)) } as CSSProperties }),
            )}
          </div>
        ))
      }
    />
  );
}
SurfaceRows.displayName = 'Surface.Rows';

// --- Grid --------------------------------------------------------------------

/** What `Surface.Grid` hands `createItem`: the cell it lands on and its footprint. */
export interface SurfaceGridBase extends SurfaceItem {
  at: SurfaceCell;
  size: SurfaceSize;
}

export interface SurfaceGridProps<T extends SurfaceGridItem = SurfaceGridItem>
  extends SurfaceBaseProps<T, SurfaceCell, SurfaceGridBase> {
  /** Cells across. */
  columns: number;
  /** Cells down. */
  rows: number;
  /** Pixels per cell, both ways. */
  cell: number;
  /** The footprint of a dropped tile that gives no `size`. Default `{ w: 1, h: 1 }`. */
  itemSize?: SurfaceSize;
  /** Draws a dot at each cell corner, where connection points sit. */
  showCells?: boolean;
}

interface GridTarget {
  at: SurfaceCell;
  size: SurfaceSize;
  /** The item moving, when it is one already on the grid. */
  id?: string;
}

function gridEngine<T extends SurfaceGridItem>(
  columns: number,
  rows: number,
  cell: number,
  itemSize: SurfaceSize,
): Engine<T, SurfaceCell, SurfaceGridBase, GridTarget> {
  const centre = (item: T) => ({ id: item.id, x: item.at.col + item.size.w / 2, y: item.at.row + item.size.h / 2 });
  return {
    order: (items) => [...items].sort((a, b) => a.at.row - b.at.row || a.at.col - b.at.col),
    dropTarget: (point, shelf) => {
      const size = shelf.size ?? itemSize;
      return { at: gridSnap(point, size, cell, columns, rows), size };
    },
    moveTarget: (point, grab, id, items) => {
      const item = items.find((other) => other.id === id);
      if (!item) return null;
      // Where the item's middle is now, snapped as a drop's is.
      const middle = {
        x: point.x - grab.x + (item.size.w * cell) / 2,
        y: point.y - grab.y + (item.size.h * cell) / 2,
      };
      return { at: gridSnap(middle, item.size, cell, columns, rows), size: item.size, id };
    },
    fits: (target, items) => gridFits(items, target.at, target.size, columns, rows, target.id),
    placeOf: (target) => ({ ...target.at }),
    add: (items, shelf, target, create) => {
      if (!gridFits(items, target.at, target.size, columns, rows)) return null;
      const item = create(shelf, {
        id: freshId(shelf.id, items),
        kind: shelf.id,
        at: { ...target.at },
        size: { ...target.size },
      });
      return { items: [...items, item], item };
    },
    move: (items, id, target) => {
      if (!gridFits(items, target.at, target.size, columns, rows, id)) return null;
      return items.map((item) => (item.id === id ? { ...item, at: { ...target.at } } : item));
    },
    step: (items, id, dir) => {
      const item = items.find((other) => other.id === id);
      if (!item) return null;
      const at = gridStepCell(item.at, dir);
      if (!gridFits(items, at, item.size, columns, rows, id)) return null;
      return items.map((other) => (other.id === id ? { ...other, at } : other));
    },
    where: (items, id) => {
      const item = items.find((other) => other.id === id);
      return item ? { ...item.at } : null;
    },
    remove: (items, id) => items.filter((item) => item.id !== id),
    neighbour: (items, id, dir) => {
      const item = items.find((other) => other.id === id);
      if (!item) return null;
      return (
        nearestIn(
          centre(item),
          dir,
          items.filter((other) => other.id !== id).map(centre),
        )?.id ?? null
      );
    },
    marker: (target, ok) => (
      <span
        aria-hidden
        className="surface-footprint"
        data-refused={ok ? undefined : ''}
        style={{
          left: target.at.col * cell,
          top: target.at.row * cell,
          width: target.size.w * cell,
          height: target.size.h * cell,
        }}
      />
    ),
    describe: (place) => `column ${place.col + 1}, row ${place.row + 1}`,
  };
}

/**
 * Surface.Grid — `columns × rows` cells, each `cell` pixels square: a bench
 * for parts, a building site. An item takes `size.w × size.h` cells from
 * its top-left cell `at`, snaps to cells, and never covers an occupied
 * cell — a drop or a move there is refused. Items are kept in cell units,
 * so changing `columns`, `rows` or `cell` keeps every position. A grid
 * larger than its box scrolls inside it.
 *
 * A drop from the shelf takes its footprint from the tile's `size`.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function SurfaceGrid<T extends SurfaceGridItem = SurfaceGridItem>({
  columns,
  rows,
  cell,
  itemSize = { w: 1, h: 1 },
  showCells,
  ...props
}: Readonly<SurfaceGridProps<T>>) {
  const engine = gridEngine<T>(columns, rows, cell, itemSize);
  return (
    <SurfaceFrame
      {...props}
      layout="grid"
      engine={engine}
      listClassName="surface-grid"
      listStyle={{ width: columns * cell, height: rows * cell, '--surface-cell': `${cell}px` } as CSSProperties}
      listData={{ 'data-cells': showCells ? '' : undefined }}
      body={(items, option) =>
        items.map((item) =>
          option(item, {
            style: {
              left: item.at.col * cell,
              top: item.at.row * cell,
              width: item.size.w * cell,
              height: item.size.h * cell,
            },
          }),
        )
      }
    />
  );
}
SurfaceGrid.displayName = 'Surface.Grid';
