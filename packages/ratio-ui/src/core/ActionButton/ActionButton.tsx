// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { forwardRef } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

/**
 * A compact chrome button for toolbars, close affordances, table-row
 * actions, and other dense surfaces. Sibling to `Button` — use
 * `ActionButton` when a labelled `Button` would be too loud.
 *
 * Built on React Aria's `Button`, so it participates in RAC contexts —
 * e.g. dropped inside a React Aria `SearchField` it becomes the clear
 * button automatically.
 *
 * Composes via `children` — works for icon-only, icon + text, or
 * text-only buttons:
 *
 * ```tsx
 * <ActionButton ariaLabel="Close" onPress={onClose}>
 *   <XIcon />
 * </ActionButton>
 *
 * <ActionButton round ariaLabel="Open menu" onPress={openDrawer}>
 *   <MenuIcon />
 * </ActionButton>
 * ```
 *
 * Colors and radius come from CSS tokens (`--action-button-bg`,
 * `--action-button-fg`, `--action-button-border`,
 * `--action-button-radius`, hover variants), so themed containers
 * (e.g. `Console`) can re-skin locally without forking.
 *
 * ## Accessibility
 *
 * If the button has no visible text (icon-only), pass `ariaLabel` (or a
 * native `aria-label`) so screen readers can announce its purpose. The
 * label is the only way an icon-only button is identifiable — without it
 * the button has no accessible name and AT-users can't tell what it does.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export type ActionButtonVariant = 'ghost' | 'solid';
export type ActionButtonSize = 'sm' | 'md' | 'lg';

export interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  /**
   * Press handler — unifies pointer, keyboard, and touch (React Aria).
   * Prefer this over `onClick`.
   */
  onPress?: AriaButtonProps['onPress'];
  /** Still supported; `onPress` is preferred. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Disable the button (React Aria). Wins over the native `disabled`. */
  isDisabled?: boolean;
  /**
   * Required when there is no visible text inside (e.g. icon-only). Read by
   * screen readers as the button's accessible name. A native `aria-label`
   * is also accepted and wins when both are set.
   */
  ariaLabel?: string;
  /**
   * Visual treatment. Default (no variant) is a card-toned chrome button —
   * the former `subtle` look, now the baseline.
   *
   * - `'ghost'` — transparent background (the former default), for toolbars
   *   sitting on cards or re-skinned scopes
   * - `'solid'` — primary-tinted, for the one prominent action per toolbar
   */
  variant?: ActionButtonVariant;
  /** Frame height — sm (24) / md (28, default) / lg (36). Width auto-fits content. */
  size?: ActionButtonSize;
  /**
   * Fully round — burger buttons, bell buttons, the clear-X inside inputs.
   * Overrides the `--action-button-radius` token.
   */
  round?: boolean;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

const SIZE_CLASSES: Record<ActionButtonSize, string> = {
  // Horizontal padding applies to text-bearing buttons; icon-only buttons
  // (a single element child) strip it and stay square.
  sm: 'h-6 min-w-6 px-2.5',
  md: 'h-7 min-w-7 px-3',
  lg: 'h-9 min-w-9 px-4',
};

const GHOST_VARIANT = '[--action-button-bg:transparent]';

const SOLID_VARIANT = [
  '[--action-button-bg:var(--primary)]',
  '[--action-button-fg:var(--text-on-primary)]',
  '[--action-button-border:transparent]',
  '[--action-button-bg-hover:color-mix(in_oklch,var(--primary)_92%,black)]',
  '[--action-button-fg-hover:var(--text-on-primary)]',
].join(' ');

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  {
    onPress,
    onClick,
    isDisabled,
    disabled,
    ariaLabel,
    variant,
    size = 'md',
    round = false,
    children,
    className,
    style,
    type = 'button',
    testId,
    ...rest
  },
  ref,
) {
  // Native `aria-label` (preferred form) wins over the `ariaLabel` prop.
  const { 'aria-label': ariaLabelAttr, ...domProps } = rest;

  // Icon-only detection: exactly one element child and no text. The previous
  // CSS `has-[>svg:only-child]` missed text NODES (`<Pause /> Pause`), since
  // :only-child counts elements only — stripping padding from icon+text
  // buttons. Note: a lone element is assumed to be an icon; wrap a lone
  // <Text> label in a string or fragment with text if you hit this.
  const childArray = React.Children.toArray(children);
  const isIconOnly = childArray.length === 1 && React.isValidElement(childArray[0]);

  return (
    <AriaButton
      ref={ref}
      type={type}
      isDisabled={(isDisabled ?? disabled) || undefined}
      aria-label={ariaLabelAttr ?? ariaLabel}
      onPress={onPress}
      // Public `onClick` is typed for HTMLButtonElement (consumer-friendly);
      // RAC types it against FocusableElement — the element is a real button.
      onClick={onClick as AriaButtonProps['onClick']}
      style={style}
      className={cn(
        // Layout + typography
        'inline-flex items-center justify-center gap-1.5 shrink-0',
        'text-sm leading-none whitespace-nowrap cursor-pointer',
        // Themable surface (overridable by any ancestor scope)
        round ? 'rounded-full' : 'rounded-[var(--action-button-radius,6px)]',
        'bg-(--action-button-bg) text-(--action-button-fg) border border-(--action-button-border)',
        // Interactions — `:active` for plain clicks, `data-pressed` for RAC's
        // unified press state (keyboard/touch).
        'transition-colors duration-150 ease-out',
        'enabled:hover:bg-(--action-button-bg-hover) enabled:hover:text-(--action-button-fg-hover)',
        'enabled:active:scale-95 data-pressed:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        // Sizes — height fixed; horizontal padding auto-strips when the
        // button only contains a single svg (icon-only stays square).
        SIZE_CLASSES[size],
        isIconOnly && 'px-0',
        // Variants (default = no class = transparent + bordered)
        variant === 'ghost' && GHOST_VARIANT,
        variant === 'solid' && SOLID_VARIANT,
        className,
      )}
      data-testid={testId}
      // Remaining native button attributes (aria-*, data-*, …), forwarded to
      // the underlying <button>. The element is a real button, so the
      // boundary cast is sound (same pattern as core/Button).
      {...(domProps as AriaButtonProps)}
    >
      {children}
    </AriaButton>
  );
});
ActionButton.displayName = 'ActionButton';
