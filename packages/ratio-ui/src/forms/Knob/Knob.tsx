// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useCallback, useRef, useState } from 'react';

import { cn } from '../../utils/cn';

export type KnobSize = 'sm' | 'md' | 'lg';
export type KnobScale = 'linear' | 'log';

export interface KnobProps {
  /** Visible name under the knob; also its accessible name. */
  label: string;
  /** Controlled value. */
  value?: number;
  /**
   * Uncontrolled start value — and the value a double-click returns to,
   * controlled or not.
   */
  defaultValue?: number;
  /** Called with the new value as the knob turns. */
  onChange?: (value: number) => void;
  /** Lowest value. @default 0 */
  minValue?: number;
  /** Highest value. @default 100 */
  maxValue?: number;
  /**
   * Snap the value to multiples of `step` from `minValue`, and move by one
   * step per arrow key. Linear scale only; without it the arrows move 2% of
   * the range.
   */
  step?: number;
  /**
   * `'log'` spreads the turn evenly over octaves — for frequency, time and
   * other quantities that are felt in ratios. `minValue` must then be above
   * zero.
   * @default 'linear'
   */
  scale?: KnobScale;
  /**
   * Readout under the label and the value screen readers announce. Defaults
   * to the rounded number.
   */
  formatValue?: (value: number) => string;
  /** Diameter of the knob. @default 'md' */
  size?: KnobSize;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
}

/** The knob turns through 270 degrees, from 7 o'clock round to 5 o'clock. */
const SWEEP = 270;
/** Pixels of vertical drag for a full turn — slower with Shift held. */
const DRAG_PX = 180;
const FINE_DRAG_PX = 600;

const SIZE = {
  sm: { ring: 'h-12 w-12', disc: 'h-9 w-9', pointer: 'top-1 h-2.5' },
  md: { ring: 'h-15 w-15', disc: 'h-11.5 w-11.5', pointer: 'top-1 h-3' },
  lg: { ring: 'h-19 w-19', disc: 'h-15 w-15', pointer: 'top-1.5 h-4' },
} as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Position of `value` on the turn, 0–1. */
export function knobToNormal(value: number, min: number, max: number, scale: KnobScale): number {
  if (max === min) return 0;
  const n = scale === 'log' ? Math.log(value / min) / Math.log(max / min) : (value - min) / (max - min);
  return clamp01(Number.isFinite(n) ? n : 0);
}

/** The value at position `normal` (0–1) on the turn, snapped to `step`. */
export function knobFromNormal(
  normal: number,
  min: number,
  max: number,
  scale: KnobScale,
  step?: number,
): number {
  const n = clamp01(normal);
  let value = scale === 'log' ? min * Math.pow(max / min, n) : min + n * (max - min);
  if (step && scale === 'linear') value = min + Math.round((value - min) / step) * step;
  return Math.min(max, Math.max(min, value));
}

/**
 * Knob — a rotary control for one continuous parameter: the volume, the
 * cutoff, the length of a note. Drag up or down to turn it (Shift for fine
 * movement), use the arrow keys when it has focus (Page Up/Down for a tenth
 * of the turn, Home/End for the ends), and double-click to return to
 * `defaultValue`. A `role="slider"` to assistive technology, with
 * `formatValue` as the spoken value.
 *
 * Reach for a slider or `NumberField` when the user should see the whole
 * range at once or type a number; a knob is for a panel of parameters that
 * are set by ear or by eye, where the compact footprint matters.
 *
 * Colours come from the `--knob-fill`, `--knob-track`, `--knob-face` and
 * `--knob-pointer` tokens (tokens/knob.css), so a scope can reskin its knobs.
 * The arc is at least 48px across, so it is a touch target on its own.
 *
 * @example
 * ```tsx
 * <Knob
 *   label="Cutoff"
 *   scale="log"
 *   minValue={80}
 *   maxValue={12000}
 *   defaultValue={5000}
 *   value={cutoff}
 *   onChange={setCutoff}
 *   formatValue={(hz) => (hz >= 1000 ? `${(hz / 1000).toFixed(1)} kHz` : `${Math.round(hz)} Hz`)}
 * />
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function Knob({
  label,
  value: valueProp,
  defaultValue,
  onChange,
  minValue = 0,
  maxValue = 100,
  step,
  scale = 'linear',
  formatValue,
  size = 'md',
  isDisabled = false,
  className,
  testId,
}: Readonly<KnobProps>) {
  const [inner, setInner] = useState(defaultValue ?? minValue);
  const value = valueProp ?? inner;
  const normal = knobToNormal(value, minValue, maxValue, scale);
  const degrees = normal * SWEEP;

  const setValue = useCallback(
    (next: number) => {
      if (valueProp === undefined) setInner(next);
      onChange?.(next);
    },
    [onChange, valueProp],
  );
  const setNormal = (n: number) => setValue(knobFromNormal(n, minValue, maxValue, scale, step));

  // The drag reads the knob's value at pointer-down, then moves relative to
  // it, so a slow drag and a fast one cover the same distance.
  const drag = useRef<{ y: number; normal: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDisabled || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, normal };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const px = e.shiftKey ? FINE_DRAG_PX : DRAG_PX;
    setNormal(drag.current.normal + (drag.current.y - e.clientY) / px);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const arrow = step && scale === 'linear' ? step / (maxValue - minValue) : 0.02;
    const by: Record<string, number | undefined> = {
      ArrowUp: arrow,
      ArrowRight: arrow,
      ArrowDown: -arrow,
      ArrowLeft: -arrow,
      PageUp: 0.1,
      PageDown: -0.1,
    };
    let next: number | undefined;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 1;
    else if (by[e.key] !== undefined) next = normal + (by[e.key] as number);
    if (next === undefined) return;
    e.preventDefault();
    setNormal(next);
  };

  const onDoubleClick = () => {
    if (!isDisabled && defaultValue !== undefined) setValue(defaultValue);
  };

  const readout = formatValue ? formatValue(value) : String(Math.round(value));
  const s = SIZE[size];

  return (
    <div
      role="slider"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-valuenow={Math.round(value * 100) / 100}
      aria-valuetext={readout}
      aria-orientation="vertical"
      aria-disabled={isDisabled || undefined}
      data-testid={testId}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
      className={cn(
        'ratio-knob inline-flex flex-col items-center gap-1.5 rounded-lg p-1',
        'touch-none select-none outline-none',
        'focus-visible:ring-4 focus-visible:ring-(--focus-ring)',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-ns-resize',
        className,
      )}
    >
      {/* The arc: the turned part in the primary colour, the rest in the border tone.
          `rounded-full`, not the pill token: a knob is a circle in every theme,
          where Bureau squares its pills off. */}
      <div
        aria-hidden
        className={cn('grid place-items-center rounded-full', s.ring)}
        style={{
          background: `conic-gradient(from 225deg, var(--knob-fill) 0deg ${degrees}deg, var(--knob-track) ${degrees}deg ${SWEEP}deg, transparent ${SWEEP}deg 360deg)`,
        }}
      >
        <div
          className={cn('relative rounded-full bg-(--knob-face) shadow-(--control-shadow)', s.disc)}
          style={{ transform: `rotate(${-SWEEP / 2 + degrees}deg)` }}
        >
          <span
            className={cn('absolute left-1/2 -ml-0.5 w-1 rounded-sm bg-(--knob-pointer)', s.pointer)}
          />
        </div>
      </div>
      <span className="text-sm font-semibold text-(--text)">{label}</span>
      <span className="text-xs tabular-nums text-(--text-muted)">{readout}</span>
    </div>
  );
}
