// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

import { Chip } from '../Chip';
import { cn } from '../../utils/cn';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
export type SaveStatusSize = 'sm' | 'md';

export interface SaveStatusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Where the save stands. `idle` means nothing has changed since the last
   * one — not "unsaved": a surface that autosaves has no unsaved state to
   * report, and saying so is what buys the reader's trust in the missing
   * Save button.
   */
  status: SaveState;
  /**
   * Rendered after the `saved` label — a formatted time, e.g. `"12:04"`.
   * Callers format it, since only they know the locale and the precision
   * worth showing.
   */
  savedAt?: React.ReactNode;
  /** Replace the default English labels, e.g. for another language. */
  labels?: Partial<Record<SaveState, React.ReactNode>>;
  /** @default 'md' */
  size?: SaveStatusSize;
  className?: string;
  testId?: string;
}

// Built on Chip, which owns the pill geometry — including `--chip-radius`,
// so a scope that squares its chips squares this too. Only the skin differs:
// the semantic status tokens instead of the chip ones, and mono because the
// saved state ends in a clock reading.
//
// Not Badge: its subtle variant is uppercase mono bold, too loud a voice for
// a line that moves as you type, and worse for a timestamp.
const STATE_STYLE: Record<SaveState, string> = {
  idle: 'bg-transparent border-border-2 text-(--text-subtle)',
  saving: 'bg-warning-bg border-warning-border text-warning-text',
  saved: 'bg-success-bg border-success-border text-success-text',
  error: 'bg-error-bg border-error-border text-error-text',
};

const DEFAULT_LABELS: Record<SaveState, string> = {
  idle: 'No changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Not saved',
};

const SIZE: Record<SaveStatusSize, string> = {
  sm: 'px-2.5 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

/**
 * SaveStatus — the pill on a surface that saves by itself, reporting where
 * the last save got to.
 *
 * It exists to replace a Save button, so it has to be trusted: show `saving`
 * the moment the request leaves, `saved` with the time it landed, and
 * `error` when it didn't — silence after a failed save is the one outcome
 * that loses the reader's work.
 *
 * The state is the caller's: an app knows when its request starts and
 * resolves, and no timer here could. Announced politely via `role="status"`,
 * which is overridable along with the rest of the span's attributes.
 *
 * @example
 * ```tsx
 * <SaveStatus status={state} savedAt={savedAt && format(savedAt, 'HH:mm')} />
 * ```
 *
 * @example Another language:
 * ```tsx
 * <SaveStatus
 *   status={state}
 *   labels={{ idle: 'Ingen endringer', saving: 'Lagrer …', saved: 'Lagret' }}
 * />
 * ```
 */
export function SaveStatus({
  status,
  savedAt,
  labels,
  size = 'md',
  className,
  testId,
  ...rest
}: Readonly<SaveStatusProps>) {
  const label = labels?.[status] ?? DEFAULT_LABELS[status];

  return (
    <Chip
      role="status"
      {...rest}
      // Only override when `testId` is set: `data-testid={undefined}` after
      // the spread would drop a forwarded one (same guard as `Heading`).
      {...(testId !== undefined && { 'data-testid': testId })}
      data-state={status}
      className={cn('font-mono transition-colors', SIZE[size], STATE_STYLE[status], className)}
    >
      {label}
      {/* A real space, not the flex gap: bare text nodes aren't flex items,
          and the gap would leave the accessible text as "Saved12:04". */}
      {status === 'saved' && savedAt ? <>{' '}{savedAt}</> : null}
    </Chip>
  );
}
