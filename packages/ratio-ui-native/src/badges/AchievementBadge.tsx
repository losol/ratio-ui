// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import {
  BADGE_BOX,
  BADGE_LAYOUT,
  BADGE_TIER_COLORS,
  badgeOutline,
  captionFontSize,
  symbolFontSize,
  type BadgeDisplay,
  type BadgeState,
  type OBAchievement,
  type OpenBadgeCredential,
} from '@eventuras/ratio-ui-core/badges';
import { useTheme } from '../RatioProvider';
import { Text } from '../Text';

// The achievement's shape, its look and the medallion's geometry are
// ratio-ui-core's, shared with the web: the same `BadgeDisplay` draws the
// same outline here, through react-native-svg. The colours come from the
// theme in reach — the ink is the primary, the paper the card — where the
// web reads the `--badge-*` tokens.

/** The medallion's colours; each defaults to the theme's. */
export interface BadgeArtColors {
  /** The frame, the emblem and the words. @default theme.colors.primary */
  ink?: string;
  /** The fill. @default theme.colors.card */
  paper?: string;
  /** The tier ring. @default the tier's metal */
  metal?: string;
  /** The ink of a locked badge. @default theme.colors.textSubtle */
  muted?: string;
}

/** @beta Prop shape may change before release. */
export interface AchievementBadgeArtProps {
  display?: BadgeDisplay;
  /** @default 'earned' */
  state?: BadgeState;
  /** 0–1, drawn around the rim when the state is `in-progress`. */
  progress?: number;
  /**
   * A glyph in the middle, in 24 units: react-native-svg elements, as a
   * Lucide icon from `lucide-react-native` gives. Drawn in the ink. Wins
   * over `display.symbol`.
   */
  emblem?: ReactNode;
  /** The accessible name. Omit for art that is described beside it. */
  title?: string;
  /** Width and height, in points. @default 96 */
  size?: number;
  colors?: BadgeArtColors;
  /** The outline's stroke, in the art's units. @default 3 */
  frame?: number;
  /** The face of the symbol and caption. @default theme.font.display */
  fontFamily?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The medallion alone, in a 100-unit box drawn at `size`. The same
 * `BadgeDisplay` as the web's `AchievementBadgeArt`, the same outline.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
// The way there, clockwise from the top: an arc rather than a dashed,
// rotated circle, which every platform draws the same.
function progressArc(mid: number, r: number, pct: number): string {
  const sweep = 2 * Math.PI * Math.min(pct, 0.9999);
  const end = -Math.PI / 2 + sweep;
  const x = (mid + r * Math.cos(end)).toFixed(2);
  const y = (mid + r * Math.sin(end)).toFixed(2);
  return `M${mid} ${mid - r} A${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x} ${y}`;
}

export const AchievementBadgeArt: React.FC<AchievementBadgeArtProps> = ({
  display = {},
  state = 'earned',
  progress = 0,
  emblem,
  title,
  size = 96,
  colors = {},
  frame = 3,
  fontFamily,
  style,
}) => {
  const theme = useTheme();
  const { shape = 'circle', tier, symbol, caption } = display;
  const locked = state !== 'earned';
  const ink = locked ? (colors.muted ?? theme.colors.textSubtle) : (colors.ink ?? theme.colors.primary);
  const paper = colors.paper ?? theme.colors.card;
  const metal = tier === undefined ? undefined : locked ? ink : (colors.metal ?? BADGE_TIER_COLORS[tier]);
  const face = fontFamily ?? theme.font.display;

  const { ringScale, ringWidth, rimRadius, rimWidth, emblemSize, captionY } = BADGE_LAYOUT;
  const pct = Math.min(Math.max(progress, 0), 1);
  // Under 64 points the caption is too small to read; the medallion goes without.
  const hasCaption = Boolean(caption) && size >= 64;
  const glyphY = hasCaption ? BADGE_LAYOUT.glyphY.withCaption : BADGE_LAYOUT.glyphY.alone;
  const mid = BADGE_BOX / 2;
  // No alignment-baseline on every platform: the baseline sits a bit under the centre line.
  const baseline = (y: number, fontSize: number) => y + fontSize * 0.35;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${BADGE_BOX} ${BADGE_BOX}`}
      {...(title ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: title } : {})}
      style={style}
    >
      <Path
        d={badgeOutline(shape)}
        fill={paper}
        stroke={ink}
        strokeWidth={frame}
        strokeLinejoin="round"
        strokeDasharray={locked ? [4, 3] : undefined}
      />
      {metal && (
        <Path
          d={badgeOutline(shape, ringScale)}
          fill="none"
          stroke={metal}
          strokeWidth={ringWidth}
          strokeLinejoin="round"
        />
      )}
      {state === 'in-progress' && pct > 0 && (
        <Path
          d={progressArc(mid, rimRadius, pct)}
          fill="none"
          stroke={colors.ink ?? theme.colors.primary}
          strokeWidth={rimWidth}
          strokeLinecap="round"
        />
      )}
      {emblem ? (
        <Svg
          x={mid - emblemSize / 2}
          y={glyphY - emblemSize / 2}
          width={emblemSize}
          height={emblemSize}
          viewBox="0 0 24 24"
          color={ink}
          opacity={locked ? 0.6 : 1}
        >
          {emblem}
        </Svg>
      ) : symbol ? (
        <SvgText
          x={mid}
          y={baseline(glyphY, symbolFontSize(symbol))}
          textAnchor="middle"
          fill={ink}
          fontFamily={face}
          fontWeight="800"
          fontSize={symbolFontSize(symbol)}
          opacity={locked ? 0.6 : 1}
        >
          {symbol}
        </SvgText>
      ) : null}
      {hasCaption && (
        <SvgText
          x={mid}
          y={baseline(captionY, captionFontSize(caption!))}
          textAnchor="middle"
          fill={ink}
          fontFamily={face}
          fontWeight="700"
          fontSize={captionFontSize(caption!)}
          letterSpacing={0.6}
        >
          {caption!.toUpperCase()}
        </SvgText>
      )}
    </Svg>
  );
};

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

const DEFAULT_SIZE: Record<AchievementBadgeLayout, number> = { art: 64, tile: 96, row: 56 };

/** @beta Prop shape may change before release. */
export interface AchievementBadgeProps extends Omit<ViewProps, 'children'> {
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
   * small with the words beside it. `art`: the medallion alone, named
   * for a screen reader.
   * @default 'tile'
   */
  layout?: AchievementBadgeLayout;
  /** The medallion's size in points. @default 96 (tile), 56 (row), 64 (art) */
  size?: number;
  /** Show the criteria narrative (or the description) under the name. @default layout === 'row' */
  showCriteria?: boolean;
  /** The date as the app should say it. @default the ISO date, `2026-10-23` */
  formatDate?: (iso: string) => string;
  labels?: AchievementBadgeLabels;
  colors?: BadgeArtColors;
  style?: StyleProp<ViewStyle>;
}

/**
 * An Open Badges achievement as a medallion with its name, what it took,
 * and when it was earned — the web's `AchievementBadge`, for the app. The
 * achievement is the spec's JSON; the look is a `BadgeDisplay` beside it.
 * With a `credential` the badge is earned and dated; without one it is
 * locked, or `in-progress` with the way there drawn around the rim.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
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
  style,
  ...rest
}) => {
  const theme = useTheme();
  const state: BadgeState = stateProp ?? (credential ? 'earned' : 'locked');
  const labels = { ...LABELS, ...labelsProp };
  const px = size ?? DEFAULT_SIZE[layout];
  const criteria = achievement.criteria.narrative ?? achievement.description;
  const earnedOn = state === 'earned' ? credential?.validFrom : undefined;

  if (layout === 'art') {
    return (
      <AchievementBadgeArt
        display={display}
        state={state}
        progress={progress}
        emblem={emblem}
        title={achievement.name}
        colors={colors}
        size={px}
        style={style}
      />
    );
  }

  const row = layout === 'row';
  const status = earnedOn
    ? `${labels.earned} ${formatDate(earnedOn)}`
    : state === 'in-progress'
      ? labels.inProgress
      : labels.locked;

  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: row ? 'row' : 'column',
          alignItems: 'center',
          gap: row ? theme.space.s : theme.space.xs,
          maxWidth: row ? undefined : 224,
        },
        style,
      ]}
    >
      <AchievementBadgeArt
        display={display}
        state={state}
        progress={progress}
        emblem={emblem}
        colors={colors}
        size={px}
      />
      <View style={{ flexShrink: 1, alignItems: row ? 'flex-start' : 'center', gap: 2 }}>
        <Text
          family="display"
          weight="bold"
          tone={state === 'locked' ? 'muted' : 'default'}
          style={{ textAlign: row ? 'left' : 'center' }}
        >
          {achievement.name}
        </Text>
        {showCriteria && (
          <Text size="sm" tone="muted" style={{ textAlign: row ? 'left' : 'center' }}>
            {criteria}
          </Text>
        )}
        <Text size="xs" tone="subtle" style={{ textAlign: row ? 'left' : 'center' }}>
          {status}
        </Text>
      </View>
    </View>
  );
};
