import type { ChatLinkPreview } from './types';
/**
 * The host of a URL, lower-cased and without a leading `www.`; the URL
 * itself when it has no host.
 * @beta May change before release.
 */
export declare const hostOf: (url: string) => string;
/**
 * A preview is only worth a card when it has something to say.
 * @beta May change before release.
 */
export declare const hasPreviewContent: (preview: ChatLinkPreview) => boolean;
/**
 * The card's small label: the site's name, or the link's host.
 * @beta May change before release.
 */
export declare const previewLabel: (preview: ChatLinkPreview) => string;
//# sourceMappingURL=linkPreview.d.ts.map