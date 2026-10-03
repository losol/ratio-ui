// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../utils/cn';
import type { ChatLogMessage } from './ChatLog';
import { ChatLinkPreviewCard, hasPreviewContent } from './ChatLinkPreview';
import { ChatReactions } from './ChatReactions';
import { ChatText } from './ChatText';
import { segmentChatText } from './chatTextSegments';

/** Built-in text of `Chat.MessageCard`. Each entry falls back to English. @beta */
export interface ChatMessageCardLabels {
  /** The link to the message in its room. @default 'See in the room' */
  seeInRoom?: string;
  /** Shown instead of the text of a removed message. @default 'This message was removed.' */
  removed?: string;
  /** Name of the reaction row. @default 'Reactions' */
  reactions?: string;
  /** Screen-reader note on every link in the text. @default 'opens in a new tab' */
  opensInNewTab?: string;
}

/** @beta Prop shape may change before release. */
export interface ChatMessageCardProps {
  /** The message: nick, text, preview and reactions as in the log. */
  message: ChatLogMessage;
  /** The full date and time, formatted by the caller. */
  dateTime?: string;
  /** The room it was written in. */
  room?: string;
  /** Link to the message in its room. */
  roomHref?: string;
  /** Renders the room link, e.g. a router's Link. @default 'a' */
  linkAs?: React.ElementType;
  /** Built-in text. Each entry falls back to English. */
  labels?: ChatMessageCardLabels;
  /** The message was deleted: show `labels.removed` instead of the text. */
  removed?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Chat.MessageCard — one message on its own page: author, date and room on
 * a small line, the text at body size with links and mentions as in the
 * log, the link preview, and the reactions, read-only. A link back to the
 * message in its room when `roomHref` is set.
 *
 * Shares the text rendering and the preview card with `Chat.Log`.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatMessageCard: React.FC<ChatMessageCardProps> = ({
  message,
  dateTime,
  room,
  roomHref,
  linkAs: LinkAs = 'a',
  labels,
  removed = false,
  className,
  testId,
}) => {
  const { id, nick, text, preview, reactions } = message;
  const l: Required<ChatMessageCardLabels> = {
    seeInRoom: labels?.seeInRoom ?? 'See in the room',
    removed: labels?.removed ?? 'This message was removed.',
    reactions: labels?.reactions ?? 'Reactions',
    opensInNewTab: labels?.opensInNewTab ?? 'opens in a new tab',
  };
  const name = [nick, dateTime].filter(Boolean).join(', ');

  return (
    <article
      aria-label={name || undefined}
      data-message-id={id}
      data-testid={testId}
      className={cn(
        // Same container name as the log, so the preview card spans a narrow card too.
        '@container/chat flex flex-col gap-3 rounded-lg border border-border-1 bg-card p-4 text-(--text)',
        className,
      )}
    >
      <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
        {nick && <span className="font-semibold">{nick}</span>}
        {dateTime && <span className="text-(--text-subtle)">{dateTime}</span>}
        {room && (
          <span className="text-(--text-subtle)">
            <span aria-hidden>· </span>
            {room}
          </span>
        )}
      </p>
      {removed ? (
        <p className="m-0 italic text-(--text-muted)">{l.removed}</p>
      ) : (
        <p className="m-0 break-words text-pretty text-base leading-relaxed">
          <ChatText segments={segmentChatText(text)} opensInNewTab={l.opensInNewTab} />
        </p>
      )}
      {!removed && preview && hasPreviewContent(preview) && (
        <ChatLinkPreviewCard preview={preview} opensInNewTab={l.opensInNewTab} />
      )}
      {reactions && reactions.length > 0 && (
        <ChatReactions reactions={reactions} aria-label={l.reactions} />
      )}
      {roomHref && (
        <LinkAs
          href={roomHref}
          className={cn(
            'self-start rounded-xs text-sm font-medium text-(--primary) no-underline underline-offset-2',
            'hover:underline focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
          )}
        >
          {l.seeInRoom} <span aria-hidden>→</span>
        </LinkAs>
      )}
    </article>
  );
};
ChatMessageCard.displayName = 'Chat.MessageCard';
