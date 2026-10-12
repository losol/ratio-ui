// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useId, useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';

import { Minus, Plus } from '../../icons';
import { cn } from '../../utils/cn';

export type CounterSize = 'sm' | 'md' | 'lg';

/** Built-in text of `Counter`. Each entry falls back to English. */
export interface CounterLabels {
  /** Name of the − button. @default 'Decrease' */
  decrement?: string;
  /** Name of the + button. @default 'Increase' */
  increment?: string;
}

export interface CounterProps {
  /** Controlled value. */
  value?: number;
  /** Uncontrolled start value. @default minValue, or 0 */
  defaultValue?: number;
  /** Called with the new value on each press. */
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  /** How far one press moves. @default 1 */
  step?: number;
  /**
   * The value as shown — with its unit, a sign, a word. Defaults to the
   * number itself.
   */
  formatValue?: (value: number) => React.ReactNode;
  /** Visible name, set before the pill. */
  label?: React.ReactNode;
  /** Accessible name when there is no visible `label`. */
  'aria-label'?: string;
  /** Names of the two buttons. */
  labels?: CounterLabels;
  /** Height of the pill — same `sm | md | lg` scale as Button. @default 'md' */
  size?: CounterSize;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
}

const SIZE = {
  sm: { button: 'h-7 w-7', icon: 'h-3.5 w-3.5', value: 'min-w-10 text-sm', label: 'text-sm' },
  md: { button: 'h-9 w-9', icon: 'h-4 w-4', value: 'min-w-14 text-base', label: 'text-base' },
  lg: { button: 'h-10 w-10', icon: 'h-5 w-5', value: 'min-w-16 text-lg', label: 'text-lg' },
} as const;

const BUTTON = [
  'flex shrink-0 cursor-pointer items-center justify-center rounded-pill',
  'text-(--text) outline-none transition-colors',
  'hover:bg-[color-mix(in_srgb,var(--text)_7%,transparent)]',
  'pressed:bg-[color-mix(in_srgb,var(--text)_12%,transparent)]',
  'focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
].join(' ');

/**
 * Counter — a value with a − and a + round it, in a pill: the tempo, an
 * octave, how many seats. Each press moves one `step`; the buttons go
 * inactive at `minValue` and `maxValue`. `formatValue` writes the value
 * the way it reads ("110 bpm", "+1"), since the value is shown, not typed.
 *
 * Reach for `NumberField` when the user should be able to type the number
 * or the range is wide; a counter is for a handful of steps that are
 * nudged rather than entered.
 *
 * @example
 * ```tsx
 * <Counter
 *   label="Tempo"
 *   value={bpm}
 *   onChange={setBpm}
 *   minValue={40}
 *   maxValue={200}
 *   step={10}
 *   formatValue={(v) => `${v} bpm`}
 *   labels={{ decrement: 'Slower', increment: 'Faster' }}
 * />
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function Counter({
  value: valueProp,
  defaultValue,
  onChange,
  minValue = Number.NEGATIVE_INFINITY,
  maxValue = Number.POSITIVE_INFINITY,
  step = 1,
  formatValue,
  label,
  'aria-label': ariaLabel,
  labels,
  size = 'md',
  isDisabled = false,
  className,
  testId,
}: Readonly<CounterProps>) {
  const [inner, setInner] = useState(defaultValue ?? (Number.isFinite(minValue) ? minValue : 0));
  const value = valueProp ?? inner;
  const labelId = useId();

  const setValue = (next: number) => {
    const clamped = Math.min(maxValue, Math.max(minValue, next));
    if (valueProp === undefined) setInner(clamped);
    onChange?.(clamped);
  };

  const canDecrement = !isDisabled && value - step >= minValue;
  const canIncrement = !isDisabled && value + step <= maxValue;
  const s = SIZE[size];

  return (
    <div
      role="group"
      aria-label={label ? undefined : ariaLabel}
      aria-labelledby={label ? labelId : undefined}
      data-testid={testId}
      className={cn('inline-flex items-center gap-2.5', className)}
    >
      {label && (
        <span id={labelId} className={cn('font-semibold text-(--text)', s.label)}>
          {label}
        </span>
      )}
      <div
        className={cn(
          'inline-flex items-center gap-0.5 rounded-pill border border-border-1 bg-card p-0.75',
          isDisabled && 'opacity-60',
        )}
      >
        <AriaButton
          aria-label={labels?.decrement ?? 'Decrease'}
          isDisabled={!canDecrement}
          onPress={() => setValue(value - step)}
          className={cn(BUTTON, s.button)}
          data-testid={testId ? `${testId}-decrement` : undefined}
        >
          <Minus className={s.icon} aria-hidden="true" />
        </AriaButton>
        <output
          aria-live="polite"
          className={cn('text-center font-semibold tabular-nums text-(--text)', s.value)}
        >
          {formatValue ? formatValue(value) : value}
        </output>
        <AriaButton
          aria-label={labels?.increment ?? 'Increase'}
          isDisabled={!canIncrement}
          onPress={() => setValue(value + step)}
          className={cn(BUTTON, s.button)}
          data-testid={testId ? `${testId}-increment` : undefined}
        >
          <Plus className={s.icon} aria-hidden="true" />
        </AriaButton>
      </div>
    </div>
  );
}
