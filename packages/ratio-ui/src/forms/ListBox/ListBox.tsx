// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { ListBox as AriaListBox, ListBoxItem as AriaListBoxItem } from 'react-aria-components';
import type { ComponentProps } from 'react';
import { mergeClassName } from '../../utils/mergeClassName';

export type ListBoxProps = ComponentProps<typeof AriaListBox> & {
  /** Drop the default classes and style from scratch with `className`. */
  unstyled?: boolean;
};
export type ListBoxItemProps = ComponentProps<typeof AriaListBoxItem> & {
  /** Drop the default classes and style from scratch with `className`. */
  unstyled?: boolean;
};

const listBoxDefault =
  'mt-1 p-1 bg-card border border-border-1 rounded-lg shadow-lg max-h-60 overflow-auto';
const listBoxItemDefault =
  'px-3 py-2 cursor-pointer outline-none rounded text-(--text) hover:bg-card-hover focus:bg-card-hover selected:bg-(--primary) selected:text-(--text-on-primary)';

/**
 * ListBox with ratio-ui defaults
 */
export function ListBox({ className, unstyled = false, ...props }: ListBoxProps) {
  return (
    <AriaListBox
      className={mergeClassName(listBoxDefault, className, unstyled)}
      {...props}
    />
  );
}

/**
 * ListBoxItem with ratio-ui defaults
 */
export function ListBoxItem({ className, unstyled = false, ...props }: ListBoxItemProps) {
  return (
    <AriaListBoxItem
      className={mergeClassName(listBoxItemDefault, className, unstyled)}
      {...props}
    />
  );
}
