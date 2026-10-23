// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import {
  OB_CONTEXT,
  type OBAchievement,
  type OBAchievementSubject,
  type OBProfile,
  type OpenBadgeCredential,
} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasType = (value: Record<string, unknown>, type: string): boolean =>
  Array.isArray(value.type) ? value.type.includes(type) : value.type === type;

/** The shape test a renderer runs before drawing JSON it was handed. */
export function isAchievement(value: unknown): value is OBAchievement {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isRecord(value.criteria) &&
    hasType(value, 'Achievement')
  );
}

/**
 * Whether the value is shaped like an Open Badge credential. Shape only:
 * the proof is not checked, so a `true` says "readable", not "genuine".
 */
export function isOpenBadgeCredential(value: unknown): value is OpenBadgeCredential {
  return (
    isRecord(value) &&
    hasType(value, 'VerifiableCredential') &&
    (hasType(value, 'OpenBadgeCredential') || hasType(value, 'AchievementCredential')) &&
    isRecord(value.issuer) &&
    typeof value.validFrom === 'string' &&
    isRecord(value.credentialSubject) &&
    isAchievement(value.credentialSubject.achievement)
  );
}

/** The achievement a credential awards. */
export const achievementOf = (credential: OpenBadgeCredential): OBAchievement =>
  credential.credentialSubject.achievement;

// `Omit` would collapse the known keys into the index signature; a key
// remap keeps both.
type TypeOptional<T extends { type: unknown }> = {
  [K in keyof T as K extends 'type' ? never : K]: T[K];
} & { type?: T['type'] };

/** `OBProfile` with the `type` filled in. */
export type ProfileInput = TypeOptional<OBProfile>;

/** `OBAchievement` with the `type` filled in. */
export type AchievementInput = TypeOptional<OBAchievement>;

/** An issuer or creator: the `type` is filled in. */
export function defineProfile(input: ProfileInput): OBProfile {
  return { type: ['Profile'], ...input };
}

/**
 * An achievement as its creator defines it: what it is called, what it
 * took, and where it points. The `type` is filled in; everything else is
 * yours. An `id` should be a stable URL (or URN) the credentials can point
 * back to.
 *
 * @example
 * ```ts
 * const gangemester = defineAchievement({
 *   id: 'https://civitas.example/achievements/gangemester',
 *   name: 'Gangemester',
 *   description: 'Kan gangetabellen fra 1 til 10.',
 *   criteria: { narrative: 'Alle gangestykkene fra 1·1 til 10·10 riktig, to ganger på rad.' },
 *   achievementType: 'Competency',
 *   inLanguage: 'nb',
 * });
 * ```
 */
export function defineAchievement(input: AchievementInput): OBAchievement {
  return { type: ['Achievement'], ...input };
}

export interface CredentialInput {
  /** A URL or URN for this award. */
  id?: string;
  issuer: OBProfile | ProfileInput;
  achievement: OBAchievement | AchievementInput;
  /** Who earned it: a DID or URL. Optional in the spec; Civitas would use its own profile URL. */
  subject?: Omit<OBAchievementSubject, 'type' | 'achievement'>;
  /** ISO 8601. @default now */
  validFrom?: string;
  validUntil?: string;
  name?: string;
  description?: string;
  /** @default OB_CONTEXT */
  context?: readonly string[];
}

/**
 * An unsigned Open Badge credential: the award of an achievement to a
 * subject by an issuer, with the contexts and types the spec requires.
 * Signing (a `proof`, or wrapping the JSON in a JWS) is the issuer's
 * service's job; this package never holds a key.
 */
export function defineCredential(input: CredentialInput): OpenBadgeCredential {
  const { id, issuer, achievement, subject, validFrom, validUntil, name, description, context } =
    input;
  const credential: OpenBadgeCredential = {
    '@context': [...(context ?? OB_CONTEXT)],
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    issuer: defineProfile(issuer),
    validFrom: validFrom ?? new Date().toISOString(),
    credentialSubject: {
      type: ['AchievementSubject'],
      ...subject,
      achievement: defineAchievement(achievement),
    },
  };
  if (id !== undefined) credential.id = id;
  if (name !== undefined) credential.name = name;
  if (description !== undefined) credential.description = description;
  if (validUntil !== undefined) credential.validUntil = validUntil;
  return credential;
}
