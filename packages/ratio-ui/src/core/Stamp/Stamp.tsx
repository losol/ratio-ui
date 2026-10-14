// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Stamp.css';

/** The ink: the brand, a status, or the text's own colour. */
export type StampTone = 'primary' | 'success' | 'warning' | 'error' | 'inherit';

export type StampSize = 'sm' | 'md';

export interface StampProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** @default 'primary' */
  tone?: StampTone;
  /** @default 'sm' */
  size?: StampSize;
  /**
   * The slant, in degrees. Stamps land askew; `0` sets it straight.
   * @default the theme's `--stamp-tilt` (-6deg)
   */
  tilt?: number;
  /**
   * Decoration: what the stamp says is said elsewhere on the page, so a
   * screen reader skips it.
   */
  decorative?: boolean;
  /** Element to render. @default 'span' */
  as?: React.ElementType;
  className?: string;
  children: ReactNode;
}

const TONE: Record<StampTone, string> = {
  primary: 'text-(--primary)',
  success: 'text-success-text',
  warning: 'text-warning-text',
  error: 'text-error-text',
  inherit: '',
};

const SIZE: Record<StampSize, string> = {
  sm: 'stamp-sm',
  md: 'stamp-md',
};

/**
 * Stamp — a word in capitals in a frame, at a slant, as a rubber stamp lands
 * on a paper that has been through the office: "Approved", "Filed",
 * "Overdue". Ink only: the frame and the word in one colour, no fill, so it
 * sits on any card or sheet. The frame, face, corner and slant come from the
 * `--stamp-*` tokens; Tabula stamps thicker, in its condensed face.
 *
 * A stamp is a verdict, not a label: for a count or a category use `Badge`;
 * for a status in a list use `Chip`.
 *
 * @example
 * ```tsx
 * <Stamp tone="success">Approved</Stamp>
 * <Stamp tone="error" tilt={4}>Overdue</Stamp>
 * ```
 */
export function Stamp({
  tone = 'primary',
  size = 'sm',
  tilt,
  decorative = false,
  as: Component = 'span',
  className,
  style,
  children,
  ...rest
}: StampProps) {
  return (
    <Component
      aria-hidden={decorative || undefined}
      className={cn('ratio-stamp', SIZE[size], TONE[tone], className)}
      style={tilt === undefined ? style : ({ ...style, '--stamp-tilt': `${tilt}deg` } as React.CSSProperties)}
      {...rest}
    >
      {children}
    </Component>
  );
}
Stamp.displayName = 'Stamp';
