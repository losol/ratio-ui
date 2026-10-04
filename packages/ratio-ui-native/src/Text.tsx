// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import type { FontSizeStep } from '@eventuras/ratio-ui-core';
import { useTheme } from './RatioProvider';

/** How loud the text is: the theme's text, muted or subtle colour. */
export type TextTone = 'default' | 'muted' | 'subtle';

export interface TextProps extends RNTextProps {
  /** A step of the type scale. @default 'base' */
  size?: FontSizeStep;
  /** @default 'default' */
  tone?: TextTone;
  /** @default 'regular' */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** The theme's font for the role. @default 'body' */
  family?: 'body' | 'display' | 'mono';
}

const WEIGHT: Record<NonNullable<TextProps['weight']>, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const TONE = { default: 'text', muted: 'textMuted', subtle: 'textSubtle' } as const;

/** Body text in the theme's font, size and colour. */
export const Text: React.FC<TextProps> = ({
  size = 'base',
  tone = 'default',
  weight = 'regular',
  family = 'body',
  style,
  ...rest
}) => {
  const theme = useTheme();
  const fontSize = theme.fontSize[size];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: theme.font[family],
          fontSize,
          lineHeight: Math.round(fontSize * 1.5),
          fontWeight: WEIGHT[weight],
          color: theme.colors[TONE[tone]],
        },
        style,
      ]}
    />
  );
};

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends Omit<TextProps, 'family' | 'size'> {
  /** The heading's level, for screen readers and the default size. @default 2 */
  level?: HeadingLevel;
  /** Overrides the level's size. */
  size?: FontSizeStep;
}

// The web's Heading scale, one step per level.
const HEADING_SIZE: Record<HeadingLevel, FontSizeStep> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'base',
};

/** A heading in the theme's display font, announced as one with its level. */
export const Heading: React.FC<HeadingProps> = ({ level = 2, size, weight = 'bold', style, ...rest }) => {
  const theme = useTheme();
  const fontSize = theme.fontSize[size ?? HEADING_SIZE[level]];
  return (
    <Text
      role="heading"
      aria-level={level}
      family="display"
      weight={weight}
      {...rest}
      style={[{ fontSize, lineHeight: Math.round(fontSize * 1.2) }, style]}
    />
  );
};
