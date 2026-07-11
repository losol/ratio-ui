// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { createContext, forwardRef, useContext } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { LoaderCircle } from '../../icons';
import { cn } from '../../utils/cn';
import { Avatar, type AvatarProps, type AvatarSize } from '../Avatar/Avatar';
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
  // Filled-light variants keep their own light card/primary-100 background, so
  // their text must contrast *that* — not follow a `.surface-dark` override of
  // `--text`. Using `--text-dark` + `dark:--text-light` stays theme-adaptive
  // (dark text in light theme, light text in dark theme) while ignoring the
  // surface override, so the label doesn't vanish on a dark surface.
  secondary:
    `border border-border-1 font-medium text-(--text-dark) dark:text-(--text-light) bg-card hover:bg-card-hover hover:border-border-2 ` +
    `rounded-[var(--button-radius,9999px)] ${ANIMATION_CLASSES}`,
  light: `font-medium bg-primary-100 text-(--text-dark) dark:text-(--text-light) hover:bg-primary-200 dark:bg-primary-800 dark:hover:bg-primary-700 ` +
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

type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  /**
   * Press handler — unifies pointer, keyboard, and touch (React Aria). Prefer
   * this over `onClick`.
   */
  onPress?: AriaButtonProps['onPress'];
  /**
   * @deprecated Use `onPress`. Still fires for now; removed in a future major.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Disable the button (non-interactive, not focusable). */
  isDisabled?: boolean;
  /**
   * @deprecated Use `isDisabled`. Still works for now; removed in a future major.
   */
  disabled?: boolean;
  /**
   * @deprecated Pass `aria-label` directly instead. Still works for now;
   * removed in a future major.
   */
  ariaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: keyof typeof buttonStyles;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  testId?: string;
}

// Lets `Button.Avatar` adapt its size + flush offset to the button's size
// without the consumer repeating it.
const ButtonSizeContext = createContext<ButtonSize>('md');

/**
 * Per-size trigger-pill tuning:
 * - `avatar` — the avatar preset (the tallest child, so it drives pill height).
 * - `pull` — negative left margin so the avatar sits ~concentric with the
 *   pill's rounded left cap (a small inset, not fully flush).
 * - `py` — tightens the pill vertically (overriding the size's default) so the
 *   avatar fills the height instead of floating in a too-tall pill.
 */
const AVATAR_PILL: Record<ButtonSize, { avatar: AvatarSize; pull: string; py: string }> = {
  sm: { avatar: 'sm', pull: '-ml-[10px]', py: 'py-[3px]' },
  md: { avatar: 'sm', pull: '-ml-[13px]', py: 'py-1' },
  lg: { avatar: 'md', pull: '-ml-[21px]', py: 'py-[5px]' },
};

export interface ButtonAvatarProps extends Omit<AvatarProps, 'size'> {
  /** Override the auto-derived size (defaults to follow the button's size). */
  size?: AvatarSize;
}

/**
 * Flush leading avatar for a trigger pill — `<Button><Button.Avatar …/>Name</Button>`.
 * Sits concentric with the pill's rounded left edge (via a negative margin that
 * eats the button's left padding), so the button keeps its token-driven chrome
 * instead of a hand-copied class string.
 */
function ButtonAvatar({ size, className, ...rest }: ButtonAvatarProps) {
  const btnSize = useContext(ButtonSizeContext);
  const preset = AVATAR_PILL[btnSize];
  return (
    <Avatar
      size={size ?? preset.avatar}
      className={cn(preset.pull, 'shrink-0', className)}
      {...rest}
    />
  );
}
ButtonAvatar.displayName = 'Button.Avatar';

export interface ButtonLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Cap the label width (any CSS length, e.g. `'20ch'`). Longer text truncates
   * with an ellipsis. Omit to let the label size to its content.
   */
  maxWidth?: string;
}

/**
 * Truncating label for a trigger pill — pairs with {@link ButtonAvatar}. Owns
 * the flex `min-w-0` footgun so a long name ellipsizes instead of blowing the
 * pill out: `<Button><Button.Avatar …/><Button.Label maxWidth="20ch">{name}</Button.Label></Button>`.
 */
function ButtonLabel({ maxWidth, className, style, children, ...rest }: ButtonLabelProps) {
  return (
    <span
      className={cn('min-w-0 truncate', className)}
      style={maxWidth ? { maxWidth, ...style } : style}
      {...rest}
    >
      {children}
    </span>
  );
}
ButtonLabel.displayName = 'Button.Label';

/**
 * Button — the design system's primary action, built on React Aria's `Button`
 * for unified press/keyboard/focus handling. Chrome (shape, shadow, press
 * feedback) is token-driven via `.ratio-button` + `--button-*`.
 *
 * Migration note: `onClick`/`disabled`/`ariaLabel` still work but are
 * superseded by `onPress`/`isDisabled`/`aria-label`. Both forms are supported
 * until the next major.
 *
 * Compound: `Button.Avatar` renders a flush leading avatar for trigger pills.
 */
const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block = false,
    disabled,
    isDisabled,
    loading = false,
    icon,
    children,
    ariaLabel,
    className = '',
    type = 'button',
    onClick,
    onPress,
    testId,
    // remaining native button props (id, name, value, form, aria-*, data-*, …)
    ...rest
  },
  ref,
) {
  const sizeClasses = buttonSizes[size];
  const displayClass = block ? 'w-full' : '';
  const variantClass = buttonStyles[variant];

  // Transparent variants inherit text color from the surface (--text token,
  // overridable via .surface-dark / .surface-light on a parent). Filled
  // variants ship their own text color via buttonStyles.
  const isTransparent = variant === 'text' || variant === 'outline';
  const textColorClass = isTransparent ? 'text-(--text)' : '';

  // Dual props during the RAC migration: the new `isDisabled` wins over the
  // deprecated `disabled`; `loading` always disables (matches prior behaviour).
  const resolvedDisabled = (isDisabled ?? disabled ?? false) || loading;
  const disabledClasses = resolvedDisabled ? 'opacity-75 cursor-not-allowed' : '';

  // Pull the native `aria-label` out of the rest so it can take precedence
  // over the deprecated `ariaLabel` prop below.
  const { 'aria-label': ariaLabelAttr, ...domProps } = rest;

  // With compound parts present (Button.Avatar / Button.Label), render children
  // flat so each is a real flex item — the avatar can sit flush and the label
  // can truncate. Without parts, wrap them in one span so interpolated text
  // like `Delete {n} items` keeps no inter-word gap.
  const childArray = React.Children.toArray(children);
  const hasParts = childArray.some(
    (c) => React.isValidElement(c) && (c.type === ButtonAvatar || c.type === ButtonLabel),
  );
  const hasAvatar = childArray.some(
    (c) => React.isValidElement(c) && c.type === ButtonAvatar,
  );

  const classes = cn(
    // `.ratio-button` comes in via variantClass (see ANIMATION_CLASSES)
    // so Link/SplitButton share it too.
    sizeClasses,
    // Tighten the pill vertically when it carries a flush avatar, so the
    // avatar (the tallest child) fills the height instead of floating.
    hasAvatar && AVATAR_PILL[size].py,
    displayClass,
    variantClass,
    textColorClass,
    disabledClasses,
    className,
  );

  return (
    <AriaButton
      ref={ref}
      type={type}
      isDisabled={resolvedDisabled}
      // The native `aria-label` (the preferred form) wins over the deprecated
      // `ariaLabel` prop when both are supplied.
      aria-label={ariaLabelAttr ?? ariaLabel}
      onPress={onPress}
      // Public `onClick` is typed for HTMLButtonElement (consumer-friendly);
      // RAC types it against FocusableElement. The element is a real button,
      // so bridging the two at this boundary is sound.
      onClick={onClick as AriaButtonProps['onClick']}
      className={classes}
      data-testid={testId}
      // Remaining native button attributes, forwarded to the underlying
      // <button>. React types a few (e.g. `value`, some DOM handlers) more
      // broadly than RAC; the element is a real button, so forward as-is.
      {...(domProps as AriaButtonProps)}
    >
      <ButtonSizeContext.Provider value={size}>
        <span className="flex items-center justify-center gap-2">
          {loading && (
            <LoaderCircle className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
          )}
          {!loading && !hasAvatar && icon && <span className="shrink-0">{icon}</span>}
          {hasParts ? children : childArray.length > 0 && <span>{children}</span>}
        </span>
      </ButtonSizeContext.Provider>
    </AriaButton>
  );
});

ButtonRoot.displayName = 'Button';

export const Button = Object.assign(ButtonRoot, { Avatar: ButtonAvatar, Label: ButtonLabel });
