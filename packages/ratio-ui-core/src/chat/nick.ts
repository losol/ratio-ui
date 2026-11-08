// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { ChatTextSegment } from './segments';

/**
 * Whether two nicks are the same person: normalised and locale-independent,
 * since a nick is an identifier and the viewer's locale (Turkish dotless i)
 * must not change who is meant. Empty or missing is never a match.
 * @beta May change before release.
 */
export const sameNick = (a?: string, b?: string): boolean =>
  !!a && !!b && a.normalize().toLowerCase() === b.normalize().toLowerCase();

/**
 * The nick's first character, upper-cased, for an initial avatar. A whole
 * character, not a code unit: an emoji or a decomposed `Å` stays in one
 * piece. Upper-cased without the viewer's locale, as `sameNick` compares.
 * @beta May change before release.
 */
export const nickInitial = (nick?: string): string => {
  const name = nick?.trim().normalize();
  if (!name) return '';
  // Hermes (React Native) has no Intl.Segmenter; a code point is close enough there.
  const first =
    typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter().segment(name)][0]!.segment
      : String.fromCodePoint(name.codePointAt(0)!);
  return first.toUpperCase();
};

/**
 * Whether segmented message text mentions `nick` — a mention of the whole
 * nick, whatever its case or Unicode form.
 * @beta May change before release.
 */
export const mentionsNick = (segments: readonly ChatTextSegment[], nick?: string): boolean =>
  segments.some(s => s.kind === 'mention' && sameNick(s.value.slice(1), nick));
