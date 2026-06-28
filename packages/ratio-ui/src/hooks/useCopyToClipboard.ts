import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardOptions {
  /** Milliseconds the `copied` flag stays true after a successful copy. */
  resetDelay?: number;
  /** Fired with the copied text after a successful copy. */
  onCopy?: (value: string) => void;
}

export interface CopyToClipboard {
  /** True for `resetDelay` ms after the last successful copy. */
  copied: boolean;
  /** Copy `value` to the clipboard, flipping `copied` on success. */
  copy: (value: string) => void;
}

/** Default lifetime of the post-copy "Copied" feedback. */
const DEFAULT_RESET_DELAY = 3000;

/**
 * Copy-to-clipboard with transient "copied" feedback. Prefers the async
 * Clipboard API and falls back to a hidden-textarea + `execCommand` when it
 * is unavailable or blocked (older browsers, insecure contexts). The `copied`
 * flag auto-resets after `resetDelay`, and any pending reset is cleared on
 * unmount.
 *
 * Shared by `CopyLabel`, `CodeBlock`, and any other copy affordance so the
 * fallback path and reset timing live in one place.
 *
 * @beta This hook is experimental — its API may change before release.
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}): CopyToClipboard {
  const { resetDelay = DEFAULT_RESET_DELAY, onCopy } = options;
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Track the latest onCopy without re-creating `copy` on every render.
  const onCopyRef = useRef(onCopy);
  useEffect(() => {
    onCopyRef.current = onCopy;
  }, [onCopy]);

  // Clear a pending reset if the consumer unmounts first.
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = useCallback(
    (value: string) => {
      const flagCopied = () => {
        setCopied(true);
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), resetDelay);
        onCopyRef.current?.(value);
      };

      // Legacy path for contexts where the async Clipboard API is missing or
      // rejects (insecure origin, permissions). Returns whether it succeeded —
      // `execCommand` reports failure via its return value, and the textarea is
      // always removed (finally) even if selection/copy throws.
      const copyViaTextarea = () => {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        try {
          textarea.select();
          return document.execCommand('copy');
        } catch {
          return false;
        } finally {
          textarea.remove();
        }
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(value)
          .then(flagCopied)
          .catch(() => {
            if (copyViaTextarea()) flagCopied();
          });
      } else if (copyViaTextarea()) {
        flagCopied();
      }
    },
    [resetDelay],
  );

  return { copied, copy };
}
