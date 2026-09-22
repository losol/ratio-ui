// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../utils/cn';
import type { ChatRole } from './ChatLog';

/** @beta Prop shape may change before release. */
export interface ChatUser {
  nick: string;
  /** Channel role, shown as the `@` or `+` glyph before the nick. */
  role?: ChatRole;
  /** Away users are collected in a line at the bottom rather than listed. */
  away?: boolean;
  /** Your own row — tinted, and tagged with `youLabel`. */
  you?: boolean;
}

/** @beta Prop shape may change before release. */
export interface ChatUsersProps {
  users: ChatUser[];
  /** Heading over the list, e.g. "12 online" — the caller counts and formats. */
  onlineLabel?: React.ReactNode;
  /** Heading over the away line, e.g. "Away · 4". */
  awayLabel?: React.ReactNode;
  /** Tag on your own row, e.g. "you". */
  youLabel?: string;
  /** Tag on an operator's row, e.g. "op". */
  opLabel?: string;
  /** Accessible name for the list, e.g. "People in #volunteers". */
  'aria-label'?: string;
  className?: string;
}

const ROLE_GLYPH: Record<ChatRole, string> = { op: '@', voice: '+' };

const ROLE_COLOR: Record<ChatRole, string> = {
  op: 'text-(--chat-nick-op)',
  voice: 'text-(--chat-nick-voice)',
};

const EYEBROW = 'text-[11px] font-semibold tracking-[0.08em] uppercase text-(--text-subtle)';

// Ops first, then voiced, then everyone else; alphabetical within each rank.
const RANK: Record<string, number> = { op: 0, voice: 1 };
const byRankThenName = (a: ChatUser, b: ChatUser) =>
  (RANK[a.role ?? ''] ?? 2) - (RANK[b.role ?? ''] ?? 2) || a.nick.localeCompare(b.nick);

/**
 * Chat.Users — who is in the room. Online people are listed with their role
 * glyph, your own row is tinted, and away people collapse to one line at the
 * bottom: a long list of absent names is noise.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatUsers: React.FC<ChatUsersProps> = ({
  users,
  onlineLabel,
  awayLabel,
  youLabel,
  opLabel,
  'aria-label': ariaLabel,
  className,
}) => {
  const online = users.filter(u => !u.away).sort(byRankThenName);
  const away = users.filter(u => u.away);

  return (
    <div className={cn('flex h-full flex-col gap-0.5 overflow-auto p-4 text-[0.8125rem]', className)}>
      {onlineLabel && <div className={cn(EYEBROW, 'px-1.5 pb-2')}>{onlineLabel}</div>}
      <ul aria-label={ariaLabel} className="m-0 flex list-none flex-col gap-0.5 p-0">
        {online.map(user => (
          <li
            key={user.nick}
            className={cn(
              'flex items-center gap-2 rounded-(--radius-sm) px-1.5 py-1',
              user.you && 'bg-(--chat-active-bg) text-(--chat-active-fg)',
            )}
          >
            <span
              aria-hidden
              className={cn('w-2.5 font-mono', user.role && ROLE_COLOR[user.role])}
            >
              {user.role ? ROLE_GLYPH[user.role] : ''}
            </span>
            <span className="min-w-0 truncate">{user.nick}</span>
            {(user.you ? youLabel : user.role === 'op' ? opLabel : undefined) && (
              <span className="ml-auto text-[10px] text-(--text-subtle)">
                {user.you ? youLabel : opLabel}
              </span>
            )}
          </li>
        ))}
      </ul>
      {away.length > 0 && (
        <div className="mt-auto flex flex-col gap-1.5 border-t border-border-1 pt-3 text-[11px] text-(--text-subtle)">
          {awayLabel && <span className={EYEBROW}>{awayLabel}</span>}
          <span>{away.map(u => u.nick).join(', ')}</span>
        </div>
      )}
    </div>
  );
};
ChatUsers.displayName = 'Chat.Users';
