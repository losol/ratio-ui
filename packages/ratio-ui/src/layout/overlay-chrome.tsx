// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { ReactNode } from 'react';

import { ActionButton } from '../core/ActionButton';
import { X } from '../icons';
import { cn } from '../utils/cn';

// Shared chrome for the floating-layer family (Drawer, Dialog): the same
// close button and eyebrow whichever way the panel arrives, so the two
// components can't drift apart. Internal — not part of the public API.

export const OverlayCloseButton = ({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) => (
  <ActionButton
    round
    variant="ghost"
    size="lg"
    onPress={onPress}
    className="-mt-1 -mr-1 h-11 min-w-11 border-border-1"
    ariaLabel={label}
  >
    <X size={20} />
  </ActionButton>
);

/** Small uppercase context line above a panel heading — "Participant", "Step 2 of 3". */
export const OverlayEyebrow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn('text-[11px] font-semibold tracking-[0.08em] text-(--accent) uppercase', className)}
  >
    {children}
  </span>
);
