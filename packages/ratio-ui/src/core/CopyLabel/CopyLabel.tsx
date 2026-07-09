// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import { cn } from '../../utils/cn';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { CopyStateIcon } from '../CopyStateIcon';
import { Text } from '../Text';

export type CopyLabelVariant = 'boxed' | 'inline';

export interface CopyLabelProps {
  /** The label text displayed above or beside the value */
  label: string;
  /** The value to display and copy to clipboard */
  value: string;
  /** Visual variant: boxed (default) shows value in a bordered container, inline shows a compact side-by-side layout */
  variant?: CopyLabelVariant;
  /** Use monospace font for the value (ideal for API keys, codes, etc.) */
  mono?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Callback fired when value is successfully copied */
  onCopy?: (value: string) => void;
}

// Token-driven focus ring, matching ActionButton / ToggleButtonGroup.
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)';

/**
 * A label-value pair with one-tap copy-to-clipboard functionality.
 * Click anywhere on the value or the copy button to copy.
 *
 * **Variants:**
 * - `boxed` (default) — Value displayed in a bordered box with visual feedback
 * - `inline` — Compact side-by-side layout without a box
 *
 * @example
 * ```tsx
 * <CopyLabel label="API key" value="demo_api_key_abc123" mono />
 * <CopyLabel label="Email" value="user@example.com" variant="inline" />
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const CopyLabel: React.FC<CopyLabelProps> = ({
  label,
  value,
  variant = 'boxed',
  mono = false,
  className,
  onCopy,
}) => {
  const { copied, copy } = useCopyToClipboard({ onCopy });

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-baseline gap-3.5', className)}>
        <Text
          as="span"
          size="xs"
          weight="semibold"
          variant="muted"
          className="shrink-0 min-w-30 tracking-wide"
        >
          {label}
        </Text>
        <button
          type="button"
          onClick={() => copy(value)}
          aria-label={`Copy ${label} to clipboard`}
          title="Copy to clipboard"
          className={cn(
            'inline-flex items-center gap-2 min-w-0',
            '-mx-2 -my-1 px-2 py-1',
            'bg-transparent border-none rounded',
            'cursor-pointer font-[inherit] text-left',
            'transition-colors duration-150',
            'hover:bg-card-hover',
            FOCUS_RING
          )}
        >
          <span
            className={cn(
              'text-sm text-(--text)',
              'overflow-hidden text-ellipsis whitespace-nowrap',
              mono && 'font-mono'
            )}
          >
            {value}
          </span>
          <span className={cn('flex items-center shrink-0', copied ? 'opacity-100' : 'opacity-55')}>
            <CopyStateIcon copied={copied} />
          </span>
          {copied && (
            <Text as="span" size="xs" weight="semibold" color="primary" className="shrink-0">
              Copied
            </Text>
          )}
        </button>
      </div>
    );
  }

  // Boxed variant (default)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Text as="span" size="xs" weight="semibold" variant="muted" className="tracking-wide">
        {label}
      </Text>
      <button
        type="button"
        onClick={() => copy(value)}
        aria-label={`Copy ${label} to clipboard`}
        title="Copy to clipboard"
        className={cn(
          'flex items-center gap-3 w-full',
          'px-3.5 py-3 box-border',
          'bg-card border-2 border-solid rounded',
          'cursor-pointer font-[inherit] text-left',
          'transition-[border-color,background] duration-200',
          copied ? 'border-primary bg-primary-50' : 'border-border-1',
          !copied && 'hover:border-border-2 hover:bg-card-hover',
          FOCUS_RING
        )}
      >
        <span
          className={cn(
            'flex-1 min-w-0',
            'overflow-hidden text-ellipsis whitespace-nowrap text-left',
            'text-sm text-(--text)',
            mono && 'font-mono'
          )}
        >
          {value}
        </span>
        <span className="flex items-center shrink-0">
          <CopyStateIcon copied={copied} />
        </span>
      </button>
    </div>
  );
};

CopyLabel.displayName = 'CopyLabel';
