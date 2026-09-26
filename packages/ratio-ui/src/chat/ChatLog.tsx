// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../utils/cn';
import { ChatReactions, type ChatReaction } from './ChatReactions';

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
  /** The message; `@nick` mentions are highlighted. A divider's label. */
  text: string;
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
}

/** @beta Prop shape may change before release. */
export interface ChatLogProps {
  messages: ChatLogMessage[];
  /** Your own nick — tinted in the log, and rows that mention it are highlighted. */
  me?: string;
  /** Called with the message and the emoji when you add or remove a reaction. */
  onToggleReaction?: (messageId: string, emoji: string) => void;
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

// Letters in any script, combining marks included, so `@åse` is a mention
// whether the å arrives composed or decomposed. The capture group makes
// `split` keep the mentions, at every odd index.
const MENTION = /(@[\p{L}\p{M}\p{N}_-]+)/u;

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
  { messages, me, onToggleReaction, reactionsLabel, labels, 'aria-label': ariaLabel, className, testId },
  ref,
) {
  const rowLabels: Required<ChatLogLabels> = {
    reactions: labels?.reactions ?? reactionsLabel ?? 'Reactions',
    mentionsYou: labels?.mentionsYou ?? 'Mentions you',
    op: labels?.op ?? 'op',
    voice: labels?.voice ?? 'voice',
  };
  return (
    <div
      ref={ref}
      role="log"
      aria-label={ariaLabel}
      // Scrollable, so it has to be reachable by keyboard.
      tabIndex={0}
      data-testid={testId}
      className={cn(
        '[--chat-log-px:1.375rem]',
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
          labels={rowLabels}
        />
      ))}
    </div>
  );
});
ChatLog.displayName = 'Chat.Log';

type ChatLogRowProps = { message: ChatLogMessage; labels: Required<ChatLogLabels> } & Pick<
  ChatLogProps,
  'me' | 'onToggleReaction'
>;

const ChatLogRow: React.FC<ChatLogRowProps> = ({ message, me, onToggleReaction, labels }) => {
  const { id, type = 'msg', time, nick, role, text, reactions } = message;

  if (type === 'divider') {
    return (
      <div
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
        className={cn(
          'grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-x-3 italic',
          type === 'event' ? 'text-(--text-subtle)' : 'text-(--text-muted)',
        )}
      >
        <span className={TIME}>{time}</span>
        <span>{type === 'event' ? `— ${text}` : ['*', nick, text].filter(Boolean).join(' ')}</span>
      </div>
    );
  }

  const parts = text.split(MENTION);
  const mentionsMe = parts.some((part, i) => i % 2 === 1 && sameNick(part.slice(1), me));

  return (
    <div
      className={cn(
        // Bleeds to the log's edges so a mention band runs full width; the
        // 3px stripe comes out of the padding, keeping every row aligned.
        '-mx-(--chat-log-px) grid grid-cols-[44px_88px_minmax(0,1fr)] items-baseline gap-x-3',
        'border-l-3 py-0.5 pr-(--chat-log-px) pl-[calc(var(--chat-log-px)-3px)]',
        mentionsMe ? 'border-(--accent) bg-(--chat-mention-bg)' : 'border-transparent',
      )}
    >
      <span className={TIME}>{time}</span>
      <span
        className={cn(
          'truncate text-right font-semibold',
          sameNick(nick, me) ? NICK_COLOR.voice : NICK_COLOR[role ?? 'none'],
        )}
      >
        {/* The glyph is read as "at" or "plus", so screen readers get the role's name instead. */}
        {role && <span aria-hidden>{ROLE_GLYPH[role]}</span>}
        {nick}
        {role && <span className="sr-only"> ({labels[role]})</span>}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="break-words text-pretty">
          {/* The band and stripe only show it; this says it. */}
          {mentionsMe && <span className="sr-only">{labels.mentionsYou}: </span>}
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="font-semibold text-(--primary)">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
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
