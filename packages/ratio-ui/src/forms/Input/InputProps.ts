// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { InputHTMLAttributes } from 'react';

/**
 * Standard HTML input types.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
 */
export type ValidInputTypes =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

/** The element an input-family field may render — `<textarea>` when `multiline`. */
export type InputLikeElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * Field errors keyed by input name.
 *
 * Structural on purpose rather than importing react-hook-form's `FieldErrors`
 * — a design system must not depend on a form library. It is also loose on
 * purpose: in RHF a `FieldError.message` is *optional*, fields without an
 * error are absent or `undefined`, and nested or array fields produce objects
 * carrying no `message` at all. Anything narrower rejects `formState.errors`
 * straight out of `useForm()`, which is how consumers actually write it.
 *
 * `InputProps.types.test.ts` asserts that against the real RHF types, so this
 * compatibility cannot silently drift again.
 */
export type FieldErrorMap = Record<string, { message?: string } | undefined>;

/**
 * Base props for primitive inputs. Instantiated with `InputLikeElement` so
 * event handlers accept events from either element `TextField` may render.
 */
export interface InputProps extends InputHTMLAttributes<InputLikeElement> {
  /** Used for form submission and `errors` lookup. */
  name: string;
  type?: ValidInputTypes;
  /** Rendered as `data-testid`. */
  testId?: string;
  /** @deprecated Will be removed in the next major — declare real props instead. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional until v3
  [x: string]: any;
}

/** Props for composite form fields with label, description, and error handling. */
export interface InputFieldProps extends InputProps {
  label?: string;
  description?: string;
  /** Keyed by input name. Takes `formState.errors` from react-hook-form as-is. */
  errors?: FieldErrorMap;
  noMargin?: boolean;
  noWrapper?: boolean;
}
