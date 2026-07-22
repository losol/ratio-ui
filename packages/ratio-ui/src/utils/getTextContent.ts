// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { ReactNode } from 'react';

/**
 * Flatten a React node tree to its plain text.
 *
 * Useful when a value derived from rendered children is needed — e.g. slugging
 * a heading whose children are a mix of strings and inline elements
 * (`<Heading id={slugify(getTextContent(children))}>`). Strings and numbers are
 * kept, arrays are joined, and elements are descended into via their children;
 * anything else contributes nothing.
 */
export function getTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return getTextContent((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}
