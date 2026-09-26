// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useId } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface TableOfContentsProps {
  headings: TocHeading[];
  /**
   * Px of sticky chrome above the content (a navbar). A heading is current
   * once it has scrolled up to that line. @default 0
   */
  offset?: number;
  className?: string;
  labels?: TableOfContentsLabels;
}

/** Built-in text of `TableOfContents`. Each entry falls back to English. */
export interface TableOfContentsLabels {
  /** Visible heading, which also names the navigation. @default 'On this page' */
  title?: string;
}

/**
 * Sticky table-of-contents sidebar with scroll-spy.
 *
 * Highlights the heading whose section is being read — the last one that
 * has scrolled past the top of the viewport (or past `offset`), via
 * `useActiveSection` — and marks it `aria-current="location"`.
 */
export function TableOfContents({ headings, offset = 0, className = '', labels }: Readonly<TableOfContentsProps>) {
  const { title = 'On this page' } = labels ?? {};
  const titleId = useId();
  const activeId = useActiveSection(
    headings.map((h) => h.id),
    { offset },
  );

  if (headings.length === 0) return null;

  return (
    <nav aria-labelledby={titleId} className={`text-sm ${className}`}>
      <p id={titleId} className="mb-3 font-medium text-(--text)">{title}</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? 'location' : undefined}
              className={`block transition-colors ${heading.level === 3 ? 'pl-3' : ''}
                ${activeId === heading.id
                  ? 'font-medium text-(--primary)'
                  : 'text-(--text-subtle) hover:text-(--text)'
                }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
