// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'filled' | 'subtle' | 'count';

/**
 * Tone for badges that carry no status. `primary` and `accent` are the brand
 * colours, as in `Heading.Eyebrow`. `inherit` takes the surrounding text
 * colour on a translucent tint of it, so a badge composed inside a button, tab
 * or link matches its host.
 */
export type BadgeTone = 'primary' | 'accent' | 'inherit';

export type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  status?: Status;
  /**
   * Visual treatment.
   * - `'filled'` (default) — solid status-tinted background with white
   *   text. Use for prominent indicators where the badge needs to read
   *   from across the page.
   * - `'subtle'` — outline pill with mono-uppercase text on a quiet
   *   tinted background. Use as a category tag or kicker where the
   *   badge sits inside a larger card or list row and shouldn't shout.
   * - `'count'` (beta) — a small solid pill for a number or a single
   *   glyph: unread counts, tallies, an `@` for a mention.
   */
  variant?: BadgeVariant;
  /**
   * Colour from the brand instead of `status`, for a badge that reports no
   * state — an unread count is news, not a warning. `inherit` follows the
   * host's text colour, e.g. a count inside a `Button`. Applies to `filled`
   * and `count`.
   * @beta
   */
  tone?: BadgeTone;
  block?: boolean;
  definition?: boolean;
  label?: string;
};

const filledStatusClasses: Record<Status, string> = {
  neutral: 'bg-neutral-700 dark:bg-neutral-800 text-white',
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
};

const subtleStatusClasses: Record<Status, string> = {
  neutral: 'bg-card border border-border-1 text-(--text-muted)',
  info: 'bg-info-bg border border-info-border text-info-text',
  success: 'bg-success-bg border border-success-border text-success-text',
  warning: 'bg-warning-bg border border-warning-border text-warning-text',
  error: 'bg-error-bg border border-error-border text-error-text',
};

const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-(--primary) text-(--text-on-primary)',
  accent: 'bg-(--accent) text-(--text-on-accent)',
  inherit: 'bg-current/15',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  status = 'neutral',
  variant = 'filled',
  tone,
  block = false,
  definition = false,
  label,
}) => {
  const isSubtle = variant === 'subtle';
  const variantClasses = isSubtle
    ? subtleStatusClasses[status]
    : tone
      ? toneClasses[tone]
      : filledStatusClasses[status];

  if (variant === 'count') {
    return (
      <span
        className={cn(
          'inline-block min-w-4.5 rounded-full px-1.75 py-px text-center align-middle text-[11px] leading-4 font-bold tabular-nums',
          variantClasses,
          className,
        )}
      >
        {children}
      </span>
    );
  }

  const base = cn(
    block && 'block',
    variantClasses,
    'leading-none',
    isSubtle
      ? 'font-mono text-[10px] uppercase tracking-wider font-bold rounded-full'
      : 'text-xs rounded',
  );

  if (definition && label) {
    return (
      <span className={cn(base, 'flex overflow-hidden', className)}>
        <dt
          className={cn(
            'px-2 py-2 font-medium uppercase tracking-wide',
            isSubtle ? 'bg-(--text-muted)/10' : 'bg-black/20',
          )}
        >
          {label}
        </dt>
        <dd className="px-2 py-2 m-0">{children}</dd>
      </span>
    );
  }

  return (
    <span className={cn(base, isSubtle ? 'px-2 py-1' : 'p-2', className)}>
      {children}
    </span>
  );
};
