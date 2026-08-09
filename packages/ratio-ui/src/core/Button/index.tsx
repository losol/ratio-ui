// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Directive-free on purpose — see the note in `core/Navbar/index.tsx`.

import { forwardRef } from 'react';

import { ButtonAvatar, ButtonLabel, ButtonRoot, type ButtonProps } from './Button';

/**
 * Server-safe carrier for the compound statics. `forwardRef` rather than a
 * plain function because `Button` forwards a ref to its `<button>`, and under
 * React 18 a plain function component would drop it. The result is a local
 * object this module owns, so assigning statics to it never touches a client
 * reference.
 */
const ButtonShell = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  return <ButtonRoot {...props} ref={ref} />;
});
ButtonShell.displayName = 'Button';

/**
 * Button — `Button.Avatar` and `Button.Label` compose the trigger-pill layout.
 *
 * Both parts stay client components alongside the root, which detects them by
 * identity (`c.type === ButtonAvatar`); splitting them across the RSC boundary
 * would break that check silently.
 */
export const Button = Object.assign(ButtonShell, {
  Avatar: ButtonAvatar,
  Label: ButtonLabel,
});

export { buttonStyles } from './Button';
export { ButtonGroup } from './ButtonGroup';

export type { ButtonProps, ButtonAvatarProps, ButtonLabelProps } from './Button';
export type { ButtonGroupProps } from './ButtonGroup';

/**
 * Same components as `Button.Avatar` / `Button.Label`, for consumers who
 * prefer plain imports over dotted access.
 */
export { ButtonAvatar, ButtonLabel } from './Button';
