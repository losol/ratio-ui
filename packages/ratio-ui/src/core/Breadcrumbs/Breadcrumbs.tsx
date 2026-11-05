// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { createContext, useContext } from 'react';
import {
  Breadcrumbs as AriaBreadcrumbs,
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps as AriaBreadcrumbProps,
} from 'react-aria-components';

type LinkComponent = React.ComponentType<{
  href: string;
  children: React.ReactNode;
  className?: string;
  'aria-current'?: React.AriaAttributes['aria-current'];
}>;

const LinkContext = createContext<LinkComponent | undefined>(undefined);

export interface BreadcrumbsProps {
  /** Localized accessible name for the breadcrumbs list. */
  'aria-label'?: string;
  /** Custom className for the breadcrumbs container */
  className?: string;
  /** Custom Link component (e.g., Next.js Link) */
  LinkComponent?: LinkComponent;
  children: React.ReactNode;
}

export interface BreadcrumbProps extends Omit<AriaBreadcrumbProps, 'className'> {
  /** Navigation href */
  href?: string;
  /** Custom className for the breadcrumb */
  className?: string;
  children: React.ReactNode;
}

/**
 * Breadcrumbs component for navigation hierarchy
 *
 * @example
 * ```tsx
 * import { Link } from '@eventuras/ratio-ui-next';
 *
 * <Breadcrumbs LinkComponent={Link}>
 *   <Breadcrumb href="/">Home</Breadcrumb>
 *   <Breadcrumb href="/docs">Docs</Breadcrumb>
 *   <Breadcrumb>Current Page</Breadcrumb>
 * </Breadcrumbs>
 * ```
 */
export function Breadcrumbs({ className = '', LinkComponent, children, ...props }: Readonly<BreadcrumbsProps>) {
  return (
    <LinkContext.Provider value={LinkComponent}>
      <AriaBreadcrumbs
        className={`flex items-center text-sm ${className}`}
        {...props}
      >
        {children}
      </AriaBreadcrumbs>
    </LinkContext.Provider>
  );
}

/**
 * Individual breadcrumb item
 */
export function Breadcrumb({ href, className = '', children, ...props }: Readonly<BreadcrumbProps>) {
  const LinkComponent = useContext(LinkContext);

  const linkClasses = `text-(--primary) hover:underline ${className}`;

  return (
    <AriaBreadcrumb {...props}>
      {({ isCurrent }) => (
        <>
          {href && LinkComponent ? (
            <LinkComponent href={href} className={linkClasses} aria-current={isCurrent ? 'page' : undefined}>
              {children}
            </LinkComponent>
          ) : href ? (
            <a href={href} className={linkClasses} aria-current={isCurrent ? 'page' : undefined}>
              {children}
            </a>
          ) : (
            <span className={`text-(--text-muted) ${className}`} aria-current={isCurrent ? 'page' : undefined}>
              {children}
            </span>
          )}
          {/* Collection content must stay inside the item, including decoration. */}
          {!isCurrent && (
            <span className="text-(--text-subtle) mx-2" aria-hidden="true">
              /
            </span>
          )}
        </>
      )}
    </AriaBreadcrumb>
  );
}
