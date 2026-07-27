// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../../utils/cn';
import './Chip.css';

/**
 * Theme-scope-aware tag primitive — a small chip whose colors and radius
 * come from CSS custom properties (`--chip-bg`, `--chip-fg`, `--chip-border`,
 * `--chip-radius`), so any ancestor can override the palette to match its
 * local theme.
 *
 * Named after the generic concept rather than a shape ("Chip" rather than
 * "Pill") because the radius is themeable: the default is pill-shaped
 * (9999px), but consumers can flip it to rounded or square locally
 * without changing the component.
 *
 * Pairs well with — but is intentionally simpler than — `Badge`:
 *
 * - **`Badge`** carries semantic status (info / success / warning / error),
 *   reads from app-level status tokens, and stays consistent across the page.
 * - **`Chip`** is a neutral tag primitive. It picks up whatever palette its
 *   ancestor scope provides — perfect for things like env tags inside a
 *   themed container, or kicker labels that should look "embedded" in their
 *   surrounding surface.
 *
 * ## Variants
 *
 * Both variants read from the same `--chip-*` tokens — the only difference
 * is whether the background is filled (`subtle`) or transparent (`outline`).
 * Override tokens on a wrapper to tint chips semantically:
 *
 * ```tsx
 * <div style={{
 *   '--chip-fg': 'var(--info-text)',
 *   '--chip-border': 'var(--info-border)',
 * } as React.CSSProperties}>
 *   <Chip variant="outline">info</Chip>
 * </div>
 * ```
 *
 * ## Composition
 *
 * By default Chip is a padded flex row with `gap-1.5`, so any children
 * render side-by-side. Use `<Chip.Dot/>` for the conventional
 * `currentColor` dot, or compose any icon, text, or other element
 * before/after the label. (In `split` mode the row instead becomes flush,
 * equal-height segments — see below.)
 *
 * Typography (mono, uppercase, etc.) is intentionally not on the chip label —
 * apply it via `className` or wrap the text in a typography primitive (e.g.
 * `<Text as="span" family="mono">`). The one exception is `<Chip.Key>`,
 * whose meta voice is intrinsic to the two-tone pattern.
 *
 * ## Two-tone (split) chips
 *
 * `split` turns the chip into a segmented key/value pill — a darker label
 * segment and a lighter value segment sharing one border and radius:
 *
 * ```tsx
 * <Chip split><Chip.Key>id</Chip.Key><Chip.Value>3445</Chip.Value></Chip>
 * ```
 *
 * Segment colors read from `--chip-key-bg/-fg` and `--chip-value-bg/-fg`,
 * so scopes re-skin them like any chip: a colored key is
 * `--chip-key-bg: var(--accent)` on a wrapper, and square corners are the
 * usual `--chip-radius` override — no extra variants needed.
 *
 * ```tsx
 * <Chip>v2.4</Chip>                              // default
 * <Chip variant="outline">draft</Chip>           // just a border
 * <Chip><Chip.Dot/> active</Chip>                // with leading dot
 *
 * // Themed scope — custom-property casts via React.CSSProperties so TS
 * // accepts the `--chip-*` keys (CSSProperties doesn't type custom props).
 * <section style={{ '--chip-bg': '#0a0d09' } as React.CSSProperties}>
 *   <Chip>prod</Chip>
 * </section>
 *
 * // Sharp corners
 * <div style={{ '--chip-radius': '0' } as React.CSSProperties}>
 *   <Chip>v2.4</Chip>
 * </div>
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export type ChipVariant = 'subtle' | 'outline';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: React.ReactNode;
  /**
   * Visual treatment.
   * - `'subtle'` (default) — `--chip-bg` background + border + text
   * - `'outline'` — transparent background, `--chip-border` outline + `--chip-fg` text
   *
   * Ignored when `split` is set — the segments paint their own backgrounds
   * from the `--chip-key-*` / `--chip-value-*` tokens.
   */
  variant?: ChipVariant;
  /**
   * Two-tone key/value mode: the chip becomes a segmented pill and its
   * padding moves into the segments — compose exactly `<Chip.Key>` +
   * `<Chip.Value>` as children. Segment colors come from the
   * `--chip-key-*` / `--chip-value-*` tokens, so a scope can re-skin them
   * (colored keys, square corners) without a component variant.
   *
   * ```tsx
   * <Chip split><Chip.Key>id</Chip.Key><Chip.Value>3445</Chip.Value></Chip>
   * ```
   */
  split?: boolean;
}

const ChipRoot: React.FC<ChipProps> = ({
  children,
  variant = 'subtle',
  split = false,
  className,
  ...rest
}) => (
  <span
    {...rest}
    className={cn(
      // Layout + typography baseline. In split mode the segments own the
      // padding and stretch to equal height; the root just clips them to
      // the pill radius.
      split
        ? 'inline-flex items-stretch overflow-hidden whitespace-nowrap'
        : 'inline-flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap',
      'text-xs font-medium leading-none',
      // Themable surface (overridable by any ancestor scope)
      'rounded-[var(--chip-radius,9999px)]',
      'text-(--chip-fg) border border-(--chip-border)',
      // Subtle has a filled background; outline is transparent. Split
      // segments paint their own backgrounds.
      !split && variant === 'subtle' && 'bg-(--chip-bg)',
      (split || variant === 'outline') && 'bg-transparent',
      className,
    )}
  >
    {children}
  </span>
);
ChipRoot.displayName = 'Chip';

interface DotProps {
  /**
   * When true, the dot animates an expanding-ring pulse in its current
   * color. Used by `LiveIndicator` for live-status pills, but available
   * to any chip composition (e.g. a recording indicator). Respects
   * `prefers-reduced-motion`.
   */
  pulse?: boolean;
  className?: string;
}

/**
 * Small leading/trailing dot in `currentColor`. Compose inside `<Chip>`
 * before or after the label. Opt-in to a pulsing animation via `pulse`.
 */
const Dot: React.FC<DotProps> = ({ pulse, className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'size-2 rounded-full bg-current opacity-70 shrink-0',
      pulse && 'animate-[chip-dot-pulse_3s_ease-out_infinite] motion-reduce:animate-none',
      className,
    )}
  />
);
Dot.displayName = 'Chip.Dot';

interface SegmentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The label segment of a split chip — the "key" in `id: 3445`. Carries the
 * meta voice (mono, uppercase, tracked) intrinsically: the key is always a
 * label, so its typography belongs to the pattern. Colors come from
 * `--chip-key-bg` / `--chip-key-fg`.
 */
const Key: React.FC<SegmentProps> = ({ children, className }) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-1.5',
      'bg-(--chip-key-bg) text-(--chip-key-fg)',
      'font-mono text-[10.5px] uppercase tracking-widest',
      className,
    )}
  >
    {children}
  </span>
);
Key.displayName = 'Chip.Key';

/**
 * The value segment of a split chip. Semibold, but family-neutral — the
 * value is content, so its typography belongs to the consumer: wrap in
 * `<Text as="span" family="mono">` for ids and code-ish values, leave
 * plain for prose. Colors come from `--chip-value-bg` / `--chip-value-fg`.
 */
const Value: React.FC<SegmentProps> = ({ children, className }) => (
  <span
    className={cn(
      'inline-flex items-center px-3 py-1.5',
      'bg-(--chip-value-bg) text-(--chip-value-fg) font-semibold',
      className,
    )}
  >
    {children}
  </span>
);
Value.displayName = 'Chip.Value';

export const Chip = Object.assign(ChipRoot, { Dot, Key, Value });
