/**
 * A run of message text: plain, an `@nick` mention, or an http(s) link.
 * @beta Shape may change before release.
 */
export type ChatTextSegment = {
    kind: 'text' | 'mention' | 'link';
    value: string;
};
/**
 * Splits message text into plain runs, mentions and links. Links are found
 * first, so a mention is never inside a URL and a URL is never a mention.
 * The one reading of a message every renderer shares, so the web and an
 * app link and highlight the same runs.
 * @beta May change before release.
 */
export declare function segmentChatText(text: string, { mentions }?: {
    mentions?: boolean | undefined;
}): ChatTextSegment[];
//# sourceMappingURL=segments.d.ts.map