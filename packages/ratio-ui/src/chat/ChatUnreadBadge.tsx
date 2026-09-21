// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Badge } from '../core/Badge';
import { cn } from '../utils/cn';

/** @beta Prop shape may change before release. */
export interface ChatUnreadBadgeProps {
  /** Unread messages; shown when above zero. */
  count?: number;
  /** You were mentioned. Shows `@` when there is no count to show. */
  mention?: boolean;
  /** Text for screen readers in place of the bare number, e.g. "3 unread, mentioned". */
  label?: string;
  className?: string;
}

/**
 * Chat.UnreadBadge — the right slot of a room row. One thing at a time: the
 * unread count on `primary`, or — with nothing unread — an `@` on `accent`
 * for a mention. Renders nothing when there is neither.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatUnreadBadge: React.FC<ChatUnreadBadgeProps> = ({
  count = 0,
  mention = false,
  label,
  className,
}) => {
  if (count <= 0 && !mention) return null;

  return (
    <span className={cn('inline-flex flex-none', className)}>
      <span aria-hidden={label ? true : undefined} className="inline-flex">
        {count > 0 ? (
          <Badge variant="count" tone="primary">
            {count}
          </Badge>
        ) : (
          <Badge variant="count" tone="accent">
            @
          </Badge>
        )}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
};
ChatUnreadBadge.displayName = 'Chat.UnreadBadge';
