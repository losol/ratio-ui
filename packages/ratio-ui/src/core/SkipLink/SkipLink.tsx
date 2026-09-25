// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import { cn } from '../../utils/cn';
import './SkipLink.css';

export interface SkipLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Fragment of the element to skip to. Defaults to `#main`. */
  href?: `#${string}`;
  /** Link text. Defaults to "Skip to main content". */
  children?: React.ReactNode;
  testId?: string;
}

/**
 * Skip link for keyboard and screen reader users (WCAG 2.4.1 Bypass Blocks).
 *
 * Hidden until it receives keyboard focus, then slides in at the top of the
 * viewport. Activating it moves focus (and scroll) to the target, so the
 * next Tab continues from the main content instead of the navigation. This
 * is done in script rather than by fragment navigation, which doesn't
 * reliably move focus and would add `#main` to the URL; a non-focusable
 * target is made focusable (`tabindex="-1"`) when needed. Without
 * JavaScript the link still works as a plain fragment link.
 *
 * Render it as the first focusable element on the page, before the navbar,
 * and give the main content a matching id.
 *
 * Styled by the `--skip-link-*` tokens (see tokens/skip-link.css).
 *
 * @example
 * ```tsx
 * <body>
 *   <SkipLink />
 *   <Navbar>…</Navbar>
 *   <main id="main">…</main>
 * </body>
 * ```
 *
 * @example
 * // Localized text and a custom target
 * ```tsx
 * <SkipLink href="#innhold">Hopp til hovedinnhold</SkipLink>
 * ```
 */
export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    { href = '#main', children = 'Skip to main content', className, onClick, testId, ...props },
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      let id = href.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        // Malformed escape sequence: look the id up as written.
      }
      const target = document.getElementById(id);
      if (!target) return;

      // Only make non-focusable targets (e.g. `<main>`) focusable. A native
      // control keeps its place in the tab order and its focus ring.
      if (!target.hasAttribute('tabindex') && target.tabIndex < 0) {
        target.setAttribute('tabindex', '-1');
        target.setAttribute('data-skip-link-target', '');
      }
      // Handle the jump ourselves rather than via fragment navigation: no
      // `#main` in the URL or history, and no clash with hash-based routers.
      event.preventDefault();
      target.focus();
    };

    return (
      <a
        ref={ref}
        href={href}
        className={cn('ratio-skip-link', className)}
        onClick={handleClick}
        data-testid={testId}
        {...props}
      >
        {children}
      </a>
    );
  },
);

SkipLink.displayName = 'SkipLink';
