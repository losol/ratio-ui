// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import { ChatReactions, type ChatReaction } from './ChatReactions';
import { ChatReactionBar } from './ChatReactionBar';
import { ChatLinkPreviewCard, hasPreviewContent, type ChatLinkPreview } from './ChatLinkPreview';
import { ChatText } from './ChatText';
import { segmentChatText } from './chatTextSegments';

/**
 * Channel role, shown as a glyph before the nick: `@` op, `+` voice.
 * @beta Prop shape may change before release.
 */
export type ChatRole = 'op' | 'voice';

/** @beta Prop shape may change before release. */
export interface ChatLogMessage {
  id: string;
  /** Row kind. @default 'msg' */
  type?: 'msg' | 'event' | 'action' | 'divider';
  /** Display time, formatted by the caller, e.g. `'09:42'`. */
  time?: string;
  /** Author of a `msg` or an `action`. */
  nick?: string;
  role?: ChatRole;
  /**
   * The message; `@nick` mentions are highlighted and http(s) URLs become
   * links. A divider's label.
   */
  text: string;
  /** A card for a link in the message, shown under the text. */
  preview?: ChatLinkPreview;
  /** The message's own address; the time becomes a link to it. */
  href?: string;
  /** Emoji reactions, shown under a `msg`. */
  reactions?: ChatReaction[];
}

/** Built-in text of `Chat.Log`. Each entry falls back to English. @beta */
export interface ChatLogLabels {
  /** Name of each message's reaction row. @default 'Reactions' */
  reactions?: string;
  /** Screen-reader note on a message that mentions you. @default 'Mentions you' */
  mentionsYou?: string;
  /** Screen-reader name of the `@` role. @default 'op' */
  op?: string;
  /** Screen-reader name of the `+` role. @default 'voice' */
  voice?: string;
  /** Name of the reaction bar on each message. @default 'React to message' */
  reactionBar?: string;
  /** Name of the button that opens the reaction picker. @default 'More reactions' */
  moreReactions?: string;
  /** Name of each emoji button in the bar and the picker. @default (emoji) => `React with ${emoji}` */
  reactWith?: (emoji: string) => string;
  /** Screen-reader note on every link, which opens in a new tab. @default 'opens in a new tab' */
  opensInNewTab?: string;
  /** Name of the time link on a message with an `href`. @default (nick, time) => `Message from ${nick} at ${time}` */
  messageLink?: (nick: string, time: string) => string;
  /** Name of the "Copy link" button in the bar. @default 'Copy link' */
  copyLink?: string;
}

const QUICK_REACTIONS = ['👍', '❤️', '😄'];
const MORE_REACTIONS = ['👍', '❤️', '😄', '🎉', '🙏', '👀', '✅', '☕', '🔥', '😮', '😢', '🤔'];

/** @beta Prop shape may change before release. */
export interface ChatLogProps {
  messages: ChatLogMessage[];
  /** Your own nick — tinted in the log, and rows that mention it are highlighted. */
  me?: string;
  /**
   * Called with the message and the emoji when you add or remove a reaction,
   * from the reactions under a message or the bar over it. Picking an emoji
   * you have already reacted with removes it. Without it, reactions are
   * read-only and there is no bar.
   */
  onToggleReaction?: (messageId: string, emoji: string) => void;
  /** One-click reactions in the bar that shows on hover or focus. @default ['👍', '❤️', '😄'] */
  quickReactions?: string[];
  /** Reactions in the bar's picker. Pass `[]` to leave the picker out. @default twelve common emoji */
  moreReactions?: string[];
  /**
   * The message to point at: its row is highlighted and, once it is in the
   * log, scrolled into view — once per id, so later messages don't pull the
   * view back.
   */
  highlightedId?: string;
  /** Renders the time link on messages with an `href`, e.g. a router's Link. @default 'a' */
  linkAs?: React.ElementType;
  /**
   * Adds "Copy link" to the bar on messages with an `href`. The caller
   * copies, since it knows the absolute URL. The bar shows for this alone,
   * so a read-only log gets just that button.
   */
  onCopyLink?: (message: ChatLogMessage) => void;
  /** Accessible name for each message's reaction row. @deprecated Use `labels.reactions`. Still honoured until the next major. */
  reactionsLabel?: string;
  /** Built-in text. Each entry falls back to English. */
  labels?: ChatLogLabels;
  /** Accessible name, e.g. the channel. */
  'aria-label'?: string;
  className?: string;
  testId?: string;
}

const ROLE_GLYPH: Record<ChatRole, string> = { op: '@', voice: '+' };

const NICK_COLOR: Record<ChatRole | 'none', string> = {
  op: 'text-(--chat-nick-op)',
  voice: 'text-(--chat-nick-voice)',
  none: 'text-(--chat-nick)',
};

// Normalised and locale-independent: a nick is an identifier, and the
// viewer's locale (Turkish dotless i) must not change who is mentioned.
const sameNick = (a?: string, b?: string) =>
  !!a && !!b && a.normalize().toLowerCase() === b.normalize().toLowerCase();

const TIME = 'font-mono text-xs not-italic tabular-nums text-(--text-subtle)';

/**
 * Chat.Log — the dense, one-line-per-message log for channels: time, nick
 * with its role glyph, text. Join/part and topic changes are `event` rows,
 * `/me` is an `action`, and a `divider` marks a day or "new messages".
 *
 * Purely presentational, and it does not scroll itself — same contract as
 * `Console.Body`. The ref is the scroll container, so the caller decides
 * when to follow new messages.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatLog = React.forwardRef<HTMLDivElement, ChatLogProps>(function ChatLog(
  {
    messages,
    me,
    onToggleReaction,
    quickReactions = QUICK_REACTIONS,
    moreReactions = MORE_REACTIONS,
    highlightedId,
    linkAs = 'a',
    onCopyLink,
    reactionsLabel,
    labels,
    'aria-label': ariaLabel,
    className,
    testId,
  },
  ref,
) {
  const logRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      logRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Scrolls the highlighted row to the middle of the log, inside the log's
  // own scroll box. Once per id: a row that arrives with later history still
  // gets its scroll, but messages posted after that leave the view alone.
  const scrolledTo = useRef<string | undefined>(undefined);
  useEffect(() => {
    const log = logRef.current;
    if (!log || !highlightedId || scrolledTo.current === highlightedId) return;
    const row = log.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(highlightedId)}"]`);
    if (!row) return;
    scrolledTo.current = highlightedId;
    const rowTop = row.getBoundingClientRect().top - log.getBoundingClientRect().top + log.scrollTop;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    log.scrollTo({
      top: rowTop - (log.clientHeight - row.offsetHeight) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [highlightedId, messages]);

  const rowLabels: Required<ChatLogLabels> = {
    reactions: labels?.reactions ?? reactionsLabel ?? 'Reactions',
    mentionsYou: labels?.mentionsYou ?? 'Mentions you',
    op: labels?.op ?? 'op',
    voice: labels?.voice ?? 'voice',
    reactionBar: labels?.reactionBar ?? 'React to message',
    moreReactions: labels?.moreReactions ?? 'More reactions',
    reactWith: labels?.reactWith ?? (emoji => `React with ${emoji}`),
    opensInNewTab: labels?.opensInNewTab ?? 'opens in a new tab',
    messageLink: labels?.messageLink ?? ((nick, time) => `Message from ${nick} at ${time}`),
    copyLink: labels?.copyLink ?? 'Copy link',
  };
  return (
    <div
      ref={setRefs}
      role="log"
      aria-label={ariaLabel}
      // Scrollable, so it has to be reachable by keyboard.
      tabIndex={0}
      data-testid={testId}
      className={cn(
        // A container, so rows can stack when the log itself is narrow (a
        // phone, or a side panel), whatever the viewport.
        '@container/chat [--chat-log-px:1.375rem]',
        'flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-(--chat-log-px) py-3',
        'text-[0.875rem] leading-normal text-(--text)',
        'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none focus-visible:ring-inset',
        className,
      )}
    >
      {messages.map(message => (
        <ChatLogRow
          key={message.id}
          message={message}
          me={me}
          onToggleReaction={onToggleReaction}
          onCopyLink={onCopyLink}
          linkAs={linkAs}
          highlighted={message.id === highlightedId}
          quickReactions={quickReactions}
          moreReactions={moreReactions}
          labels={rowLabels}
        />
      ))}
    </div>
  );
});
ChatLog.displayName = 'Chat.Log';

type ChatLogRowProps = {
  message: ChatLogMessage;
  labels: Required<ChatLogLabels>;
  highlighted: boolean;
} & Pick<ChatLogProps, 'me' | 'onToggleReaction' | 'onCopyLink'> &
  Required<Pick<ChatLogProps, 'quickReactions' | 'moreReactions' | 'linkAs'>>;

const ChatLogRow: React.FC<ChatLogRowProps> = ({
  message,
  me,
  onToggleReaction,
  onCopyLink,
  linkAs: LinkAs,
  highlighted,
  quickReactions,
  moreReactions,
  labels,
}) => {
  const { id, type = 'msg', time, nick, role, text, preview, reactions, href } = message;

  if (type === 'divider') {
    return (
      <div
        data-message-id={id}
        className={cn(
          'mt-1.5 mb-2.5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-(--text-subtle)',
          "before:flex-1 before:border-t before:border-dashed before:border-border-2 before:content-['']",
          "after:flex-1 after:border-t after:border-dashed after:border-border-2 after:content-['']",
        )}
      >
        {text}
      </div>
    );
  }

  // Events and actions span the nick and text columns, so they read as
  // narration rather than as someone speaking.
  if (type === 'event' || type === 'action') {
    return (
      <div
        data-message-id={id}
        className={cn(
          'grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-x-3 italic',
          type === 'event' ? 'text-(--text-subtle)' : 'text-(--text-muted)',
        )}
      >
        <span className={TIME}>{time}</span>
        {type === 'event' ? (
          <span>— {text}</span>
        ) : (
          <span>
            {['*', nick].filter(Boolean).join(' ')}{' '}
            <ChatText
              segments={segmentChatText(text, { mentions: false })}
              opensInNewTab={labels.opensInNewTab}
            />
          </span>
        )}
      </div>
    );
  }

  const segments = segmentChatText(text);
  const mentionsMe = segments.some(s => s.kind === 'mention' && sameNick(s.value.slice(1), me));
  const copyLink = onCopyLink && href ? () => onCopyLink(message) : undefined;
  const timeClass = cn(TIME, '@max-lg/chat:col-start-2 @max-lg/chat:row-start-1');

  return (
    <div
      data-message-id={id}
      aria-current={highlighted || undefined}
      className={cn(
        // Bleeds to the log's edges so a mention band runs full width; the
        // 3px stripe comes out of the padding, keeping every row aligned.
        'group/row relative -mx-(--chat-log-px) grid grid-cols-[44px_88px_minmax(0,1fr)] items-baseline gap-x-3',
        'border-l-3 py-0.5 pr-(--chat-log-px) pl-[calc(var(--chat-log-px)-3px)] transition-colors duration-100',
        // Narrow: nick and time on one line, the text on its own below.
        '@max-lg/chat:grid-cols-[auto_minmax(0,1fr)] @max-lg/chat:gap-x-2 @max-lg/chat:gap-y-0.5 @max-lg/chat:py-1.5',
        // The pointed-at message outranks a mention band.
        highlighted
          ? 'border-(--primary) bg-(--chat-active-bg)'
          : mentionsMe
            ? 'border-(--accent) bg-(--chat-mention-bg)'
            : 'border-transparent hover:bg-(--chat-row-hover-bg) has-[[data-focus-visible]]:bg-(--chat-row-hover-bg)',
      )}
    >
      {(onToggleReaction || copyLink) && (
        <ChatReactionBar
          quick={onToggleReaction ? quickReactions : []}
          more={onToggleReaction ? moreReactions : []}
          onReact={onToggleReaction ? onToggleReaction.bind(null, id) : () => {}}
          label={labels.reactionBar}
          moreLabel={labels.moreReactions}
          reactWith={labels.reactWith}
          onCopyLink={copyLink}
          copyLinkLabel={labels.copyLink}
          // In the DOM from the start, so keyboard users reach it. Shown on
          // hover, on keyboard focus in the row (not after a click, or it
          // would stay up once the pointer leaves), and while its picker is open.
          className={cn(
            'absolute -top-[15px] right-[18px] z-[3]',
            // Hidden bars must not catch clicks meant for the row above.
            'pointer-events-none opacity-0 transition-opacity duration-100',
            'group-hover/row:pointer-events-auto group-hover/row:opacity-100',
            'group-has-[[data-focus-visible]]/row:pointer-events-auto group-has-[[data-focus-visible]]/row:opacity-100',
            'data-[open]:pointer-events-auto data-[open]:opacity-100',
          )}
        />
      )}
      {href ? (
        // The usual chat permalink: in-app, same tab, through the router's Link.
        <LinkAs
          href={href}
          aria-label={labels.messageLink(nick ?? '', time ?? '')}
          className={cn(
            timeClass,
            'rounded-xs no-underline hover:text-(--text-muted) hover:underline',
            'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
          )}
        >
          {time}
        </LinkAs>
      ) : (
        <span className={timeClass}>{time}</span>
      )}
      <span
        className={cn(
          'truncate text-right font-semibold',
          '@max-lg/chat:col-start-1 @max-lg/chat:row-start-1 @max-lg/chat:max-w-[60cqw] @max-lg/chat:text-left',
          sameNick(nick, me) ? NICK_COLOR.voice : NICK_COLOR[role ?? 'none'],
        )}
      >
        {/* The glyph is read as "at" or "plus", so screen readers get the role's name instead. */}
        {role && <span aria-hidden>{ROLE_GLYPH[role]}</span>}
        {nick}
        {role && <span className="sr-only"> ({labels[role]})</span>}
      </span>
      <div className="flex min-w-0 flex-col gap-1 @max-lg/chat:col-span-2 @max-lg/chat:row-start-2">
        <span className="break-words text-pretty">
          {/* The band and stripe only show it; this says it. */}
          {mentionsMe && <span className="sr-only">{labels.mentionsYou}: </span>}
          <ChatText segments={segments} opensInNewTab={labels.opensInNewTab} />
        </span>
        {preview && hasPreviewContent(preview) && (
          <ChatLinkPreviewCard preview={preview} opensInNewTab={labels.opensInNewTab} />
        )}
        {reactions && reactions.length > 0 && (
          <ChatReactions
            reactions={reactions}
            // `bind`, not a closure: a Server Action bound here can still cross
            // into the client component; a closure made on the server cannot.
            onToggle={onToggleReaction?.bind(null, id)}
            aria-label={labels.reactions}
          />
        )}
      </div>
    </div>
  );
};
