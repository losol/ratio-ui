// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Toolbar,
} from 'react-aria-components';
import { SmilePlus } from '../icons';
import { cn } from '../utils/cn';

/** @beta Prop shape may change before release. */
export interface ChatReactionBarProps {
  /** One-click reactions, shown in the bar. */
  quick: string[];
  /** The picker behind the add button. Leave it empty to hide the button. */
  more: string[];
  /** Called with the emoji picked. The caller adds or removes the reaction. */
  onReact: (emoji: string) => void;
  /** Name of the bar. */
  label: string;
  /** Name of the add button and the picker. */
  moreLabel: string;
  /** Name of each emoji button. */
  reactWith: (emoji: string) => string;
  className?: string;
}

const POPOVER_SURFACE =
  'border border-border-1 bg-(--chat-popover-bg) shadow-[0_2px_8px_rgb(0_0_0/0.08)]';

const ICON_BUTTON = cn(
  'grid size-7 place-items-center rounded-full leading-none outline-none',
  'transition-[background-color,transform] duration-200 ease-out',
  'data-[hovered]:bg-(--chat-row-hover-bg) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--focus-ring)',
);

/**
 * Chat.ReactionBar — the pill that floats over a message row: a few
 * one-click reactions and a button that opens a picker with more. One tab
 * stop; the arrow keys move between the buttons, Escape closes the picker.
 *
 * `Chat.Log` shows it on hover and keyboard focus when it has
 * `onToggleReaction`; it is exported for custom message rows.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatReactionBar: React.FC<ChatReactionBarProps> = ({
  quick,
  more,
  onReact,
  label,
  moreLabel,
  reactWith,
  className,
}) => {
  // The picker renders in a portal, so the row loses hover and focus while it
  // is open; `data-open` lets the row keep the bar in view meanwhile.
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Toolbar
      aria-label={label}
      data-open={pickerOpen || undefined}
      className={cn('flex items-center gap-px rounded-full p-0.5', POPOVER_SURFACE, className)}
    >
      {quick.map(emoji => (
        <Button
          key={emoji}
          aria-label={reactWith(emoji)}
          onPress={() => onReact(emoji)}
          className={cn(ICON_BUTTON, 'text-[15px] data-[hovered]:scale-115')}
        >
          {emoji}
        </Button>
      ))}
      {more.length > 0 && (
        <>
          {quick.length > 0 && <span aria-hidden className="mx-0.5 h-4 w-px bg-border-1" />}
          <MenuTrigger isOpen={pickerOpen} onOpenChange={setPickerOpen}>
            <Button
              aria-label={moreLabel}
              className={cn(ICON_BUTTON, 'text-(--text-muted) data-[hovered]:text-(--text)')}
            >
              <SmilePlus size={16} aria-hidden />
            </Button>
            <Popover
              placement="bottom end"
              offset={6}
              className={cn('rounded-xl', POPOVER_SURFACE, 'shadow-[0_6px_20px_rgb(0_0_0/0.12)]')}
            >
              <Menu
                aria-label={moreLabel}
                onAction={key => onReact(String(key))}
                className="grid grid-cols-6 gap-0.5 p-1.5 outline-none"
              >
                {more.map(emoji => (
                  <MenuItem
                    key={emoji}
                    id={emoji}
                    textValue={emoji}
                    aria-label={reactWith(emoji)}
                    className={cn(
                      'grid size-8 cursor-pointer place-items-center rounded-lg text-[17px] leading-none outline-none',
                      'data-[hovered]:bg-(--chat-row-hover-bg) data-[focused]:bg-(--chat-row-hover-bg)',
                      'data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--focus-ring)',
                    )}
                  >
                    {emoji}
                  </MenuItem>
                ))}
              </Menu>
            </Popover>
          </MenuTrigger>
        </>
      )}
    </Toolbar>
  );
};
ChatReactionBar.displayName = 'Chat.ReactionBar';
