// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Label as AriaLabel } from 'react-aria-components';
import type { ComponentProps } from 'react';

/**
 * Shared field-label classes, driven by the `--label-*` tokens in
 * tokens/form.css. Exported for form components that need a label-styled
 * element other than `<Label>` (e.g. a group caption).
 */
export const labelClassName =
  'block mb-(--label-gap) cursor-default ' +
  'text-(length:--label-font-size) leading-(--label-line-height) ' +
  'font-(--label-font-weight) text-(--label-color)';

/**
 * Label component with ratio-ui default styling.
 *
 * Built on React Aria's Label component for proper accessibility.
 * Styled by the `--label-*` tokens (see tokens/form.css), and used by every
 * ratio-ui form field so all labels look and space the same.
 *
 * If no children are provided, returns null to avoid rendering an empty label.
 *
 * Can be used standalone with htmlFor, or as part of React Aria form field components
 * where it automatically associates with the input via context.
 *
 * @example
 * // With React Aria components (automatic association)
 * ```tsx
 * <TextField>
 *   <Label>Email Address</Label>
 *   <Input />
 * </TextField>
 * ```
 *
 * @example
 * // Standalone with htmlFor
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <input id="email" type="email" />
 * ```
 *
 * @example
 * // Custom styling
 * ```tsx
 * <Label className="text-lg text-blue-600">Custom Label</Label>
 * ```
 */
export function Label({ children, className, ...props }: ComponentProps<typeof AriaLabel>) {
  if (!children) return null;

  return (
    <AriaLabel
      className={className ?? labelClassName}
      {...props}
    >
      {children}
    </AriaLabel>
  );
}
