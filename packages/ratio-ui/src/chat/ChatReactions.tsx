// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import { ToggleButtonGroup } from '../core/ToggleButtonGroup';
import { cn } from '../utils/cn';

/** @beta Prop shape may change before release. */
export interface ChatReaction {
  emoji: string;
  count: number;
  /** You are among the people who reacted. */
  me?: boolean;
}

/** @beta Prop shape may change before release. */
export interface ChatReactionsProps {
  reactions: ChatReaction[];
  /** Called with the emoji whose reaction you add or remove. The caller updates `reactions`. */
  onToggle?: (emoji: string) => void;
  /** Accessible name for the row. @default 'Reactions' */
  'aria-label'?: string;
  className?: string;
}


/**
 * Chat.Reactions — the emoji tally under a message. Each reaction is a tint
 * toggle, on when you have reacted; the row is one tab stop, and the arrow
 * keys move between reactions.
 *
 * Controlled: it reports the emoji and waits for new `reactions`, so counts
 * never drift from what the server holds.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatReactions: React.FC<ChatReactionsProps> = ({
  reactions,
  onToggle,
  'aria-label': ariaLabel = 'Reactions',
  className,
}) => {
  return (
    <ToggleButtonGroup
      variant="tints"
      size="sm"
      selectionMode="multiple"
      aria-label={ariaLabel}
      selectedKeys={reactions.filter(r => r.me).map(r => r.emoji)}
      // The group reports the whole selection; the reaction that changed is the
      // one whose membership no longer matches `me`.
      onSelectionChange={keys => {
        const toggled = reactions.find(r => keys.has(r.emoji) !== !!r.me);
        if (toggled) onToggle?.(toggled.emoji);
      }}
      options={reactions.map(r => ({ value: r.emoji, label: `${r.emoji} ${r.count}` }))}
      // Chat themes re-skin reactions through their own tokens.
      className={cn(
        '[--toggle-tint-bg:var(--chat-reaction-me-bg)] [--toggle-tint-border:var(--chat-reaction-me-border)]',
        className,
      )}
    />
  );
};
ChatReactions.displayName = 'Chat.Reactions';
