// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { FontSizeStep } from '@eventuras/ratio-ui-core';
import { useTheme, type RatioTheme } from './RatioProvider';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** The label. A string is set in the button's text style. */
  children: React.ReactNode;
  /** @default 'primary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
}

// Padding as on the web: px-3 py-1, px-4 py-2, px-6 py-3; text xs, sm, base.
const SIZE: Record<ButtonSize, { px: number; py: number; text: FontSizeStep }> = {
  sm: { px: 12, py: 4, text: 'xs' },
  md: { px: 16, py: 8, text: 'sm' },
  lg: { px: 24, py: 12, text: 'base' },
};

const surface = (variant: ButtonVariant, { colors }: RatioTheme) => {
  switch (variant) {
    case 'primary':
      return { bg: colors.primary, fg: colors.textOnPrimary, border: 'transparent' };
    case 'secondary':
      return { bg: colors.card, fg: colors.text, border: colors.border1 };
    case 'outline':
      return { bg: 'transparent', fg: colors.text, border: colors.border2 };
    case 'text':
      return { bg: 'transparent', fg: colors.text, border: 'transparent' };
    case 'danger':
      return { bg: colors.errorSolid, fg: colors.errorOnSolid, border: 'transparent' };
  }
};

/**
 * A button in the theme's shape: its radius and resting shadow, and its
 * press — Bureau moves the button into its hard shadow, so it sinks into
 * the page. The text variant stays flat.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  ...rest
}) => {
  const theme = useTheme();
  const { button } = theme.components;
  const { bg, fg, border } = surface(variant, theme);
  const { px, py, text } = SIZE[size];
  const flat = variant === 'text';

  return (
    <Pressable
      role="button"
      aria-disabled={disabled || undefined}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: px,
          paddingVertical: py,
          borderWidth: 1,
          borderColor: border,
          borderRadius: theme.radius[button.radius],
          backgroundColor: bg,
          opacity: disabled ? 0.5 : 1,
          boxShadow: flat ? undefined : theme.shadow(pressed ? button.pressedShadow : button.shadow),
          transform:
            pressed && !disabled
              ? [{ translateX: button.pressedOffset.x }, { translateY: button.pressedOffset.y }]
              : [],
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text size={text} weight="medium" style={{ color: fg }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};
