// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Chip } from '../core/Chip';
import { cn } from '../utils/cn';

/** @beta Prop shape may change before release. */
export type ChatPresence = 'online' | 'away';

/** @beta Prop shape may change before release. */
export interface ChatPresenceDotProps {
  presence: ChatPresence;
  /** Pulse — for a connection that is live right now, like the sidebar's "online". */
  live?: boolean;
  /** Text for screen readers, e.g. "online". Leave it out where the presence is written next to the dot. */
  label?: string;
  className?: string;
}

/**
 * Chat.PresenceDot — online is a filled dot in the success colour, away a
 * ring in the subtle text colour, so the two differ in shape as well as
 * colour.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatPresenceDot: React.FC<ChatPresenceDotProps> = ({
  presence,
  live = false,
  label,
  className,
}) => (
  <span
    data-presence={presence}
    className={cn(
      'inline-flex flex-none',
      presence === 'online' ? 'text-success' : 'text-(--text-subtle)',
      className,
    )}
  >
    <Chip.Dot
      variant={presence === 'away' ? 'outline' : 'solid'}
      pulse={live}
      className="size-[7px] opacity-100"
    />
    {label && <span className="sr-only">{label}</span>}
  </span>
);
ChatPresenceDot.displayName = 'Chat.PresenceDot';
