// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { CSSProperties } from 'react';

/**
 * Build an inline style for a full-cover background image,
 * optionally with a dark gradient overlay.
 */
export function buildCoverImageStyle(
  imageUrl?: string,
  existingStyle?: CSSProperties,
  overlay: boolean = true,
): CSSProperties | undefined {
  if (!imageUrl) return existingStyle;

  const imageValue = overlay
    ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url(${imageUrl})`
    : `url(${imageUrl})`;

  return {
    backgroundImage: imageValue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    ...existingStyle,
  };
}
