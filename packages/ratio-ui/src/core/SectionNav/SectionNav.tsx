// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';
import { cn } from '../../utils/cn';

export interface SectionNavItem {
  /** The `id` of the section element — the link goes to `#id`. */
  id: string;
  title: ReactNode;
  /**
   * Leave the target out of the scroll-spy: a plain link that is never
   * highlighted. For targets inside sticky chrome (a registration card in
   * the aside), which would otherwise always sit on the line. @default true
   */
  track?: boolean;
}

export interface SectionNavProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> {
  items: SectionNavItem[];
  /**
   * Sticky offset for the chrome above (the site navbar): px, or any CSS
   * length — `"calc(var(--spacing) * 16)"` under an `h-16` navbar stays
   * exact on the fluid root font size. @default 0
   */
  top?: number | string;
  /** Pin the row while the page scrolls. @default true */
  sticky?: boolean;
  /**
   * Full-width row (app shells) instead of the centered `container` that
   * lines up with `Navbar`.
   */
  fluid?: boolean;
}

/**
 * The second row of a detail page's navigation: a sticky strip of section
 * anchors under the site navbar, with the section being read highlighted
 * (`aria-current="location"`) by `useActiveSection`. The row measures its
 * own bottom edge for the spy — resolved `top` plus height, re-measured on
 * resize — so `top` is all you pass, in whatever unit the navbar is sized.
 *
 * Give targets a `scroll-margin-top` (`--scroll-margin-top` from
 * `global.css`, or `scroll-mt-*`) so anchor jumps land below both rows.
 * Name the landmark: a page with a site navbar has two `<nav>`s, and
 * screen readers list them by name.
 *
 * @example
 * <SectionNav
 *   aria-label="Contents"
 *   top="calc(var(--spacing) * 16)"
 *   items={[
 *     { id: 'programme', title: 'Programme' },
 *     { id: 'venue', title: 'Venue' },
 *     { id: 'register', title: 'Register' },
 *   ]}
 * />
 */
export function SectionNav({
  items,
  top = 0,
  sticky = true,
  fluid = false,
  className,
  ...rest
}: Readonly<SectionNavProps>) {
  const navRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = navRef.current;
    if (!el || !sticky) {
      setOffset(0);
      return;
    }
    const measure = () => {
      // The stuck position: resolved `top` (px, whatever unit was authored)
      // plus the row's own height.
      const stuckTop = parseFloat(getComputedStyle(el).top) || 0;
      setOffset(Math.round(stuckTop + el.offsetHeight));
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [sticky, top]);

  const activeId = useActiveSection(
    items.filter((item) => item.track !== false).map((item) => item.id),
    { offset },
  );

  return (
    <nav
      ref={navRef}
      className={cn(
        'm-0 border-b border-border-1 bg-surface p-0',
        sticky && 'sticky z-40',
        className,
      )}
      style={sticky ? { top } : undefined}
      {...rest}
    >
      <ul
        className={cn(
          'm-0 flex h-12 list-none items-center gap-6 overflow-x-auto p-0',
          fluid ? 'w-full px-4' : 'container mx-auto px-3',
        )}
      >
        {items.map((item) => {
          const current = item.id === activeId;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={current ? 'location' : undefined}
                className={cn(
                  'inline-flex h-12 items-center font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] no-underline',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
                  current ? 'text-(--text)' : 'text-(--text-subtle) hover:text-(--text)',
                )}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
