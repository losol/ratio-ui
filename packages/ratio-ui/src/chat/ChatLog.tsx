// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import type { NavTreeProps } from '../core/NavTree';
import { cn } from '../utils/cn';
import {
  continuesGroup,
  hasPreviewContent,
  mentionsNick,
  nickInitial,
  sameNick,
  segmentChatText,
  type ChatLogMessage,
  type ChatRole,
  type ChatTextSegment,
} from '@eventuras/ratio-ui-core/chat';
import { ChatReactions } from './ChatReactions';
import { ChatReactionBar } from './ChatReactionBar';
import { ChatLinkPreviewCard } from './ChatLinkPreview';
import { ChatText } from './ChatText';

// The message's shape and the rules for reading it live in ratio-ui-core,
// shared with the native renderer; re-exported so `ratio-ui/chat` keeps them.
export type { ChatLogMessage, ChatRole };

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

/**
 * How `Chat.Log` lays out its messages: `log` is one line per message,
 * `cards` a small card with an avatar.
 * @beta Shape may change before release.
 */
export type ChatLogLayout = 'log' | 'cards';

const QUICK_REACTIONS = ['👍', '❤️', '😄'];
const MORE_REACTIONS = ['👍', '❤️', '😄', '🎉', '🙏', '👀', '✅', '☕', '🔥', '😮', '😢', '🤔'];

/** @beta Prop shape may change before release. */
export interface ChatLogProps {
  messages: ChatLogMessage[];
  /**
   * `log` puts time, nick and text on one line. `cards` sets an avatar
   * beside the nick and time, with the text below, and one nick's
   * consecutive messages share the avatar and that line — within five
   * minutes of each other, when they carry a `timestamp`.
   * @default 'log'
   * @beta Prop shape may change before release.
   */
  layout?: ChatLogLayout;
  /**
   * The avatar beside a group's first message, in the `cards` layout. Its
   * root fills a square sized and rounded by the `--chat-avatar-*` tokens,
   * hidden from screen readers since the nick sits beside it. Return
   * nothing (`null`, `undefined`, `false`) for the nick's initial, the default.
   * @beta Prop shape may change before release.
   */
  avatar?: (message: ChatLogMessage) => React.ReactNode;
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
  /** Routing link component for messages with `href`, e.g. Next's `Link`. @default 'a' */
  LinkComponent?: NavTreeProps['LinkComponent'];
  /**
   * The message whose bar is open. Touch has no hover, so without this the
   * bar is unreachable on a phone. Controlled: pair it with `onActivate`,
   * which the log calls on a tap — the log holds no state of its own.
   */
  activeId?: string;
  /**
   * Called with the message a tap opened, or `undefined` when the tap closed
   * it or landed outside a message. Taps on a link or a button are left
   * alone. Without it the log ignores taps entirely.
   */
  onActivate?: (messageId: string | undefined) => void;
  /** Renders the time link on messages with an `href`. @deprecated Use `LinkComponent`. Removed in 3.0. */
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

const TIME = 'font-mono text-xs not-italic tabular-nums text-(--text-subtle)';

// Past this much drift a touch gesture was a scroll, not a tap on a row.
const TAP_SLOP = 10;

/**
 * Chat.Log — the dense, one-line-per-message log for channels: time, nick
 * with its role glyph, text. Join/part and topic changes are `event` rows,
 * `/me` is an `action`, and a `divider` marks a day or "new messages".
 * `layout="cards"` gives each message an avatar and more room instead.
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
    layout = 'log',
    avatar,
    me,
    onToggleReaction,
    quickReactions = QUICK_REACTIONS,
    moreReactions = MORE_REACTIONS,
    highlightedId,
    activeId,
    onActivate,
    LinkComponent,
    linkAs,
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

  // Touch has no hover, so the bar over a message would never show: its
  // reactions and "Copy link" would be unreachable on a phone. A tap reports
  // the message it landed on and the caller decides, the same way it decides
  // `highlightedId` — the log keeps no state. Pointer type, not a media
  // query: a tap on a hybrid laptop should work like one on a phone.
  // Only the gesture itself is tracked, and only between down and up.
  const tapStart = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent) => {
    tapStart.current =
      event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = tapStart.current;
    tapStart.current = null;
    if (!onActivate || event.pointerType !== 'touch' || !start) return;
    // A scroll ends in a pointerup too, so only a gesture that stayed put counts.
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) return;
    const target = event.target as HTMLElement;
    // The text's own links, the time, and the bar's buttons keep their taps.
    if (target.closest('a, button')) return;
    const id = target.closest<HTMLElement>('[data-message-id]')?.dataset.messageId;
    onActivate(id && id !== activeId ? id : undefined);
  };

  const linkTag = (LinkComponent ?? linkAs ?? 'a') as React.ElementType;

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
      onPointerDown={onActivate ? onPointerDown : undefined}
      onPointerUp={onActivate ? onPointerUp : undefined}
      // Scrollable, so it has to be reachable by keyboard.
      tabIndex={0}
      data-testid={testId}
      className={cn(
        // A container, so rows can stack when the log itself is narrow (a
        // phone, or a side panel), whatever the viewport.
        '@container/chat [--chat-log-px:1.375rem]',
        'flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-(--chat-log-px) py-3',
        'text-[0.875rem] leading-normal text-(--text)',
        layout === 'cards' && 'gap-0 text-base',
        'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none focus-visible:ring-inset',
        className,
      )}
    >
      {messages.map((message, i) => {
        const row: ChatLogRowProps = {
          message,
          me,
          onToggleReaction,
          onCopyLink,
          linkTag,
          active: message.id === activeId,
          highlighted: message.id === highlightedId,
          quickReactions,
          moreReactions,
          labels: rowLabels,
        };
        return layout === 'cards' ? (
          <ChatCardRow
            key={message.id}
            {...row}
            continued={continuesGroup(messages[i - 1], message)}
            avatar={avatar}
          />
        ) : (
          <ChatLogRow key={message.id} {...row} />
        );
      })}
    </div>
  );
});
ChatLog.displayName = 'Chat.Log';

type ChatLogRowProps = {
  message: ChatLogMessage;
  labels: Required<ChatLogLabels>;
  highlighted: boolean;
  /** Its bar is open, which is how touch reaches a bar with no hover. */
  active: boolean;
  /** Resolved from `LinkComponent`, the deprecated `linkAs`, or `'a'`. */
  linkTag: React.ElementType;
} & Pick<ChatLogProps, 'me' | 'onToggleReaction' | 'onCopyLink'> &
  Required<Pick<ChatLogProps, 'quickReactions' | 'moreReactions'>>;

// The pointed-at message outranks a mention band.
const rowBand = (highlighted: boolean, mentionsMe: boolean) =>
  highlighted
    ? 'border-(--primary) bg-(--chat-active-bg)'
    : mentionsMe
      ? 'border-(--accent) bg-(--chat-mention-bg)'
      : 'border-transparent hover:bg-(--chat-row-hover-bg) has-[[data-focus-visible]]:bg-(--chat-row-hover-bg)';

type MessageBarProps = Pick<
  ChatLogRowProps,
  'onToggleReaction' | 'quickReactions' | 'moreReactions' | 'labels'
> & { id: string; copyLink?: () => void };

/** The bar over a message: quick reactions, the picker and "Copy link". */
const MessageBar: React.FC<MessageBarProps> = ({
  id,
  copyLink,
  onToggleReaction,
  quickReactions,
  moreReactions,
  labels,
}) =>
  onToggleReaction || copyLink ? (
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
        'group-data-active/row:pointer-events-auto group-data-active/row:opacity-100',
        'data-[open]:pointer-events-auto data-[open]:opacity-100',
      )}
    />
  ) : null;

type MessageTimeProps = Pick<ChatLogRowProps, 'message' | 'linkTag' | 'labels'> & {
  className: string;
};

/** The time, and with an `href` the message's permalink. */
const MessageTime: React.FC<MessageTimeProps> = ({
  message: { href, nick, time },
  linkTag: LinkTag,
  labels,
  className,
}) =>
  href ? (
    // The usual chat permalink: in-app, same tab, through the router's Link.
    <LinkTag
      href={href}
      aria-label={labels.messageLink(nick ?? '', time ?? '')}
      className={cn(
        className,
        'rounded-xs no-underline hover:text-(--text-muted) hover:underline',
        'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
      )}
    >
      {time}
    </LinkTag>
  ) : (
    <span className={className}>{time}</span>
  );

type NickProps = Pick<ChatLogRowProps, 'message' | 'me' | 'labels'> & { className: string };

/** The nick, its role glyph and your own nick's tint. */
const Nick: React.FC<NickProps> = ({ message: { nick, role }, me, labels, className }) => (
  <span className={cn(className, sameNick(nick, me) ? NICK_COLOR.voice : NICK_COLOR[role ?? 'none'])}>
    {/* The glyph is read as "at" or "plus", so screen readers get the role's name instead. */}
    {role && <span aria-hidden>{ROLE_GLYPH[role]}</span>}
    {nick}
    {role && <span className="sr-only"> ({labels[role]})</span>}
  </span>
);

type MessageBodyProps = Pick<ChatLogRowProps, 'message' | 'onToggleReaction' | 'labels'> & {
  segments: ChatTextSegment[];
  mentionsMe: boolean;
  className: string;
};

/** The text, the link preview and the reactions. */
const MessageBody: React.FC<MessageBodyProps> = ({
  message: { id, preview, reactions },
  segments,
  mentionsMe,
  onToggleReaction,
  labels,
  className,
}) => (
  <div className={className}>
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
);

const ChatLogRow: React.FC<ChatLogRowProps> = ({
  message,
  me,
  onToggleReaction,
  onCopyLink,
  linkTag,
  highlighted,
  active,
  quickReactions,
  moreReactions,
  labels,
}) => {
  const { id, type = 'msg', time, nick, text, href } = message;

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
  const mentionsMe = mentionsNick(segments, me);
  const copyLink = onCopyLink && href ? () => onCopyLink(message) : undefined;

  return (
    <div
      data-message-id={id}
      data-active={active || undefined}
      aria-current={highlighted || undefined}
      className={cn(
        // Bleeds to the log's edges so a mention band runs full width; the
        // 3px stripe comes out of the padding, keeping every row aligned.
        'group/row relative -mx-(--chat-log-px) grid grid-cols-[44px_88px_minmax(0,1fr)] items-baseline gap-x-3',
        'border-l-3 py-0.5 pr-(--chat-log-px) pl-[calc(var(--chat-log-px)-3px)] transition-colors duration-100',
        // Narrow: nick and time on one line, the text on its own below.
        '@max-lg/chat:grid-cols-[auto_minmax(0,1fr)] @max-lg/chat:gap-x-2 @max-lg/chat:gap-y-0.5 @max-lg/chat:py-1.5',
        rowBand(highlighted, mentionsMe),
      )}
    >
      <MessageBar
        id={id}
        copyLink={copyLink}
        onToggleReaction={onToggleReaction}
        quickReactions={quickReactions}
        moreReactions={moreReactions}
        labels={labels}
      />
      <MessageTime
        message={message}
        linkTag={linkTag}
        labels={labels}
        className={cn(TIME, '@max-lg/chat:col-start-2 @max-lg/chat:row-start-1')}
      />
      <Nick
        message={message}
        me={me}
        labels={labels}
        className={cn(
          'truncate text-right font-semibold',
          '@max-lg/chat:col-start-1 @max-lg/chat:row-start-1 @max-lg/chat:max-w-[60cqw] @max-lg/chat:text-left',
        )}
      />
      <MessageBody
        message={message}
        segments={segments}
        mentionsMe={mentionsMe}
        onToggleReaction={onToggleReaction}
        labels={labels}
        className="flex min-w-0 flex-col gap-1 @max-lg/chat:col-span-2 @max-lg/chat:row-start-2"
      />
    </div>
  );
};

type ChatCardRowProps = ChatLogRowProps &
  Pick<ChatLogProps, 'avatar'> & {
    /** Continues the previous message's group, so it has no avatar or name line. */
    continued: boolean;
  };

// The avatar's column first; everything else lines up with the text after it.
const CARD_GRID = 'grid grid-cols-[var(--chat-avatar-size)_minmax(0,1fr)] gap-x-3';

// A later message's time waits in the avatar's column and shows with the
// bar: on hover, on keyboard focus in the row, on an open row, and on its
// own focus. Hidden, it must not catch a tap meant for the row.
const REVEAL = cn(
  'pointer-events-none opacity-0 transition-opacity duration-100',
  'group-hover/row:pointer-events-auto group-hover/row:opacity-100',
  'group-has-[[data-focus-visible]]/row:pointer-events-auto group-has-[[data-focus-visible]]/row:opacity-100',
  'group-data-active/row:pointer-events-auto group-data-active/row:opacity-100',
  'focus-visible:pointer-events-auto focus-visible:opacity-100',
);

/** The avatar of a group's first message: the caller's, or the nick's initial. */
const CardAvatar: React.FC<Pick<ChatCardRowProps, 'message' | 'avatar'>> = ({ message, avatar }) => {
  // `cond && <img />` gives false or '' when there is no picture.
  const own = avatar?.(message) || undefined;
  return (
    // The nick beside it says who this is, so screen readers skip it.
    <span
      aria-hidden
      className={cn(
        'row-span-2 flex size-(--chat-avatar-size) items-center justify-center overflow-hidden rounded-(--chat-avatar-radius) select-none',
        own == null
          ? 'bg-(--chat-avatar-bg) text-[length:calc(var(--chat-avatar-size)*0.42)] leading-none font-bold text-(--chat-avatar-fg)'
          : '*:size-full *:object-cover',
      )}
    >
      {own ?? nickInitial(message.nick)}
    </span>
  );
};

/**
 * A message as a small card: avatar, then nick and time on one line and
 * the text below at body size. A group's later messages keep only the text.
 */
const ChatCardRow: React.FC<ChatCardRowProps> = ({
  message,
  continued,
  avatar,
  me,
  onToggleReaction,
  onCopyLink,
  linkTag,
  highlighted,
  active,
  quickReactions,
  moreReactions,
  labels,
}) => {
  const { id, type = 'msg', time, nick, text, href } = message;

  if (type === 'divider') {
    return (
      <div
        data-message-id={id}
        className={cn(
          'mt-4 mb-1 flex items-center gap-3 font-mono text-[11px] tracking-[0.08em] uppercase text-(--text-subtle)',
          "after:flex-1 after:border-t after:border-border-1 after:content-['']",
        )}
      >
        {text}
      </div>
    );
  }

  // One quiet line in the text's column, no avatar; it ends a group.
  if (type === 'event' || type === 'action') {
    return (
      <div
        data-message-id={id}
        className={cn(
          CARD_GRID,
          'mt-1 py-0.5 italic',
          type === 'event' ? 'text-sm text-(--text-subtle)' : 'text-(--text-muted)',
        )}
      >
        <span className="col-start-2 break-words text-pretty">
          {type === 'event' ? (
            text
          ) : (
            <>
              {['*', nick].filter(Boolean).join(' ')}{' '}
              <ChatText
                segments={segmentChatText(text, { mentions: false })}
                opensInNewTab={labels.opensInNewTab}
              />
            </>
          )}
          {time && (
            <>
              {' '}
              <span className={TIME}>{time}</span>
            </>
          )}
        </span>
      </div>
    );
  }

  const segments = segmentChatText(text);
  const mentionsMe = mentionsNick(segments, me);
  const copyLink = onCopyLink && href ? () => onCopyLink(message) : undefined;

  return (
    <div
      data-message-id={id}
      data-active={active || undefined}
      aria-current={highlighted || undefined}
      className={cn(
        // Bleeds to the log's edges like a log row, for the same full-width bands.
        'group/row relative -mx-(--chat-log-px) border-l-3 pr-(--chat-log-px) pl-[calc(var(--chat-log-px)-3px)] transition-colors duration-100',
        CARD_GRID,
        // A group opens with room above it; its later messages follow close.
        continued ? 'items-baseline py-0.5' : 'mt-2.5 items-start pt-1.5 pb-0.5 first:mt-0',
        rowBand(highlighted, mentionsMe),
      )}
    >
      <MessageBar
        id={id}
        copyLink={copyLink}
        onToggleReaction={onToggleReaction}
        quickReactions={quickReactions}
        moreReactions={moreReactions}
        labels={labels}
      />
      {continued ? (
        <>
          {/* The group's name line shows who; screen readers get it on every message. */}
          <span className="sr-only">{nick}</span>
          <MessageTime
            message={message}
            linkTag={linkTag}
            labels={labels}
            // The pointed-at message shows its time without a hover.
            className={cn(TIME, 'justify-self-end text-[0.6875rem] whitespace-nowrap', !highlighted && REVEAL)}
          />
        </>
      ) : (
        <>
          <CardAvatar message={message} avatar={avatar} />
          <span className="flex min-w-0 items-baseline gap-2">
            <Nick message={message} me={me} labels={labels} className="truncate font-bold" />
            <MessageTime message={message} linkTag={linkTag} labels={labels} className={cn(TIME, 'shrink-0')} />
          </span>
        </>
      )}
      <MessageBody
        message={message}
        segments={segments}
        mentionsMe={mentionsMe}
        onToggleReaction={onToggleReaction}
        labels={labels}
        className="col-start-2 flex min-w-0 flex-col gap-1.5"
      />
    </div>
  );
};
