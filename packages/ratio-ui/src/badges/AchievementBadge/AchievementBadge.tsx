// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';
import {
  BADGE_TIER_COLORS,
  type BadgeDisplay,
  type BadgeShape,
  type BadgeState,
  type OBAchievement,
  type OpenBadgeCredential,
} from '@eventuras/ratio-ui-core/badges';
import { cn } from '../../utils/cn';
import './AchievementBadge.css';

// The achievement's shape and look come from ratio-ui-core, shared with
// the native renderer and with whatever bakes the credential into the
// picture. This file draws it.

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

/** The outline, scaled about the centre, as a path. */
function outline(shape: BadgeShape, s: number): string {
  const c = 50;
  const p = (x: number, y: number) => `${(c + x * s).toFixed(2)} ${(c + y * s).toFixed(2)}`;
  switch (shape) {
    case 'circle': {
      const r = 46 * s;
      return `M${p(0, -46)} A${r} ${r} 0 1 1 ${p(0, 46)} A${r} ${r} 0 1 1 ${p(0, -46)} Z`;
    }
    case 'hexagon': {
      const r = 47;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return p(r * Math.cos(a), r * Math.sin(a));
      });
      return `M${pts.join(' L')} Z`;
    }
    case 'shield': {
      return (
        `M${p(0, -46)} L${p(40, -34)} L${p(40, -2)} ` +
        `C${p(40, 22)} ${p(22, 40)} ${p(0, 46)} ` +
        `C${p(-22, 40)} ${p(-40, 22)} ${p(-40, -2)} ` +
        `L${p(-40, -34)} Z`
      );
    }
    case 'rosette': {
      const n = 12;
      const r = 43;
      const pts = Array.from({ length: n }, (_, i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2;
        return [r * Math.cos(a), r * Math.sin(a)] as const;
      });
      const chord = 2 * r * Math.sin(Math.PI / n);
      const bulge = (chord * 0.62 * s).toFixed(2);
      let d = `M${p(...pts[0]!)}`;
      for (let i = 1; i <= n; i++) {
        const [x, y] = pts[i % n]!;
        d += ` A${bulge} ${bulge} 0 0 1 ${p(x, y)}`;
      }
      return `${d} Z`;
    }
  }
}

/**
 * The medallion alone: an SVG in a 100-unit box that scales to any size,
 * self-contained — its colours are attributes, not classes — so the same
 * markup goes on a page, into a file for baking, and onto a diploma. The
 * words (name, criteria, date) are `AchievementBadge`'s.
 *
 * @example
 * ```tsx
 * <AchievementBadgeArt display={{ shape: 'rosette', tier: 'gold', symbol: '×' }} title="Gangemester" width={96} />
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
  const rim = 2 * Math.PI * 48;
  const pct = Math.min(Math.max(progress, 0), 1);
  const hasCaption = Boolean(caption);
  const glyphY = hasCaption ? 44 : 50;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      className={cn('ratio-achievement__art', className)}
      data-state={state}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path
        d={outline(shape, 1)}
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
          d={outline(shape, 0.84)}
          style={{ fill: 'none', stroke: metal, strokeWidth: 2.5, strokeLinejoin: 'round' }}
        />
      )}
      {state === 'in-progress' && pct > 0 && (
        <circle
          cx="50"
          cy="50"
          r="48"
          transform="rotate(-90 50 50)"
          style={{
            fill: 'none',
            stroke: colors.ink ?? 'var(--badge-ink, #1f2937)',
            strokeWidth: 3,
            strokeLinecap: 'round',
            strokeDasharray: `${(pct * rim).toFixed(2)} ${rim.toFixed(2)}`,
          }}
        />
      )}
      {emblem ? (
        <svg
          x={50 - 20}
          y={glyphY - 20}
          width="40"
          height="40"
          viewBox="0 0 24 24"
          style={{ color: ink, opacity: locked ? 0.6 : 1 }}
        >
          {emblem}
        </svg>
      ) : symbol ? (
        <text
          x="50"
          y={glyphY}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: ink,
            fontFamily,
            fontWeight: 800,
            fontSize: symbol.length > 2 ? 22 : symbol.length > 1 ? 30 : 38,
            opacity: locked ? 0.6 : 1,
          }}
        >
          {symbol}
        </text>
      ) : null}
      {hasCaption && (
        <text
          x="50"
          y="76"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: ink,
            fontFamily,
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: 0.8,
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

export type AchievementBadgeLayout = 'art' | 'tile' | 'row';

export interface AchievementBadgeLabels {
  /** Read with the date: "Earned". */
  earned?: string;
  /** The status of a locked badge: "Not yet earned". */
  locked?: string;
  /** The status of a badge underway: "In progress". */
  inProgress?: string;
}

const LABELS: Required<AchievementBadgeLabels> = {
  earned: 'Earned',
  locked: 'Not yet earned',
  inProgress: 'In progress',
};

export interface AchievementBadgeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** What was (or can be) earned: the name and criteria are shown. */
  achievement: OBAchievement;
  display?: BadgeDisplay;
  /**
   * The award. With one the badge is earned and the date is shown;
   * without, it is locked unless `state` says otherwise.
   */
  credential?: OpenBadgeCredential;
  /** @default `credential` ? 'earned' : 'locked' */
  state?: BadgeState;
  /** 0–1, for `in-progress`. */
  progress?: number;
  /** A 24-unit glyph for the middle, as in `AchievementBadgeArt`. */
  emblem?: ReactNode;
  /**
   * `tile`: the medallion with the name under it. `row`: the medallion
   * small with the words beside it. `art`: the medallion alone, named for
   * a screen reader.
   * @default 'tile'
   */
  layout?: AchievementBadgeLayout;
  /** The medallion's width and height in px. @default 96 (tile), 56 (row), 64 (art) */
  size?: number;
  /** Show the criteria narrative (or the description) under the name. @default layout === 'row' */
  showCriteria?: boolean;
  /** The date as the page should say it. @default the ISO date, `2026-10-23` */
  formatDate?: (iso: string) => string;
  labels?: AchievementBadgeLabels;
  colors?: BadgeArtColors;
  /** The heading element for the name. @default 'span' */
  nameAs?: React.ElementType;
  className?: string;
}

const DEFAULT_SIZE: Record<AchievementBadgeLayout, number> = { art: 64, tile: 96, row: 56 };

/**
 * AchievementBadge — an Open Badges achievement as a medallion with its
 * name, what it took, and when it was earned. The achievement is the
 * spec's JSON (`OBAchievement`, from `@eventuras/ratio-ui-core/badges`);
 * the look is a `BadgeDisplay` beside it. With a `credential` the badge
 * is earned and dated; without one it is locked, the outline of what is
 * still to do, or `in-progress` with the way there drawn around the rim.
 *
 * @example
 * ```tsx
 * <AchievementBadge
 *   achievement={gangemester}
 *   display={{ shape: 'rosette', tier: 'gold', symbol: '×' }}
 *   credential={award}
 *   formatDate={(iso) => new Date(iso).toLocaleDateString('nb')}
 * />
 * ```
 */
export function AchievementBadge({
  achievement,
  display,
  credential,
  state: stateProp,
  progress,
  emblem,
  layout = 'tile',
  size,
  showCriteria = layout === 'row',
  formatDate = (iso) => iso.slice(0, 10),
  labels: labelsProp,
  colors,
  nameAs: Name = 'span',
  className,
  ...rest
}: AchievementBadgeProps) {
  const state: BadgeState = stateProp ?? (credential ? 'earned' : 'locked');
  const labels = { ...LABELS, ...labelsProp };
  const px = size ?? DEFAULT_SIZE[layout];
  const criteria = achievement.criteria.narrative ?? achievement.description;
  const earnedOn = state === 'earned' ? credential?.validFrom : undefined;

  if (layout === 'art') {
    return (
      <AchievementBadgeArt
        {...(rest as Omit<React.SVGProps<SVGSVGElement>, 'display' | 'title'>)}
        display={display}
        state={state}
        progress={progress}
        emblem={emblem}
        title={achievement.name}
        colors={colors}
        width={px}
        height={px}
        className={className}
      />
    );
  }

  return (
    <figure
      className={cn('ratio-achievement', className)}
      data-layout={layout}
      data-state={state}
      {...rest}
    >
      <AchievementBadgeArt
        display={display}
        state={state}
        progress={progress}
        emblem={emblem}
        colors={colors}
        width={px}
        height={px}
      />
      <figcaption className="ratio-achievement__caption">
        <Name className="ratio-achievement__name">{achievement.name}</Name>
        {showCriteria && <span className="ratio-achievement__text">{criteria}</span>}
        {earnedOn ? (
          <span className="ratio-achievement__status">
            {labels.earned} <time dateTime={earnedOn}>{formatDate(earnedOn)}</time>
          </span>
        ) : (
          <span className="ratio-achievement__status">
            {state === 'in-progress' ? labels.inProgress : labels.locked}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
AchievementBadge.displayName = 'AchievementBadge';
