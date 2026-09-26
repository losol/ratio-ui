// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { cn } from './cn';

/** A plain class string, or React Aria's render-prop form. */
export type ClassNameProp<State> = string | ((state: State) => string) | undefined;

/**
 * The one rule for a component's `className`: it is merged on top of the
 * component's default classes (a later class wins a conflict), and
 * `unstyled` drops the defaults so the caller styles from scratch.
 *
 * Handles React Aria's render-prop `className` too, merging per state.
 */
export function mergeClassName<State>(
  defaults: string,
  className: ClassNameProp<State>,
  unstyled = false,
): string | ((state: State) => string) {
  const base = unstyled ? '' : defaults;
  if (typeof className === 'function') {
    return (state: State) => cn(base, className(state));
  }
  return cn(base, className);
}
