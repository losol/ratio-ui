// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

export interface ThreeColumnLayoutProps {
  /** Left column content (e.g. navigation, filters) */
  left: React.ReactNode;
  /** Right column content (e.g. table of contents, metadata) */
  right?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /**
   * Id of the `<main>` element, the default target of `SkipLink`. Pass
   * `null` to omit it, e.g. when another element on the page owns `main`.
   */
  mainId?: string | null;
  className?: string;
}

/**
 * Three-column layout with sticky side columns.
 *
 * On large screens: left (16rem) | content (flex) | right (14rem).
 * On smaller screens the side columns are hidden and only
 * the main content is shown.
 *
 * The `<main>` element gets `id="main"` (see `mainId`), so a `SkipLink`
 * with its default `href` works without extra wiring.
 */
export function ThreeColumnLayout({ left, right, children, mainId = 'main', className = '' }: Readonly<ThreeColumnLayoutProps>) {
  return (
    <div className={`mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="lg:grid lg:grid-cols-[16rem_1fr_14rem] lg:gap-8">
        {/* Left column */}
        <aside
          aria-label="Primary sidebar"
          className="hidden lg:block lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:py-8 lg:pr-4"
        >
          {left}
        </aside>

        {/* Main content */}
        <main id={mainId ?? undefined} className="min-w-0 py-8">
          {children}
        </main>

        {/* Right column */}
        {right && (
          <aside
            aria-label="Secondary sidebar"
            className="hidden lg:block lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:py-8 lg:pl-4"
          >
            {right}
          </aside>
        )}
      </div>
    </div>
  );
}
