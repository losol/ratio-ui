// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import type { SpaceStep } from '@eventuras/ratio-ui-core';
import { useTheme } from './RatioProvider';

export type CardElevation = 'none' | 'xs' | 'sm' | 'md';

interface CardOwnProps {
  children?: React.ReactNode;
  /** The resting shadow's tier; `none` is flat. @default 'xs' */
  elevation?: CardElevation;
  /** A step of the space scale. @default 'm' */
  padding?: SpaceStep;
  style?: StyleProp<ViewStyle>;
}

/** @beta Prop shape may change before release. */
export type CardProps = CardOwnProps &
  (
    | ({ onPress?: undefined } & Omit<ViewProps, 'style' | 'children'>)
    | ({ onPress: PressableProps['onPress'] } & Omit<PressableProps, 'style' | 'children'>)
  );

/**
 * A card on the theme's card surface, with its border, corner and shadow.
 * With `onPress` it is one pressable target and lifts while pressed — the
 * web card's hover lift, where touch has no hover.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'xs',
  padding = 'm',
  style,
  ...rest
}) => {
  const theme = useTheme();
  const { card } = theme.components;
  const resting = elevation === 'none' ? null : card.shadow[elevation];

  const base: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border1,
    borderRadius: theme.radius.xl,
    padding: theme.space[padding],
  };

  if (rest.onPress) {
    return (
      <Pressable
        role="button"
        {...(rest as PressableProps)}
        style={({ pressed }) => [
          base,
          {
            backgroundColor: pressed ? theme.colors.cardHover : theme.colors.card,
            borderColor: pressed ? theme.colors.primary : theme.colors.border1,
            boxShadow: theme.shadow(pressed ? card.hoverShadow : resting),
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...(rest as ViewProps)} style={[base, { boxShadow: theme.shadow(resting) }, style]}>
      {children}
    </View>
  );
};
