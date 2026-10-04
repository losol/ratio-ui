// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { previewLabel, type ChatLinkPreview } from '@eventuras/ratio-ui-core/chat';
import { useTheme } from '../RatioProvider';
import { Text } from '../Text';

interface ChatLinkPreviewCardProps {
  preview: ChatLinkPreview;
  onOpenLink: (url: string) => void;
}

// Fixed, so a row is its final height before the image arrives and a late
// load never moves the rows below it.
const THUMB = 64;

/**
 * The card under a message: site name, title, description and a square
 * thumbnail. One pressable target, named by the title.
 */
export const ChatLinkPreviewCard: React.FC<ChatLinkPreviewCardProps> = ({ preview, onOpenLink }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { url, title, description, image } = preview;

  return (
    <Pressable
      role="link"
      aria-label={title ?? description}
      onPress={() => onOpenLink(url)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: pressed ? colors.border2 : colors.border1,
        borderRadius: theme.radius.md,
        backgroundColor: pressed ? colors.cardHover : colors.card,
      })}
    >
      {image && (
        <Image
          source={{ uri: image.src }}
          accessibilityIgnoresInvertColors
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: theme.radius.sm,
            backgroundColor: colors.cardHover,
          }}
          resizeMode="cover"
        />
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 2, justifyContent: 'center' }}>
        <Text
          size="xs"
          tone="subtle"
          weight="semibold"
          numberOfLines={1}
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          {previewLabel(preview)}
        </Text>
        {title && (
          <Text weight="semibold" numberOfLines={2} style={{ lineHeight: theme.fontSize.base * 1.3 }}>
            {title}
          </Text>
        )}
        {description && (
          <Text size="sm" tone="muted" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
