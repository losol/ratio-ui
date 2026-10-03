// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useId } from 'react';
import { cn } from '../utils/cn';

/**
 * A card for a link in a message. The caller fetches it; the log only shows
 * it. @beta Prop shape may change before release.
 */
export interface ChatLinkPreview {
  /** The link the card opens. */
  url: string;
  title?: string;
  description?: string;
  /** Shown as the card's small label; the URL's host when absent. */
  siteName?: string;
  /**
   * Already an http(s) URL the browser can load. The card shows it as a
   * fixed square thumbnail, so `width` and `height` are the source image's
   * dimensions for the caller's own use; the card does not read them.
   */
  image?: { src: string; width?: number; height?: number };
}

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** A preview is only worth a card when it has something to say. */
export const hasPreviewContent = (preview: ChatLinkPreview): boolean =>
  !!preview.title || !!preview.description;

type ChatLinkPreviewCardProps = {
  preview: ChatLinkPreview;
  /** Screen-reader note on the link. */
  opensInNewTab: string;
  className?: string;
};

/**
 * The card under a message: site name, title, description and a square
 * thumbnail. The whole card is one link, named by the title.
 */
export const ChatLinkPreviewCard: React.FC<ChatLinkPreviewCardProps> = ({
  preview,
  opensInNewTab,
  className,
}) => {
  const id = useId();
  const { url, title, description, siteName, image } = preview;
  const nameId = `${id}-${title ? 'title' : 'description'}`;
  const noteId = `${id}-note`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer ugc"
      aria-labelledby={`${nameId} ${noteId}`}
      className={cn(
        'flex max-w-[30rem] gap-3 rounded-md border border-border-1 bg-(--chat-bubble-bg) p-2.5',
        // In a narrow log the text column is the row, so the card spans it.
        '@max-lg/chat:max-w-none',
        'text-(--text) no-underline transition-colors hover:border-border-2 hover:bg-(--chat-row-hover-bg)',
        'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
        className,
      )}
    >
      {image && (
        // A fixed box, so the row is its final height before the image lands
        // and a late load never pushes the last row out of view.
        <img
          src={image.src}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          className="size-16 shrink-0 rounded bg-(--chat-row-hover-bg) object-cover"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 self-center">
        <span className="truncate text-[11px] font-semibold tracking-[0.06em] uppercase text-(--text-subtle)">
          {siteName || hostOf(url)}
        </span>
        {title && (
          <span id={`${id}-title`} className="line-clamp-2 font-semibold leading-snug">
            {title}
          </span>
        )}
        {description && (
          <span
            id={`${id}-description`}
            className="line-clamp-2 text-[0.8125rem] leading-snug text-(--text-muted)"
          >
            {description}
          </span>
        )}
        <span id={noteId} className="sr-only">
          {opensInNewTab}
        </span>
      </span>
    </a>
  );
};
ChatLinkPreviewCard.displayName = 'Chat.LinkPreviewCard';
