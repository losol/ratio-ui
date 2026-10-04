// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Text as RNText } from 'react-native';
import type { ChatTextSegment } from '@eventuras/ratio-ui-core/chat';
import { useTheme } from '../RatioProvider';

interface ChatTextProps {
  segments: ChatTextSegment[];
  /** Opens a link the reader taps. */
  onOpenLink: (url: string) => void;
}

/**
 * Message text with its mentions highlighted and its links tappable — the
 * runs `segmentChatText` finds, so the app and the web agree on them.
 * Nested inside a `Text`, so the runs wrap as one paragraph.
 */
export const ChatText: React.FC<ChatTextProps> = ({ segments, onOpenLink }) => {
  const { colors } = useTheme();
  return segments.map((segment, i) => {
    if (segment.kind === 'mention') {
      return (
        <RNText key={i} style={{ fontWeight: '600', color: colors.primary }}>
          {segment.value}
        </RNText>
      );
    }
    if (segment.kind === 'link') {
      return (
        <RNText
          key={i}
          role="link"
          onPress={() => onOpenLink(segment.value)}
          style={{ color: colors.primary, textDecorationLine: 'underline' }}
        >
          {segment.value}
        </RNText>
      );
    }
    return segment.value;
  });
};
