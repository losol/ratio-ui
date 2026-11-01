// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../../utils/cn';
import { useProgressAnimation } from './useProgressAnimation';

export type MeterTone =
  | 'primary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface MeterThreshold {
  /** Fraction of `max` (0–1) from which this tone applies: `0.85` is 85 %. */
  from: number;
  tone: MeterTone;
}

export interface MeterProps {
  value: number;
  max: number;
  /**
   * The bar's tone until a threshold takes over.
   * @default 'primary'
   */
  tone?: MeterTone;
  /**
   * Tone changes as the value climbs: the entry with the highest `from` at
   * or below the current fraction wins. Capacity: `[{ from: 0.85, tone:
   * 'accent' }, { from: 1, tone: 'warning' }]`.
   */
  thresholds?: MeterThreshold[];
  /** Bar height in px. @default 4 */
  height?: number;
  /** Accessible name — "Registrations". Or point `aria-labelledby` at the row's label. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** What the reader hears instead of the bare number: "48 of 60 seats". */
  valueText?: string;
  className?: string;
  testId?: string;
}

const toneClasses: Record<MeterTone, string> = {
  primary: 'bg-(--primary)',
  accent: 'bg-(--accent)',
  neutral: 'bg-(--text-subtle)',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

/** The tone for a fraction: the threshold with the highest `from` at or below it, else the base tone. */
export function meterTone(fraction: number, tone: MeterTone, thresholds: MeterThreshold[] = []): MeterTone {
  let current = tone;
  let best = -Infinity;
  for (const t of thresholds) {
    if (t.from <= fraction && t.from >= best) {
      best = t.from;
      current = t.tone;
    }
  }
  return current;
}

/**
 * A thin bar for a value against its ceiling — registrations against
 * capacity, storage used, a budget spent. The tone follows `thresholds`, so a
 * list can show at a glance which rows are nearly full. `role="meter"` with
 * `aria-valuenow`/`aria-valuemax`: this is a measurement, not the progress of
 * a task (that's `ProgressBar`). Give it a name with `aria-label` or
 * `aria-labelledby`; the row's own text shows the numbers.
 *
 * @example
 * <Meter
 *   value={51}
 *   max={60}
 *   thresholds={[{ from: 0.85, tone: 'accent' }, { from: 1, tone: 'warning' }]}
 *   aria-label="Registrations"
 *   valueText="51 of 60 seats"
 * />
 */
export const Meter: React.FC<MeterProps> = ({
  value,
  max,
  tone = 'primary',
  thresholds,
  height = 4,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  valueText,
  className,
  testId,
}) => {
  const { pct, animated } = useProgressAnimation(value, max);
  const fraction = max > 0 ? value / max : 0;
  const current = meterTone(fraction, tone, thresholds);

  return (
    <div
      role="meter"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={valueText}
      data-tone={current}
      data-testid={testId}
      className={cn('w-full overflow-hidden rounded-pill bg-border-1', className)}
      style={{ height }}
    >
      <div
        className={cn('h-full rounded-pill transition-[width] duration-500 ease-out', toneClasses[current])}
        style={{ width: `${(animated ? pct : 0) * 100}%` }}
      />
    </div>
  );
};
