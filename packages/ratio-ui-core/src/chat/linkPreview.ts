// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { ChatLinkPreview } from './types';

// Scheme, optional user info, then the host up to a port, path, query or
// fragment. A pattern rather than `new URL()`: React Native's URL does not
// implement `hostname`, and every renderer must read the host the same way.
const HOST = /^[a-z][a-z\d+.-]*:\/\/(?:[^/?#@]*@)?([^/?#:]+)/i;

/**
 * The host of a URL, lower-cased and without a leading `www.`; the URL
 * itself when it has no host.
 * @beta May change before release.
 */
export const hostOf = (url: string): string => {
  const host = HOST.exec(url)?.[1];
  return host ? host.toLowerCase().replace(/^www\./, '') : url;
};

/**
 * A preview is only worth a card when it has something to say.
 * @beta May change before release.
 */
export const hasPreviewContent = (preview: ChatLinkPreview): boolean =>
  !!preview.title || !!preview.description;

/**
 * The card's small label: the site's name, or the link's host.
 * @beta May change before release.
 */
export const previewLabel = (preview: ChatLinkPreview): string =>
  preview.siteName || hostOf(preview.url);
