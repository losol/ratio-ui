// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Pressable, View } from 'react-native';
import type { ChatReaction } from '@eventuras/ratio-ui-core/chat';
import { useTheme } from '../RatioProvider';
import { Text } from '../Text';

/** @beta Prop shape may change before release. */
export interface ChatReactionsProps {
  reactions: ChatReaction[];
  /** Called with the emoji whose reaction you add or remove. Without it the reactions are read-only. */
  onToggle?: (emoji: string) => void;
  /** Name of the row. @default 'Reactions' */
  'aria-label'?: string;
  /** Name of one reaction, for screen readers. @default (emoji, count) => `${emoji} ${count}` */
  reactionLabel?: (reaction: ChatReaction) => string;
}

/**
 * The emoji tally under a message. Your own reactions are tinted; with
 * `onToggle` each one is a toggle that adds or takes back yours. Controlled,
 * like the web's: it reports the emoji and waits for new `reactions`.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatReactions: React.FC<ChatReactionsProps> = ({
  reactions,
  onToggle,
  'aria-label': ariaLabel = 'Reactions',
  reactionLabel = ({ emoji, count }) => `${emoji} ${count}`,
}) => {
  const theme = useTheme();
  return (
    <View role="group" aria-label={ariaLabel} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {reactions.map(reaction => {
        const chip = {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderWidth: 1,
          borderRadius: theme.radius.pill,
          borderColor: reaction.me ? theme.colors.chatReactionMeBorder : theme.colors.border1,
          backgroundColor: reaction.me ? theme.colors.chatReactionMeBg : theme.colors.card,
        };
        const label = (
          <Text size="xs" weight="semibold">
            {reaction.emoji} {reaction.count}
          </Text>
        );
        return onToggle ? (
          <Pressable
            key={reaction.emoji}
            role="button"
            aria-label={reactionLabel(reaction)}
            aria-pressed={!!reaction.me}
            onPress={() => onToggle(reaction.emoji)}
            style={({ pressed }) => [chip, pressed && { opacity: 0.7 }]}
          >
            {label}
          </Pressable>
        ) : (
          <View key={reaction.emoji} aria-label={reactionLabel(reaction)} style={chip}>
            {label}
          </View>
        );
      })}
    </View>
  );
};
