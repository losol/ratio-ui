import type { ChatTextSegment } from './segments';
/**
 * Whether two nicks are the same person: normalised and locale-independent,
 * since a nick is an identifier and the viewer's locale (Turkish dotless i)
 * must not change who is meant. Empty or missing is never a match.
 * @beta May change before release.
 */
export declare const sameNick: (a?: string, b?: string) => boolean;
/**
 * Whether segmented message text mentions `nick` — a mention of the whole
 * nick, whatever its case or Unicode form.
 * @beta May change before release.
 */
export declare const mentionsNick: (segments: readonly ChatTextSegment[], nick?: string) => boolean;
//# sourceMappingURL=nick.d.ts.map