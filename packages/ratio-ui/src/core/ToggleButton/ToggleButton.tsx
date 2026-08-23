// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { ToggleButton as AriaToggleButton, ToggleButtonProps as AriaToggleButtonProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

export type ToggleButtonSize = 'sm' | 'md' | 'lg';
export type ToggleButtonVariant = 'default' | 'primary' | 'outline' | 'segmented' | 'chip';

/** Pill sizes, shared with `ToggleButtonGroup` so a lone toggle matches a row of them. */
const PILL_SIZE: Record<ToggleButtonSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1.25 text-[13px]',
  lg: 'px-4 py-2 text-sm',
};

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'className'> {
  /**
   * The visual style variant of the toggle button
   * - 'default': Standard gray border with blue highlight when selected
   * - 'primary': Blue background when selected
   * - 'outline': Outlined style with border emphasis
   * - 'segmented': a pill segment for `ToggleButtonGroup`'s recessed track —
   *   no border of its own, since the track frames the set
   * - 'chip': a standalone filter pill that carries its own outline, for a
   *   loose wrapping row rather than a shared track
   *
   * `segmented` and `chip` are what `ToggleButtonGroup` renders; reach for
   * `chip` directly only for a toggle that stands alone.
   */
  variant?: ToggleButtonVariant;
  /**
   * Size — same `sm | md | lg` scale as Button. Applies to the pill variants
   * (`segmented`, `chip`); the older variants carry their own padding.
   * @default 'md'
   */
  size?: ToggleButtonSize;

  /**
   * Additional CSS classes to apply
   */
  className?: string;

  /**
   * Content to display inside the button
   */
  children: React.ReactNode;
}

const variantStyles = {
  default: {
    base: 'border-2 border-border-1 bg-card',
    hover: 'hover:border-(--primary) hover:bg-card-hover',
    selected: 'border-(--primary) bg-primary-100 dark:bg-primary-800 shadow-sm',
    pressed: 'pressed:scale-95',
  },
  primary: {
    base: 'border-2 border-border-1 bg-card',
    hover: 'hover:bg-card-hover',
    selected: 'border-(--primary) bg-(--primary) text-(--text-on-primary) shadow-md',
    pressed: 'pressed:scale-95',
  },
  outline: {
    base: 'border-2 border-border-2 bg-transparent',
    hover: 'hover:border-(--primary) hover:bg-card-hover',
    selected: 'border-(--primary) bg-primary-100 dark:bg-primary-800',
    pressed: 'pressed:scale-95',
  },
};

/**
 * ToggleButton component based on React Aria Components
 *
 * A button that can be toggled between selected and unselected states.
 * Provides built-in accessibility features including proper ARIA attributes,
 * keyboard navigation, and focus management.
 *
 * @example
 * ```tsx
 * <ToggleButton>
 *   Toggle me
 * </ToggleButton>
 *
 * <ToggleButton isSelected variant="primary">
 *   Selected
 * </ToggleButton>
 * ```
 */
const PILL_VARIANTS = ['segmented', 'chip'] as const;
type PillVariant = (typeof PILL_VARIANTS)[number];
const isPill = (v: string): v is PillVariant =>
  (PILL_VARIANTS as readonly string[]).includes(v);

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  if (isPill(variant)) {
    return (
      <AriaToggleButton
        {...props}
        className={({ isSelected, isHovered, isFocusVisible, isDisabled }) =>
          cn(
            'inline-flex items-center justify-center rounded-full font-semibold',
            'cursor-pointer whitespace-nowrap outline-none transition-colors duration-150',
            PILL_SIZE[size],
            // A chip stands alone, so its own outline is what makes it read as
            // a control when off. A segment sits in a track that frames it.
            variant === 'chip' ? 'border' : 'border-0',
            isSelected ? 'text-(--text-on-primary) bg-(--primary)' : 'text-(--text-muted)',
            variant === 'chip' && (isSelected ? 'border-(--primary)' : 'border-border-2'),
            !isSelected &&
              isHovered &&
              'text-(--text) bg-[color-mix(in_srgb,var(--text)_5%,transparent)]',
            isFocusVisible && 'ring-2 ring-(--focus-ring)',
            isDisabled && 'opacity-50 cursor-not-allowed',
            className,
          )
        }
      >
        {children}
      </AriaToggleButton>
    );
  }

  const styles = variantStyles[variant];

  return (
    <AriaToggleButton
      {...props}
      className={({ isSelected, isPressed, isFocusVisible }) => {
        const classes = [
          // Base styles
          'px-4 py-2 rounded-lg',
          'transition-all duration-200',
          'cursor-pointer',
          'outline-none',

          // Variant base
          styles.base,

          // State-dependent styles
          isSelected ? styles.selected : styles.hover,
          isPressed && styles.pressed,

          // Focus visible ring
          isFocusVisible && 'ring-2 ring-(--focus-ring) ring-offset-2',

          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Custom classes
          className,
        ];

        return cn(...classes);
      }}
    >
      {children}
    </AriaToggleButton>
  );
};
