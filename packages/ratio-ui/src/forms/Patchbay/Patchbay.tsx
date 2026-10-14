// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/cn';
import './Patchbay.css';

export type PatchbayDirection = 'in' | 'out';

/**
 * How a cable is drawn: a `cable` hangs in a curve, as on a rack; `straight`
 * is one line, as in a quiz; `elbow` turns at right angles, as in a diagram.
 */
export type PatchbayConnector = 'cable' | 'straight' | 'elbow';

/** A cable: `from` is an output port, `to` an input port. */
export interface PatchbayConnection {
  from: string;
  to: string;
}

/** What the board knows about a port — handed to `canConnect` and the labels. */
export interface PatchbayPortInfo {
  id: string;
  direction: PatchbayDirection;
  /** Free-form family of the port, for rules and colour: `'audio'`, `'answer'`. */
  kind?: string;
  /** Spoken name of the port. */
  name: string;
  color?: string;
}

export interface PatchbayChange {
  type: 'connect' | 'disconnect';
  connection: PatchbayConnection;
}

/** Built-in text of `Patchbay`. Each entry falls back to English. */
export interface PatchbayLabels {
  /** Announced when a port is picked up, waiting for its other end. */
  pickedUp?: (port: PatchbayPortInfo) => string;
  /** Announced when a picked-up port is put down again. */
  putDown?: string;
  connected?: (from: PatchbayPortInfo, to: PatchbayPortInfo) => string;
  disconnected?: (from: PatchbayPortInfo, to: PatchbayPortInfo) => string;
  /** Accessible name of a cable. */
  cable?: (from: PatchbayPortInfo, to: PatchbayPortInfo) => string;
  /** Name of the remove button on a selected cable. @default 'Remove cable' */
  remove?: string;
}

export interface PatchbayProps {
  /** Controlled cables. */
  connections?: PatchbayConnection[];
  /** Uncontrolled start cables. */
  defaultConnections?: PatchbayConnection[];
  /** Fires with the whole new set and the one cable that changed. */
  onConnectionsChange?: (next: PatchbayConnection[], change: PatchbayChange) => void;
  /**
   * The rules: whether a new cable may run from `from` to `to`, given the
   * cables there are. Direction is already settled (an output to an input,
   * never the same port) and a cable that already exists is removed instead
   * of asked about. Without it, anything goes — one output to many inputs,
   * many outputs to one input.
   */
  canConnect?: (
    from: PatchbayPortInfo,
    to: PatchbayPortInfo,
    connections: PatchbayConnection[],
  ) => boolean;
  /** Draw the cables, take no input — a diagram. */
  readOnly?: boolean;
  /**
   * How a cable is drawn. `cable` (default) hangs in a curve, the way a
   * patch cable does; `straight` is one line from port to port, for a quiz;
   * `elbow` turns at right angles, down, across and down, for a chart that
   * reads top to bottom. Press feedback and the remove button sit on the
   * line whichever it is.
   */
  connector?: PatchbayConnector;
  /** Dashes moving from output to input along each cable. Off for reduced motion. */
  flow?: boolean;
  labels?: PatchbayLabels;
  /** Accessible name of the board. */
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
  testId?: string;
}

interface PortEntry extends PatchbayPortInfo {
  el: HTMLElement;
  /** An anchor: a point a line ends at, with no socket drawn. */
  anchor?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface PatchbayContextValue {
  boardId: string;
  readOnly: boolean;
  register: (entry: PortEntry) => () => void;
  pending: string | null;
  connectedIds: ReadonlySet<string>;
  isTarget: (id: string) => boolean;
  press: (id: string) => void;
  dragStart: (id: string, e: React.PointerEvent<HTMLElement>) => void;
  dragMove: (e: React.PointerEvent<HTMLElement>) => void;
  dragEnd: (id: string, e: React.PointerEvent<HTMLElement>) => void;
}

const PatchbayContext = createContext<PatchbayContextValue | null>(null);

const DEFAULT_LABELS: Required<PatchbayLabels> = {
  pickedUp: (port) => `${port.name} picked up. Choose a port to connect it to, or press Escape.`,
  putDown: 'Put down.',
  connected: (from, to) => `Connected ${from.name} to ${to.name}.`,
  disconnected: (from, to) => `Disconnected ${from.name} from ${to.name}.`,
  cable: (from, to) => `Cable from ${from.name} to ${to.name}`,
  remove: 'Remove cable',
};

/** A tap that moves less than this is a press, not a drag. */
const DRAG_THRESHOLD = 8;

const cableKey = (c: PatchbayConnection) => `${c.from}→${c.to}`;

/** A hanging cable: a cubic curve whose sag grows with the distance. */
const sagOf = (a: Point, b: Point) =>
  Math.min(140, 30 + Math.abs(b.x - a.x) * 0.25 + Math.abs(b.y - a.y) * 0.15);
const curve = (a: Point, b: Point) => {
  const sag = sagOf(a, b);
  return `M${a.x} ${a.y} C${a.x} ${a.y + sag}, ${b.x} ${b.y + sag}, ${b.x} ${b.y}`;
};
/** One line, port to port. */
const straight = (a: Point, b: Point) => `M${a.x} ${a.y} L${b.x} ${b.y}`;
/**
 * Two right angles, for a chart that reads top to bottom: down from the
 * port, across at the middle, down into the other. Two elbows leaving one
 * port run together until they part, as the branches of a chart do.
 */
const elbow = (a: Point, b: Point) => {
  const my = (a.y + b.y) / 2;
  return `M${a.x} ${a.y} V${my} H${b.x} V${b.y}`;
};
const PATHS: Record<PatchbayConnector, (a: Point, b: Point) => string> = { cable: curve, straight, elbow };
/** Where the remove button sits: on the line, at its middle. */
const midpoint = (connector: PatchbayConnector, a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2 + (connector === 'cable' ? sagOf(a, b) * 0.75 : 0),
});

const samePositions = (a: Record<string, Point>, b: Record<string, Point>) => {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => {
    const pa = a[k];
    const pb = b[k];
    return pa !== undefined && pb !== undefined && pa.x === pb.x && pa.y === pb.y;
  });
};

/**
 * Patchbay — connect things with cables: an oscillator to a filter, a
 * question to its answer, a battery to a lamp. The ports sit in ordinary
 * markup (a card's footer, two columns, a schematic); the board measures
 * them and draws the cables on top, following the layout as it changes.
 *
 * Three ways to connect, all the same gesture: drag from one port to
 * another; press one port and then the other; or, with the keyboard, focus
 * a port, Enter to pick it up, Tab to the other port, Enter to connect
 * (Escape puts it down). Doing it again on a cable that exists removes it,
 * as does selecting the cable and pressing Delete, or its remove button.
 *
 * One output may feed many inputs and one input may take many outputs;
 * `canConnect` is where an app says otherwise. Colours come from the
 * `--patchbay-*` tokens (tokens/patchbay.css) and each port's `color`.
 *
 * @example
 * ```tsx
 * <Patchbay aria-label="Rack" connections={cables} onConnectionsChange={setCables}>
 *   <Card>…<Card.Footer><Patchbay.Port id="osc.out" direction="out" label="Out" name="Oscillator out" /></Card.Footer></Card>
 *   <Card>…<Card.Footer><Patchbay.Port id="filter.in" direction="in" label="In" name="Filter in" /></Card.Footer></Card>
 * </Patchbay>
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function PatchbayRoot({
  connections: connectionsProp,
  defaultConnections,
  onConnectionsChange,
  canConnect,
  readOnly = false,
  flow = false,
  connector = 'cable',
  labels,
  'aria-label': ariaLabel,
  className,
  children,
  testId,
}: Readonly<PatchbayProps>) {
  const boardId = useId();
  const text = { ...DEFAULT_LABELS, ...labels };
  const path = PATHS[connector];

  const [inner, setInner] = useState<PatchbayConnection[]>(() => defaultConnections ?? []);
  const connections = connectionsProp ?? inner;

  const rootRef = useRef<HTMLDivElement>(null);
  // The ports, as state: a port registering is a render, since the cables
  // and the sockets' looks depend on who is on the board.
  const [ports, setPorts] = useState<ReadonlyMap<string, PortEntry>>(() => new Map());
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ from: string; to: Point } | null>(null);
  const [status, setStatus] = useState('');

  // --- Measuring: every port's centre, relative to the board. -------------
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rr = root.getBoundingClientRect();
    const next: Record<string, Point> = {};
    ports.forEach((p, id) => {
      const b = p.el.getBoundingClientRect();
      if (!b.width) return;
      next[id] = { x: b.left + b.width / 2 - rr.left, y: b.top + b.height / 2 - rr.top };
    });
    setPositions((prev) => (samePositions(prev, next) ? prev : next));
  }, [ports]);

  // Children, cables or ports changed: measure before paint.
  useLayoutEffect(measure, [measure, children, connections]);

  // The layout moves under the ports: a card opens, a column wraps, a font
  // arrives. Watch the board and every port, and the events that move things
  // without resizing the board.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    ports.forEach((p) => ro.observe(p.el));
    const onEvent = () => measure();
    root.addEventListener('toggle', onEvent, true);
    root.addEventListener('transitionend', onEvent, true);
    window.addEventListener('resize', onEvent);
    document.fonts?.ready.then(onEvent).catch(() => {});
    return () => {
      ro.disconnect();
      root.removeEventListener('toggle', onEvent, true);
      root.removeEventListener('transitionend', onEvent, true);
      window.removeEventListener('resize', onEvent);
    };
  }, [measure, ports]);

  const register = useCallback((entry: PortEntry) => {
    setPorts((prev) => new Map(prev).set(entry.id, entry));
    return () => {
      setPorts((prev) => {
        const next = new Map(prev);
        next.delete(entry.id);
        return next;
      });
    };
  }, []);

  // --- Connecting. --------------------------------------------------------
  const info = (id: string): PatchbayPortInfo | undefined => ports.get(id);

  const commit = (next: PatchbayConnection[], change: PatchbayChange) => {
    if (connectionsProp === undefined) setInner(next);
    onConnectionsChange?.(next, change);
  };

  /** The cable two ports would make, output to input — or nothing. */
  const resolve = (a: string, b: string): PatchbayConnection | null => {
    const pa = ports.get(a);
    const pb = ports.get(b);
    if (!pa || !pb || a === b || pa.direction === pb.direction) return null;
    return pa.direction === 'out' ? { from: a, to: b } : { from: b, to: a };
  };

  const remove = (c: PatchbayConnection) => {
    const from = info(c.from);
    const to = info(c.to);
    commit(
      connections.filter((x) => !(x.from === c.from && x.to === c.to)),
      { type: 'disconnect', connection: c },
    );
    if (from && to) setStatus(text.disconnected(from, to));
    setSelected(null);
  };

  /** Connect two ports, or disconnect them if the cable is there. */
  const toggle = (a: string, b: string): boolean => {
    const c = resolve(a, b);
    if (!c) return false;
    const current = connections;
    if (current.some((x) => x.from === c.from && x.to === c.to)) {
      remove(c);
      return true;
    }
    const from = info(c.from)!;
    const to = info(c.to)!;
    if (canConnect && !canConnect(from, to, current)) return false;
    commit([...current, c], { type: 'connect', connection: c });
    setStatus(text.connected(from, to));
    return true;
  };

  const press = (id: string) => {
    if (readOnly) return;
    setSelected(null);
    if (pending === null) {
      setPending(id);
      const p = info(id);
      if (p) setStatus(text.pickedUp(p));
    } else if (pending === id) {
      setPending(null);
      setStatus(text.putDown);
    } else if (toggle(pending, id)) {
      setPending(null);
    } else {
      // Not a pair: the press was the start of a new cable.
      setPending(id);
      const p = info(id);
      if (p) setStatus(text.pickedUp(p));
    }
  };

  // Drag: the port captures the pointer, so the move and the release reach
  // it wherever the pointer goes. Under the threshold it is a press.
  const dragRef = useRef<{ id: string; x0: number; y0: number; moved: boolean } | null>(null);
  const dragStart = (id: string, e: React.PointerEvent<HTMLElement>) => {
    if (readOnly || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id, x0: e.clientX, y0: e.clientY, moved: false };
  };
  const dragMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < DRAG_THRESHOLD) return;
    d.moved = true;
    const rr = rootRef.current?.getBoundingClientRect();
    if (rr) setDrag({ from: d.id, to: { x: e.clientX - rr.left, y: e.clientY - rr.top } });
  };
  const dragEnd = (id: string, e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDrag(null);
    if (!d.moved) {
      press(id);
      return;
    }
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-patchbay-port]');
    const target = el?.dataset.patchbayPort;
    if (el?.dataset.patchbay === boardId && target && toggle(d.id, target)) setPending(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape') return;
    if (pending !== null) {
      setPending(null);
      setStatus(text.putDown);
    }
    setSelected(null);
  };

  // --- What the ports read. -----------------------------------------------
  const connectedIds = useMemo(() => {
    const s = new Set<string>();
    connections.forEach((c) => {
      s.add(c.from);
      s.add(c.to);
    });
    return s;
  }, [connections]);

  const isTarget = (id: string) => {
    if (pending === null || pending === id) return false;
    const c = resolve(pending, id);
    if (!c) return false;
    if (connections.some((x) => x.from === c.from && x.to === c.to)) return true;
    const from = info(c.from)!;
    const to = info(c.to)!;
    return !canConnect || canConnect(from, to, connections);
  };

  const ctx: PatchbayContextValue = {
    boardId,
    readOnly,
    register,
    pending,
    connectedIds,
    isTarget,
    press,
    dragStart,
    dragMove,
    dragEnd,
  };

  // --- The cables. --------------------------------------------------------
  const colorOf = (c: PatchbayConnection) => info(c.from)?.color ?? info(c.to)?.color;
  const cables = connections.flatMap((c) => {
    const a = positions[c.from];
    const b = positions[c.to];
    if (!a || !b) return [];
    const from = ports.get(c.from);
    const to = ports.get(c.to);
    return [
      {
        key: cableKey(c),
        c,
        a,
        b,
        color: colorOf(c),
        name: from && to ? text.cable(from, to) : undefined,
        // A line into an anchor ends flush with it; a cable into a socket ends in a plug.
        endA: !from?.anchor,
        endB: !to?.anchor,
      },
    ];
  });
  const dragFrom = drag ? positions[drag.from] : undefined;
  const dragLine = drag && dragFrom ? { a: dragFrom, b: drag.to, color: info(drag.from)?.color } : null;

  return (
    <PatchbayContext.Provider value={ctx}>
      <div
        ref={rootRef}
        role="group"
        aria-label={ariaLabel}
        data-testid={testId}
        data-patchbay-board={boardId}
        onKeyDown={onKeyDown}
        data-connector={connector}
        className={cn('patchbay', readOnly && 'patchbay--read-only', className)}
      >
        {children}
        <svg className="patchbay-cables" aria-hidden={readOnly || undefined}>
          {cables.map(({ key, c, a, b, color, name, endA, endB }) => {
            const d = path(a, b);
            const style = color ? ({ '--patchbay-cable-color': color } as React.CSSProperties) : undefined;
            const isSelected = selected === key;
            const mid = midpoint(connector, a, b);
            return (
              <g key={key} className={cn('patchbay-cable', isSelected && 'is-selected')} style={style}>
                <path className="patchbay-cable-shadow" d={d} />
                <path className={cn('patchbay-cable-line', flow && 'patchbay-cable-line--flow')} d={d} />
                {endA && <circle className="patchbay-cable-end" cx={a.x} cy={a.y} r={7} />}
                {endB && <circle className="patchbay-cable-end" cx={b.x} cy={b.y} r={7} />}
                {!readOnly && (
                  <path
                    className="patchbay-cable-hit"
                    d={d}
                    role="button"
                    tabIndex={0}
                    aria-label={name}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setPending(null);
                      setSelected(isSelected ? null : key);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Delete' || e.key === 'Backspace') {
                        e.preventDefault();
                        remove(c);
                      } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(isSelected ? null : key);
                      }
                    }}
                  />
                )}
                {isSelected && (
                  <g
                    className="patchbay-cable-remove"
                    role="button"
                    tabIndex={0}
                    aria-label={text.remove}
                    transform={`translate(${mid.x} ${mid.y})`}
                    onClick={() => remove(c)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        remove(c);
                      }
                    }}
                  >
                    <circle r={11} />
                    <path d="M-4 -4 L4 4 M4 -4 L-4 4" />
                  </g>
                )}
              </g>
            );
          })}
          {dragLine && (
            <g
              className="patchbay-cable patchbay-cable--drag"
              style={dragLine.color ? ({ '--patchbay-cable-color': dragLine.color } as React.CSSProperties) : undefined}
            >
              <path className="patchbay-cable-shadow" d={path(dragLine.a, dragLine.b)} />
              <path className="patchbay-cable-line" d={path(dragLine.a, dragLine.b)} />
              <circle className="patchbay-cable-end" cx={dragLine.a.x} cy={dragLine.a.y} r={7} />
              <circle className="patchbay-cable-end" cx={dragLine.b.x} cy={dragLine.b.y} r={7} />
            </g>
          )}
        </svg>
        <span className="sr-only" aria-live="polite">
          {status}
        </span>
      </div>
    </PatchbayContext.Provider>
  );
}
PatchbayRoot.displayName = 'Patchbay';

export interface PatchbayPortProps {
  /** Stable identity; what a connection names. */
  id: string;
  direction: PatchbayDirection;
  /** Free-form family of the port, for `canConnect` rules: `'audio'`, `'control'`, `'answer'`. */
  kind?: string;
  /** Short visible text under the socket. */
  label?: ReactNode;
  /** Spoken name — the module and the socket: "Oscillator 1 out". Defaults to `label` when it is text, else `id`. */
  name?: string;
  /** Any CSS colour for the socket and the cables that leave it. Defaults to `--patchbay-cable`. */
  color?: string;
  /**
   * An anchor: a point a line ends at, with no socket drawn and nothing to
   * press — the edge of a box in a diagram. Place it where the line should
   * meet the box. For a `readOnly` board; an anchor cannot be connected by
   * hand.
   */
  anchor?: boolean;
  className?: string;
}

/**
 * A socket on the board. Put it where the thing it belongs to is — a card's
 * footer, a row of a list — and the board finds it.
 */
export function PatchbayPort({
  id,
  direction,
  kind,
  label,
  name,
  color,
  anchor = false,
  className,
}: Readonly<PatchbayPortProps>) {
  const ctx = useContext(PatchbayContext);
  if (!ctx) throw new Error('[ratio-ui] Patchbay.Port must be rendered inside a Patchbay.');
  const ref = useRef<HTMLElement>(null);
  const spoken = name ?? (typeof label === 'string' ? label : id);

  useLayoutEffect(() => {
    if (!ref.current) return;
    return ctx.register({ id, direction, kind, name: spoken, color, anchor, el: ref.current });
    // `register` is stable; re-register when the port's facts change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.register, id, direction, kind, spoken, color, anchor]);

  if (anchor) {
    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        aria-hidden
        data-patchbay-port={id}
        data-patchbay={ctx.boardId}
        data-direction={direction}
        className={cn('patchbay-anchor', className)}
        style={color ? ({ '--patchbay-cable-color': color } as React.CSSProperties) : undefined}
      />
    );
  }

  const connected = ctx.connectedIds.has(id);
  const pending = ctx.pending === id;
  const style = color ? ({ '--patchbay-port-color': color } as React.CSSProperties) : undefined;
  const socketClass = cn(
    'patchbay-port',
    connected && 'is-connected',
    pending && 'is-pending',
    !pending && ctx.isTarget(id) && 'is-target',
  );
  const dot = <span aria-hidden className="patchbay-port-dot" />;

  return (
    <span className={cn('patchbay-port-wrap', className)}>
      {ctx.readOnly ? (
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          role="img"
          aria-label={spoken}
          data-patchbay-port={id}
          data-patchbay={ctx.boardId}
          data-direction={direction}
          className={socketClass}
          style={style}
        >
          {dot}
        </span>
      ) : (
        <button
          ref={ref as React.RefObject<HTMLButtonElement>}
          type="button"
          aria-label={spoken}
          aria-pressed={pending}
          data-patchbay-port={id}
          data-patchbay={ctx.boardId}
          data-direction={direction}
          className={socketClass}
          style={style}
          onPointerDown={(e) => ctx.dragStart(id, e)}
          onPointerMove={ctx.dragMove}
          onPointerUp={(e) => ctx.dragEnd(id, e)}
          onPointerCancel={(e) => ctx.dragEnd(id, e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              ctx.press(id);
            }
          }}
        >
          {dot}
        </button>
      )}
      {label && <span className="patchbay-port-label">{label}</span>}
    </span>
  );
}
PatchbayPort.displayName = 'Patchbay.Port';
