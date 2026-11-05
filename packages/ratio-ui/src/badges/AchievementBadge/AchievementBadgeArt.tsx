// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';
import {
  BADGE_BOX,
  BADGE_LAYOUT,
  BADGE_TIER_COLORS,
  badgeOutline,
  captionFontSize,
  symbolFontSize,
  type BadgeDisplay,
  type BadgeState,
} from '@eventuras/ratio-ui-core/badges';
import { cn } from '../../utils/cn';
import './AchievementBadge.css';

/**
 * The medallion's colours. On a page they default to the `--badge-*`
 * tokens, so the art follows the theme; for a file (an SVG to bake, a PNG
 * to download) pass the resolved values, since a custom property means
 * nothing outside the page it was set on.
 */
export interface BadgeArtColors {
  /** The frame, the emblem and the words. @default var(--badge-ink) */
  ink?: string;
  /** The fill. @default var(--badge-paper) */
  paper?: string;
  /** The tier ring. @default the tier's `--badge-<tier>` token */
  metal?: string;
  /** The ink of a locked badge. @default var(--badge-muted) */
  muted?: string;
}

export interface AchievementBadgeArtProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'display' | 'title'> {
  display?: BadgeDisplay;
  /** @default 'earned' */
  state?: BadgeState;
  /** 0–1, drawn around the rim when the state is `in-progress`. */
  progress?: number;
  /**
   * A glyph in the middle, in 24 units like a Lucide icon
   * (`<Calculator />`). Drawn in the ink. Wins over `display.symbol`.
   */
  emblem?: ReactNode;
  /** The accessible name; `<title>` of the SVG. Omit for art that is described beside it. */
  title?: string;
  colors?: BadgeArtColors;
  /** The outline's stroke, in the art's units. @default var(--badge-frame) */
  frame?: number | string;
  /** The face of the symbol and caption. @default var(--badge-font-family) */
  fontFamily?: string;
}

/**
 * The medallion alone: an SVG in a 100-unit box that scales to any size,
 * self-contained — its colours are attributes, not classes — so the same
 * markup goes on a page, into a file for baking, and onto a diploma. The
 * words (name, criteria, date) are `AchievementBadge`'s.
 *
 * @example
 * ```tsx
 * <AchievementBadgeArt display={{ shape: 'rosette', tier: 'gold', symbol: '×' }} title="Times Tables Master" width={96} />
 * ```
 */
export function AchievementBadgeArt({
  display = {},
  state = 'earned',
  progress = 0,
  emblem,
  title,
  colors = {},
  frame = 'var(--badge-frame, 3)',
  fontFamily = 'var(--badge-font-family, serif)',
  className,
  children,
  ...rest
}: AchievementBadgeArtProps) {
  const { shape = 'circle', tier, symbol, caption } = display;
  const locked = state !== 'earned';
  const ink = locked
    ? (colors.muted ?? 'var(--badge-muted, #6b7280)')
    : (colors.ink ?? 'var(--badge-ink, #1f2937)');
  const paper = colors.paper ?? 'var(--badge-paper, #ffffff)';
  const metal =
    tier === undefined
      ? undefined
      : locked
        ? ink
        : (colors.metal ?? `var(--badge-${tier}, ${BADGE_TIER_COLORS[tier]})`);
  const { ringScale, ringWidth, rimRadius, rimWidth, emblemSize, captionY } = BADGE_LAYOUT;
  const rim = 2 * Math.PI * rimRadius;
  const pct = Math.min(Math.max(progress, 0), 1);
  // Under 64px the caption is too small to read; the medallion goes without.
  const px = typeof rest.width === 'number' ? rest.width : undefined;
  const hasCaption = Boolean(caption) && (px === undefined || px >= 64);
  const glyphY = hasCaption ? BADGE_LAYOUT.glyphY.withCaption : BADGE_LAYOUT.glyphY.alone;
  const mid = BADGE_BOX / 2;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${BADGE_BOX} ${BADGE_BOX}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      className={cn('ratio-achievement__art', className)}
      data-state={state}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path
        d={badgeOutline(shape)}
        style={{
          fill: paper,
          stroke: ink,
          strokeWidth: frame,
          strokeLinejoin: 'round',
          strokeDasharray: locked ? '4 3' : undefined,
        }}
      />
      {metal && (
        <path
          d={badgeOutline(shape, ringScale)}
          style={{ fill: 'none', stroke: metal, strokeWidth: ringWidth, strokeLinejoin: 'round' }}
        />
      )}
      {state === 'in-progress' && pct > 0 && (
        <circle
          cx={mid}
          cy={mid}
          r={rimRadius}
          transform={`rotate(-90 ${mid} ${mid})`}
          style={{
            fill: 'none',
            stroke: colors.ink ?? 'var(--badge-ink, #1f2937)',
            strokeWidth: rimWidth,
            strokeLinecap: 'round',
            strokeDasharray: `${(pct * rim).toFixed(2)} ${rim.toFixed(2)}`,
          }}
        />
      )}
      {emblem ? (
        <svg
          x={mid - emblemSize / 2}
          y={glyphY - emblemSize / 2}
          width={emblemSize}
          height={emblemSize}
          viewBox="0 0 24 24"
          style={{ color: ink, opacity: locked ? 0.6 : 1 }}
        >
          {emblem}
        </svg>
      ) : symbol ? (
        <text
          x={mid}
          y={glyphY}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: ink,
            fontFamily,
            fontWeight: 800,
            fontSize: symbolFontSize(symbol),
            opacity: locked ? 0.6 : 1,
          }}
        >
          {symbol}
        </text>
      ) : null}
      {hasCaption && (
        <text
          x={mid}
          y={captionY}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: ink,
            fontFamily,
            fontWeight: 700,
            fontSize: captionFontSize(caption!),
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {caption}
        </text>
      )}
      {children}
    </svg>
  );
}
AchievementBadgeArt.displayName = 'AchievementBadgeArt';
