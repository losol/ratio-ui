// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { BellOff, Users } from '../icons';
import { NavTree, type NavTreeProps } from '../core/NavTree';
import { ChatPresenceDot, type ChatPresence } from './ChatPresenceDot';
import { ChatUnreadBadge } from './ChatUnreadBadge';

/** @beta Prop shape may change before release. */
export type ChatRoomKind = 'channel' | 'group' | 'dm';

/** @beta Prop shape may change before release. */
export interface ChatRoom {
  id: string;
  kind: ChatRoomKind;
  /** Bare name — the `#` of a channel is drawn, not typed. */
  name: string;
  /** Unread messages. Bolds the row and shows the count. */
  unread?: number;
  /** You were mentioned. Bolds the row; shows `@` when nothing is unread. */
  mention?: boolean;
  /** Dims the row and shows the bell. Notifications are the caller's business. */
  muted?: boolean;
  /** Member count, shown when the row has nothing louder to say. */
  members?: number;
  /** For a `dm`: the other person's presence. @default 'online' */
  presence?: ChatPresence;
  /** Give a room a URL and the row becomes a link. Pair with `currentPath`. */
  href?: string;
}

/** @beta Prop shape may change before release. */
export interface ChatChannelListSection {
  /** Eyebrow above the rooms, e.g. "Channels". */
  label?: string;
  rooms: ChatRoom[];
}

/** Screen-reader text for what the row's badges say. Each entry falls back to English. */
export interface ChatChannelListLabels {
  /** @default (n) => `${n} unread` */
  unread?: (count: number) => string;
  /** @default 'Mentioned' */
  mention?: string;
  /** @default 'Muted' */
  muted?: string;
  /** @default (n) => `${n} members` */
  members?: (count: number) => string;
  /** @default (presence) => presence */
  presence?: (presence: ChatPresence) => string;
}

const DEFAULT_LABELS: Required<ChatChannelListLabels> = {
  unread: (n) => `${n} unread`,
  mention: 'Mentioned',
  muted: 'Muted',
  members: (n) => `${n} members`,
  presence: (presence) => presence,
};

// Per field, so an explicit `undefined` still falls back to English.
const withDefaults = (labels?: ChatChannelListLabels): Required<ChatChannelListLabels> => ({
  unread: labels?.unread ?? DEFAULT_LABELS.unread,
  mention: labels?.mention ?? DEFAULT_LABELS.mention,
  muted: labels?.muted ?? DEFAULT_LABELS.muted,
  members: labels?.members ?? DEFAULT_LABELS.members,
  presence: labels?.presence ?? DEFAULT_LABELS.presence,
});

/** @beta Prop shape may change before release. */
export interface ChatChannelListProps {
  sections: ChatChannelListSection[];
  /** The open room, when rooms are buttons. */
  activeId?: string | null;
  /** Called with the room id. Omit for rooms that are links. */
  onSelect?: (id: string) => void;
  /** Current URL, for rooms that carry `href`. */
  currentPath?: string;
  /** Routing link component for `href` rooms, e.g. Next's `Link`. */
  LinkComponent?: NavTreeProps['LinkComponent'];
  labels?: ChatChannelListLabels;
  /** Accessible name for the navigation, e.g. "Rooms". */
  'aria-label'?: string;
  className?: string;
}

const GLYPH = 'w-2.5 text-center font-mono text-[13px]';

// The same rule `NavTree` applies before deciding what is current: a trailing
// slash doesn't change the destination. Copied rather than imported, since
// `NavTree` is a client module and a server component would only see a
// reference to the function, not the function itself.
const samePath = (a?: string, b?: string) =>
  !!a && !!b && (a.replace(/\/$/, '') || '/') === (b.replace(/\/$/, '') || '/');

/**
 * Chat.ChannelList — the room list: channels, private groups and direct
 * messages, grouped under eyebrow labels. A thin mapping onto `NavTree`, so
 * rooms can be buttons (`activeId` + `onSelect`) or links (`href` +
 * `currentPath`), and a room with unread messages reads as bold while a
 * muted one recedes.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatChannelList: React.FC<ChatChannelListProps> = ({
  sections,
  activeId,
  onSelect,
  currentPath,
  LinkComponent,
  labels,
  'aria-label': ariaLabel,
  className,
}) => (
  <NavTree
    aria-label={ariaLabel}
    className={className}
    selectedKey={activeId}
    onAction={onSelect}
    currentPath={currentPath}
    LinkComponent={LinkComponent}
    groups={sections.map(section => ({
      label: section.label,
      items: section.rooms.map(room => {
        const active = room.href ? samePath(room.href, currentPath) : room.id === activeId;
        return {
          id: room.id,
          title: room.name,
          href: room.href,
          icon: roomGlyph(room, active),
          trailing: roomTrailing(room, withDefaults(labels)),
          // A room you have not read shouts; a muted one whispers. Both at
          // once keeps the weight and loses the colour, per `NavTree`.
          emphasized: !!room.unread || !!room.mention,
          muted: room.muted,
        };
      }),
    }))}
  />
);
ChatChannelList.displayName = 'Chat.ChannelList';

function roomGlyph(room: ChatRoom, active: boolean): React.ReactNode {
  if (room.kind === 'dm') return <ChatPresenceDot presence={room.presence ?? 'online'} />;
  if (room.kind === 'group') return <Users size={14} className="text-(--text-subtle)" />;
  return (
    <span className={active ? `${GLYPH} text-(--primary)` : `${GLYPH} text-(--text-subtle)`}>#</span>
  );
}

/** One thing at a time, loudest first: unread, then a mention, then mute, then the member count. */
function roomTrailing(room: ChatRoom, labels: Required<ChatChannelListLabels>): React.ReactNode {
  const presence =
    room.kind === 'dm' ? (
      <span className="sr-only">{labels.presence(room.presence ?? 'online')}</span>
    ) : null;

  if (room.unread || room.mention) {
    return (
      <>
        {presence}
        <ChatUnreadBadge
          count={room.unread}
          mention={room.mention}
          // The badge shows one thing; the label says both.
          label={
            room.unread
              ? [labels.unread(room.unread), room.mention && labels.mention].filter(Boolean).join(', ')
              : labels.mention
          }
        />
      </>
    );
  }

  if (room.muted) {
    return (
      <>
        {presence}
        <BellOff size={13} aria-hidden className="text-(--text-subtle)" />
        <span className="sr-only">{labels.muted}</span>
      </>
    );
  }

  if (room.members != null) {
    return (
      <>
        {presence}
        <span aria-hidden className="text-[11px] text-(--text-subtle)">
          {room.members}
        </span>
        <span className="sr-only">{labels.members(room.members)}</span>
      </>
    );
  }

  return presence;
}
