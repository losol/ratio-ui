'use client';

import React from 'react';
import { ActionButton, type ActionButtonSize } from '../ActionButton';
import { cn } from '../../utils/cn';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { CopyStateIcon } from '../CopyStateIcon';

export interface CopyButtonProps {
  /** Text copied to the clipboard when pressed. */
  value: string;
  /** Show a "Copy"/"Copied" text label beside the icon. Default false (icon-only). */
  withLabel?: boolean;
  /** Icon size in px. Defaults to 16. */
  iconSize?: number;
  /** Frame size, forwarded to ActionButton. Defaults to `md`. */
  size?: ActionButtonSize;
  /** Accessible name + tooltip. Defaults to "Copy to clipboard". */
  ariaLabel?: string;
  /** Fired with the value after a successful copy. */
  onCopy?: (value: string) => void;
  className?: string;
  testId?: string;
}

/**
 * Standalone copy-to-clipboard affordance: swaps its icon to a check (with a
 * teal "pop") and optionally shows "Copied" feedback.
 *
 * Composes `ActionButton`, so it inherits the shared chrome — focus ring,
 * press `active:scale`, sizes, hover, and the re-skinnable `--action-button-*`
 * tokens — and stays consistent with other action buttons (e.g. CodeBlock's
 * copy button). The success animation lives in `CopyStateIcon`; the clipboard
 * behaviour in `useCopyToClipboard`.
 *
 * Its `'use client'` boundary is the reason it stays a separate component:
 * server components (e.g. `forms/TextField` via `showCopyToClipboard`) can
 * embed a copy affordance without themselves becoming client components.
 *
 * Renders ghost (border dropped) so it reads as a quiet affordance in trailing
 * slots.
 *
 * @example
 * ```tsx
 * <CopyButton value="demo_api_key_abc123" ariaLabel="Copy API key" />
 * <CopyButton value={url} withLabel />
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  withLabel = false,
  iconSize = 16,
  size = 'md',
  ariaLabel = 'Copy to clipboard',
  onCopy,
  className,
  testId,
}) => {
  const { copied, copy } = useCopyToClipboard({ onCopy });

  return (
    <ActionButton
      ariaLabel={ariaLabel}
      title={ariaLabel}
      size={size}
      onClick={() => copy(value)}
      data-copied={copied || undefined}
      testId={testId}
      // Ghost: drop ActionButton's default border so it reads as a quiet
      // affordance (in inputs, toolbars, beside values). Chrome stays.
      className={cn('[--action-button-border:transparent]', className)}
    >
      <CopyStateIcon copied={copied} size={iconSize} />
      {withLabel && (
        <span className={cn('text-xs font-semibold', copied && 'text-primary')}>
          {copied ? 'Copied' : 'Copy'}
        </span>
      )}
    </ActionButton>
  );
};

CopyButton.displayName = 'CopyButton';
