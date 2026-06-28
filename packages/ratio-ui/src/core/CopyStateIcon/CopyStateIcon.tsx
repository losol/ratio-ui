import React from 'react';
import { Check, Copy } from '../../icons';

export interface CopyStateIconProps {
  /** Swap to the success check when true, otherwise show the copy glyph. */
  copied: boolean;
  /** Icon size in px. Defaults to 18. */
  size?: number;
}

/**
 * The Copy → Check icon swap with a teal "pop" on success. Presentational
 * only — pair it with `useCopyToClipboard`. Used by `CopyButton` (standalone
 * affordance) and `CopyLabel` (whole-row button, which can't nest a button).
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const CopyStateIcon: React.FC<CopyStateIconProps> = ({ copied, size = 18 }) =>
  copied ? (
    <Check
      size={size}
      strokeWidth={2.4}
      className="text-primary animate-pop"
    />
  ) : (
    <Copy size={size} strokeWidth={2} className="text-text-muted" />
  );

CopyStateIcon.displayName = 'CopyStateIcon';
