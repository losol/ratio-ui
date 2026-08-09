// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * Type-level regression guard for `FieldErrorMap`.
 *
 * `InputFieldProps.errors` has always documented itself as react-hook-form
 * compatible, but in 2.17.0 it was typed `{ [key: string]: { message: string } }`
 * — which RHF's `FieldErrors` is **not** assignable to, because
 * `FieldError.message` is optional. Every consumer passing `formState.errors`
 * straight from `useForm()` failed to compile, and nothing caught it: the claim
 * lived only in a doc comment.
 *
 * This file has no runtime and belongs to no entry (`src/**\/index.{ts,tsx}`),
 * so it never ships. It fails `tsc` — run by `pnpm build` — the moment the
 * compatibility regresses. `react-hook-form` is a devDependency for exactly
 * this reason: asserting against a hand-written replica of `FieldError` would
 * be a second source of truth, free to drift from the real one.
 */

import type { FieldErrors } from 'react-hook-form';

import type { FieldErrorMap } from './InputProps';

/** Covers the shapes that actually differ: flat, nested object, and array. */
type Schema = {
  name: string;
  email: string;
  address: { street: string; city: string };
  tags: string[];
};

declare const rhfErrors: FieldErrors<Schema>;

/** The whole point: `errors={formState.errors}` typechecks as consumers write it. */
export const fromUseForm: FieldErrorMap = rhfErrors;

/** Hand-built maps still fit — the pre-2.17 shape stays valid (pure widening). */
export const handBuilt: FieldErrorMap = { name: { message: 'Required' } };

/** Fields without an error may be absent or explicitly `undefined`. */
export const withGaps: FieldErrorMap = { name: undefined };

/**
 * Lookup stays `string | undefined`, so `InputError` renders the message
 * behind its existing falsy guard without narrowing. Widening `message` to
 * `unknown` would break this line and force a `typeof` check.
 */
export const message: string | undefined = rhfErrors.name?.message;
