// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../utils/cn';
import type { ChatTextSegment } from './chatTextSegments';

type ChatTextProps = {
  segments: ChatTextSegment[];
  /** Screen-reader note on each link. */
  opensInNewTab: string;
};

/**
 * Message text with its mentions highlighted and its links clickable.
 * Shared by `Chat.Log` and `Chat.MessageCard`, so the two never drift.
 */
export const ChatText: React.FC<ChatTextProps> = ({ segments, opensInNewTab }) =>
  segments.map((segment, i) => {
    if (segment.kind === 'mention') {
      return (
        <span key={i} className="font-semibold text-(--primary)">
          {segment.value}
        </span>
      );
    }
    if (segment.kind === 'link') {
      return (
        <a
          key={i}
          href={segment.value}
          target="_blank"
          rel="noopener noreferrer ugc"
          // Breaks anywhere, so a long URL never widens the log.
          className={cn(
            'wrap-anywhere rounded-xs text-(--primary) underline decoration-1 underline-offset-2',
            'hover:decoration-2 focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
          )}
        >
          {segment.value}
          <span className="sr-only"> ({opensInNewTab})</span>
        </a>
      );
    }
    return segment.value;
  });
ChatText.displayName = 'Chat.Text';
