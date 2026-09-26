// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Input as AriaInput } from 'react-aria-components';
import type { ComponentPropsWithRef } from 'react';
import { mergeClassName } from '../../utils/mergeClassName';

/**
 * Default input styles for React Aria components
 * Lighter design suitable for autocomplete, combobox, and similar compact inputs
 */
export const inputStyles = {
  default:
    'px-3 py-2 border border-border-1 rounded-lg bg-card text-(--text) focus:outline-none focus:ring-2 focus:ring-(--focus-ring)',
};

/**
 * Input component - A simple styled input primitive based on React Aria.
 *
 * This is a lightweight, composable input element that can be used:
 * - Standalone with forms
 * - Within React Aria components (SearchField, TextField, etc.)
 * - As part of custom form compositions
 *
 * For a complete form field with label, description, and errors, use `TextField`.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <Input placeholder="Enter your name" />
 * ```
 *
 * @example
 * // Extra classes merge on top of the defaults; `unstyled` drops them
 * <Input className="px-4 py-3" placeholder="Roomier" />
 * <Input unstyled className="bg-transparent outline-none" />
 * ```
 *
 * @example
 * // Within React Aria SearchField
 * <SearchField>
 *   <Label>Search</Label>
 *   <Input placeholder="Type to search..." />
 * </SearchField>
 * ```
 */
export type InputProps = ComponentPropsWithRef<typeof AriaInput> & {
  /** Drop the default classes and style from scratch with `className`. */
  unstyled?: boolean;
};

export function Input({ className, unstyled = false, ref, ...props }: InputProps) {
  return (
    <AriaInput
      ref={ref}
      className={mergeClassName(inputStyles.default, className, unstyled)}
      {...props}
    />
  );
}
