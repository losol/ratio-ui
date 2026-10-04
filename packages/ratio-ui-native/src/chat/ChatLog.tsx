// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useCallback, useMemo } from 'react';
import { FlatList, Linking, View, type FlatListProps } from 'react-native';
import {
  hasPreviewContent,
  mentionsNick,
  sameNick,
  segmentChatText,
  type ChatLogMessage,
  type ChatRole,
} from '@eventuras/ratio-ui-core/chat';
import { useTheme } from '../RatioProvider';
import { Text } from '../Text';
import { ChatLinkPreviewCard } from './ChatLinkPreviewCard';
import { ChatReactions } from './ChatReactions';
import { ChatText } from './ChatText';

/** Built-in text of `ChatLog`. Each entry falls back to English. @beta */
export interface ChatLogLabels {
  /** Name of each message's reaction row. @default 'Reactions' */
  reactions?: string;
  /** Read after the author and time of a message that mentions you. @default 'mentions you' */
  mentionsYou?: string;
  /** Spoken name of the `@` role. @default 'op' */
  op?: string;
  /** Spoken name of the `+` role. @default 'voice' */
  voice?: string;
}

/** @beta Prop shape may change before release. */
export interface ChatLogProps
  extends Omit<FlatListProps<ChatLogMessage>, 'data' | 'renderItem' | 'keyExtractor'> {
  /** Oldest first, as the web's `Chat.Log` takes them. */
  messages: ChatLogMessage[];
  /** Your own nick: tinted in the log, and messages that mention it get the band. */
  me?: string;
  /** Called with the message and the emoji when you tap a reaction. Without it reactions are read-only. */
  onToggleReaction?: (messageId: string, emoji: string) => void;
  /** Opens a link or a preview the reader taps. @default Linking.openURL */
  onOpenLink?: (url: string) => void;
  /** Built-in text. Each entry falls back to English. */
  labels?: ChatLogLabels;
}

const ROLE_GLYPH: Record<ChatRole, string> = { op: '@', voice: '+' };

const openUrl = (url: string) => {
  void Linking.openURL(url);
};

/**
 * ChatLog — the channel log for React Native: one message per row, the nick
 * and time on a line above the text, as the web's `Chat.Log` lays out a
 * narrow log. Links and mentions are read by `@eventuras/ratio-ui-core/chat`,
 * so the app and the web agree on them. Joins and topic changes are `event`
 * rows, `/me` is an `action`, and a `divider` marks a day or "new messages".
 *
 * A `FlatList` underneath, and like the web's log it does not scroll
 * itself: the ref is the list, so the caller decides when to follow new
 * messages. Other `FlatList` props pass through.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatLog = React.forwardRef<FlatList<ChatLogMessage>, ChatLogProps>(function ChatLog(
  { messages, me, onToggleReaction, onOpenLink = openUrl, labels, contentContainerStyle, ...listProps },
  ref,
) {
  const theme = useTheme();
  const { reactions, mentionsYou, op, voice } = labels ?? {};
  const rowLabels = useMemo<Required<ChatLogLabels>>(
    () => ({
      reactions: reactions ?? 'Reactions',
      mentionsYou: mentionsYou ?? 'mentions you',
      op: op ?? 'op',
      voice: voice ?? 'voice',
    }),
    [reactions, mentionsYou, op, voice],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatLogMessage }) => (
      <ChatLogRow
        message={item}
        me={me}
        onToggleReaction={onToggleReaction}
        onOpenLink={onOpenLink}
        labels={rowLabels}
      />
    ),
    [me, onToggleReaction, onOpenLink, rowLabels],
  );

  return (
    <FlatList
      ref={ref}
      data={messages}
      keyExtractor={message => message.id}
      renderItem={renderItem}
      contentContainerStyle={[{ paddingVertical: theme.space.xs, gap: 2 }, contentContainerStyle]}
      style={{ backgroundColor: theme.colors.surface }}
      {...listProps}
    />
  );
});
ChatLog.displayName = 'ChatLog';

interface ChatLogRowProps {
  message: ChatLogMessage;
  me?: string;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onOpenLink: (url: string) => void;
  labels: Required<ChatLogLabels>;
}

const PX = 16;

const ChatLogRow: React.FC<ChatLogRowProps> = ({ message, me, onToggleReaction, onOpenLink, labels }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { id, type = 'msg', time, nick, role, text, preview, reactions } = message;

  if (type === 'divider') {
    const rule = { flex: 1, height: 1, backgroundColor: colors.border2, opacity: 0.5 };
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: PX, marginVertical: 8 }}>
        <View style={rule} />
        <Text size="xs" tone="subtle" weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
          {text}
        </Text>
        <View style={rule} />
      </View>
    );
  }

  // Events and actions are one line of narration, not someone speaking.
  if (type === 'event' || type === 'action') {
    return (
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: PX, paddingVertical: 2 }}>
        <Text size="xs" family="mono" tone="subtle" style={{ lineHeight: theme.fontSize.sm * 1.5 }}>
          {time}
        </Text>
        <Text size="sm" tone={type === 'event' ? 'subtle' : 'muted'} style={{ flex: 1, fontStyle: 'italic' }}>
          {type === 'event' ? (
            `— ${text}`
          ) : (
            <>
              {['*', nick].filter(Boolean).join(' ')}{' '}
              <ChatText segments={segmentChatText(text, { mentions: false })} onOpenLink={onOpenLink} />
            </>
          )}
        </Text>
      </View>
    );
  }

  const segments = segmentChatText(text);
  const mentionsMe = mentionsNick(segments, me);
  const isMe = sameNick(nick, me);
  const nickColor = isMe
    ? colors.chatNickVoice
    : role === 'op'
      ? colors.chatNickOp
      : role === 'voice'
        ? colors.chatNickVoice
        : colors.chatNick;
  // The glyph would be read as "at" or "plus", so the header speaks the role's name.
  const spoken = [
    role ? `${nick} (${labels[role]})` : nick,
    time,
    mentionsMe ? labels.mentionsYou : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View
      style={{
        gap: 4,
        paddingVertical: 6,
        paddingRight: PX,
        // The band's 3px edge comes out of the padding, so every row aligns.
        paddingLeft: PX - 3,
        borderLeftWidth: 3,
        borderLeftColor: mentionsMe ? colors.accent : 'transparent',
        backgroundColor: mentionsMe ? colors.chatMentionBg : 'transparent',
      }}
    >
      <View accessible aria-label={spoken} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text weight="semibold" numberOfLines={1} style={{ color: nickColor, flexShrink: 1 }}>
          {role ? ROLE_GLYPH[role] : ''}
          {nick}
        </Text>
        <Text size="xs" family="mono" tone="subtle">
          {time}
        </Text>
      </View>
      <Text>
        <ChatText segments={segments} onOpenLink={onOpenLink} />
      </Text>
      {preview && hasPreviewContent(preview) && <ChatLinkPreviewCard preview={preview} onOpenLink={onOpenLink} />}
      {reactions && reactions.length > 0 && (
        <ChatReactions
          reactions={reactions}
          onToggle={onToggleReaction ? emoji => onToggleReaction(id, emoji) : undefined}
          aria-label={labels.reactions}
        />
      )}
    </View>
  );
};
