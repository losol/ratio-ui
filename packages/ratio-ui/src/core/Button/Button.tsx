// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { forwardRef } from 'react';
import { LoaderCircle } from '../../icons';
import { cn } from '../../utils/cn';
import './Button.css';

// Classes shared by every button variant. Includes the `.ratio-button`
// theming hook so all consumers of `buttonStyles` (Button, Link,
// SplitButton, …) get token-driven chrome — shadow + press feedback live
// in --button-* tokens (see Button.css), so there's no active:scale
// utility here that would compete with them.
const ANIMATION_CLASSES = [
  'ratio-button',
  'transition-all',
  'duration-200',
  'ease-in-out',
].join(' ');

export const buttonStyles = {
  primary: `border border-transparent font-medium bg-(--primary) hover:opacity-90 text-(--text-on-primary) rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
  secondary:
    `border border-border-1 font-medium text-(--text) bg-card hover:bg-card-hover hover:border-border-2 ` +
    `rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
  light: `font-medium bg-primary-100 text-(--text) hover:bg-primary-200 dark:bg-primary-800 dark:hover:bg-primary-700 ` +
    `rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
  text: `font-medium bg-transparent hover:bg-primary-200 hover:bg-opacity-20 rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
  outline:
    `border border-border-2 font-medium hover:border-(--primary) hover:bg-card-hover ` +
    `rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
  danger:
    `border border-transparent font-medium bg-error hover:opacity-90 ` +
    `text-error-on rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
};

export const buttonSizes = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  ariaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizes;
  block?: boolean;
  className?: string;
  testId?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block = false,
    disabled = false,
    loading = false,
    icon,
    children,
    ariaLabel,
    className = '',
    type = 'button',
    onClick,
    testId,
    // all other native button props (e.g. id, name, value)
    ...rest
  },
  ref
) {
  const sizeClasses = buttonSizes[size];
  const displayClass = block ? 'w-full' : '';
  const variantClass = buttonStyles[variant];

  // Transparent variants inherit text color from the surface (--text token,
  // overridable via .surface-dark / .surface-light on a parent). Filled
  // variants ship their own text color via buttonStyles.
  const isTransparent = variant === 'text' || variant === 'outline';
  const textColorClass = isTransparent ? 'text-(--text)' : '';

  const disabledClasses = (disabled || loading) ? 'opacity-75 cursor-not-allowed' : '';

  const classes = cn(
    // `.ratio-button` comes in via variantClass (see ANIMATION_CLASSES)
    // so Link/SplitButton share it too.
    sizeClasses,
    displayClass,
    variantClass,
    textColorClass,
    disabledClasses,
    className,
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      onClick={onClick}
      className={classes}
      data-testid={testId}
      {...rest}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <LoaderCircle
            className="h-4 w-4 animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {!loading && icon && (
          <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </span>
    </button>
  );
});

Button.displayName = 'Button';
