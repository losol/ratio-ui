// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The badge's data: Open Badges 3.0, which is a W3C Verifiable Credential
// whose subject holds an `Achievement`. These are the spec's shapes, the
// fields a renderer or an issuer reads, not the whole vocabulary — a field
// the spec allows and this file omits is still allowed on the object; the
// index signature keeps it. Nothing here signs or verifies: a credential's
// `proof` is carried, never read. See docs/adr/0002-open-badges.md.
//
// Spec: https://www.imsglobal.org/spec/ob/v3p0/

/** The JSON-LD contexts an `OpenBadgeCredential` declares, in this order. */
export const OB_CONTEXT = [
  'https://www.w3.org/ns/credentials/v2',
  'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
] as const;

/**
 * An image: the badge's picture, an issuer's logo. `id` is its URL (a
 * `data:` URL is allowed by the spec, and is how a baked badge carries its
 * own art).
 * @beta Shape may change before release.
 */
export interface OBImage {
  id: string;
  type: 'Image';
  caption?: string;
  [key: string]: unknown;
}

/**
 * Who issued or created something: an organisation, a school, a person.
 * @beta Shape may change before release.
 */
export interface OBProfile {
  /** A URL or DID that identifies the issuer. */
  id: string;
  type: ['Profile', ...string[]];
  name?: string;
  url?: string;
  email?: string;
  description?: string;
  image?: OBImage;
  [key: string]: unknown;
}

/**
 * What was required: a sentence or a page. Either or both.
 * @beta Shape may change before release.
 */
export interface OBCriteria {
  /** A page describing the criteria. */
  id?: string;
  /** The criteria in words, Markdown allowed by the spec. */
  narrative?: string;
}

/**
 * A link from the achievement to a standard or a curriculum: a competency
 * aim (kompetansemål), a framework level.
 * @beta Shape may change before release.
 */
export interface OBAlignment {
  type: ['Alignment', ...string[]];
  targetName: string;
  targetUrl: string;
  targetDescription?: string;
  targetFramework?: string;
  targetCode?: string;
  [key: string]: unknown;
}

/**
 * The spec's achievement types. Custom values are allowed with an `ext:`
 * prefix.
 */
export type OBAchievementType =
  | 'Achievement'
  | 'Assessment'
  | 'Assignment'
  | 'Award'
  | 'Badge'
  | 'Certificate'
  | 'Certification'
  | 'Competency'
  | 'Course'
  | 'Degree'
  | 'Diploma'
  | 'LearningProgram'
  | 'License'
  | 'Membership'
  | 'MicroCredential'
  | (string & {});

/**
 * The achievement: what can be earned, defined once by its creator and
 * then awarded many times. The thing a badge is a picture of.
 * @beta Shape may change before release.
 */
export interface OBAchievement {
  /** A URL or URN that identifies the achievement. */
  id: string;
  type: ['Achievement', ...string[]];
  name: string;
  description: string;
  criteria: OBCriteria;
  /** The badge's picture. A renderer produces it; the issuer stores it here. */
  image?: OBImage;
  /** @default 'Achievement' */
  achievementType?: OBAchievementType;
  creator?: OBProfile;
  /** A short code for the achievement, as a school would print it. */
  humanCode?: string;
  tag?: string[];
  alignment?: OBAlignment[];
  /** BCP 47 tag of the language the text is in, e.g. `'nb'`. */
  inLanguage?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * The credential's subject: who earned the achievement.
 * @beta Shape may change before release.
 */
export interface OBAchievementSubject {
  type: ['AchievementSubject', ...string[]];
  /** The recipient's identifier (a DID, a URL); absent when they are identified by `identifier`. */
  id?: string;
  achievement: OBAchievement;
  /** When the achievement was completed, if it differs from the issue date. */
  activityEndDate?: string;
  activityStartDate?: string;
  narrative?: string;
  [key: string]: unknown;
}

/**
 * An Open Badge: a Verifiable Credential whose subject holds an
 * achievement. Unsigned until an issuer adds a `proof` or wraps it in a
 * JWS — both outside this package.
 * @beta Shape may change before release.
 */
export interface OpenBadgeCredential {
  '@context': readonly string[] | string[];
  type: ['VerifiableCredential', 'OpenBadgeCredential' | 'AchievementCredential', ...string[]];
  /** A URL or URN that identifies this award. */
  id?: string;
  name?: string;
  description?: string;
  issuer: OBProfile;
  /** ISO 8601, when the credential became valid: the day it was earned. */
  validFrom: string;
  validUntil?: string;
  credentialSubject: OBAchievementSubject;
  /** The signature. Carried, never read here. */
  proof?: unknown;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// The look. Open Badges says what a badge is; nothing in the spec says what
// it looks like beyond `image`. The display is ours, kept beside the
// achievement rather than inside it, so the achievement stays plain spec
// JSON and every renderer draws the same medallion from the same values.

/** The medallion's outline. */
export type BadgeShape = 'circle' | 'shield' | 'hexagon' | 'rosette';

/** The metal of the inner ring; none for a badge without levels. */
export type BadgeTier = 'bronze' | 'silver' | 'gold';

/**
 * Where the learner stands: `earned` is the badge in full colour; `locked`
 * is the outline of what is still to do; `in-progress` is locked with the
 * progress drawn around the rim.
 */
export type BadgeState = 'earned' | 'locked' | 'in-progress';

/**
 * How an achievement is drawn.
 * @beta Shape may change before release.
 */
export interface BadgeDisplay {
  /** @default 'circle' */
  shape?: BadgeShape;
  tier?: BadgeTier;
  /**
   * A short mark in the middle, when there is no emblem glyph: `'×'` for
   * the times tables, `'7'` for the seventh level, `'ABC'`.
   */
  symbol?: string;
  /** A word under the emblem, in capitals: `'TIMES'`, `'2026'`. Keep it short. */
  caption?: string;
}

/** The metals, the same in every theme: a gold badge is gold on paper and on screen. */
export const BADGE_TIER_COLORS: Record<BadgeTier, string> = {
  bronze: '#b4713d',
  silver: '#8f98a3',
  gold: '#d4a017',
};
