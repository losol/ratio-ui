// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useRef, type ReactNode } from 'react';
import { confetti } from '@eventuras/ratio-ui-core/fx';
import { useFx } from '../../fx/useFx';
import type { FxPlayback } from '../../fx/play';
import type {
  BadgeDisplay,
  BadgeState,
  OBAchievement,
  OpenBadgeCredential,
} from '@eventuras/ratio-ui-core/badges';
import { AchievementBadgeArt, type BadgeArtColors } from './AchievementBadgeArt';
import { cn } from '../../utils/cn';
import './AchievementBadge.css';

export { AchievementBadgeArt } from './AchievementBadgeArt';
export type { AchievementBadgeArtProps, BadgeArtColors } from './AchievementBadgeArt';

// The achievement's shape, its look and the medallion's geometry come from
// ratio-ui-core, shared with the native renderer and with whatever bakes
// the credential into the picture. This file draws it for the DOM.


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
  /**
   * Opt in to one decorative confetti burst while earned, including on mount.
   * Uses the display tier's colours, or the theme when there is no tier.
   * Rerenders do not replay it. Set false to stop and rearm; becoming earned
   * again also rearms. Remounts count as a new opt-in. The app announces the
   * achievement; the effect respects reduced motion and data-motion="none".
   * @default false
   */
  celebrate?: boolean;
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
 *   achievement={timesTables}
 *   display={{ shape: 'rosette', tier: 'gold', symbol: '×' }}
 *   credential={award}
 *   formatDate={(iso) => new Date(iso).toLocaleDateString('en-GB')}
 * />
 * ```
 */
export function AchievementBadge({
  achievement,
  display,
  credential,
  state: stateProp,
  celebrate = false,
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
  const art = useRef<SVGSVGElement>(null);
  const fx = useFx();
  const celebrating = celebrate && state === 'earned';
  // Sample presentation without making tier changes another celebration.
  const tier = useRef(display?.tier);
  useEffect(() => { tier.current = display?.tier; }, [display?.tier]);
  useEffect(() => {
    if (!celebrating) return;
    let cancelled = false;
    let playback: FxPlayback | undefined;
    // Strict Mode discards its first setup before this task runs. A discarded
    // setup (or a badge removed immediately) must never throw confetti.
    queueMicrotask(() => {
      if (!cancelled) {
        playback = fx(confetti, {
          origin: art.current,
          colors: tier.current ? `tier:${tier.current}` : undefined,
        });
      }
    });
    return () => {
      cancelled = true;
      playback?.stop();
    };
  }, [celebrating, fx]);
  const labels = { ...LABELS, ...labelsProp };
  const px = size ?? DEFAULT_SIZE[layout];
  const criteria = achievement.criteria.narrative ?? achievement.description;
  const earnedOn = state === 'earned' ? credential?.validFrom : undefined;

  if (layout === 'art') {
    return (
      <AchievementBadgeArt
        {...(rest as Omit<React.SVGProps<SVGSVGElement>, 'display' | 'title'>)}
        ref={art}
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
        ref={art}
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
