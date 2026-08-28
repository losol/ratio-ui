// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

/** @deprecated Use `SectionNavItem` from `core/SectionNav` — `{ id, title }`, the link goes to `#id`. */
export interface NavListItem {
  href: string;
  title: string;
}

/** @deprecated Use `SectionNavProps` from `core/SectionNav`. */
export interface NavListProps {
  items: NavListItem[];
  LinkComponent: React.JSXElementConstructor<{ href: string; children: React.ReactNode }>;
  sticky?: boolean;
}

/**
 * Renders a horizontal list of anchor links, optionally sticky.
 *
 * @deprecated Use `SectionNav` — sticky with a `top` offset for the navbar,
 * scroll-spy with `aria-current`, a named landmark, and plain anchors (no
 * `LinkComponent`). Removed in 3.0.
 */
export const NavList: React.FC<NavListProps> = ({ items, LinkComponent, sticky = false }) => {
  return (
    <nav
      className={`bg-card z-10 py-2 shadow-xs${
        sticky ? ' sticky top-0' : ''
      }`}
    >
      <ul className="container mx-auto flex space-x-6 overflow-x-auto px-4">
        {items.map(item => (
          <li key={item.href} className='whitespace-nowrap'>
            <LinkComponent href={item.href}>{item.title}</LinkComponent>
          </li>
        ))}
      </ul>
    </nav>
  );
};

NavList.displayName = 'NavList';
