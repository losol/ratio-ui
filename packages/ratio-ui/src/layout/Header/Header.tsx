// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Header.css';

// Plain markup and CSS, no hooks: server-safe, and statics are attached in
// a module without a 'use client' directive (see scripts/check-client-statics.mjs).

export type HeaderAlign = 'start' | 'center' | 'end' | 'baseline';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The element. A `<header>` inside `<main>`, a `<section>` or an
   * `<article>` is that part's header and not a landmark; at the top of the
   * page, outside them, it is the banner, which is `AppShell.Header`'s job.
   * `div` for a header row that should carry no meaning.
   * @default 'header'
   */
  as?: 'header' | 'div';
  /**
   * How the actions line up with the heading block: `start` beside its
   * first line, `center` in its middle, `end` beside its last line.
   * @default 'start'
   */
  align?: HeaderAlign;
  className?: string;
  /** The heading block (usually a `Heading.Group`) and `Header.Actions`. */
  children: ReactNode;
}

/**
 * Header — the top of a page, a section or an article: a heading block on
 * the leading edge and `Header.Actions` on the trailing edge, in one row
 * that wraps the actions under the heading when the two do not fit. The
 * heading block is whatever you compose (a `Heading.Group` with an eyebrow,
 * the title and a line of `Text`; a title with a `Badge` beside it); the
 * header owns only the row. No margins: the surrounding layout owns the
 * space around it.
 *
 * Not the site's banner, which is `AppShell.Header` round the `Navbar`.
 *
 * @example
 * ```tsx
 * <Header>
 *   <Heading.Group>
 *     <Heading.Eyebrow>Administration</Heading.Eyebrow>
 *     <Heading as="h1" size="lg">Registrations</Heading>
 *     <Text variant="muted" size="sm">Everyone signed up for the autumn programme.</Text>
 *   </Heading.Group>
 *   <Header.Actions>
 *     <Button variant="primary">Add registration</Button>
 *   </Header.Actions>
 * </Header>
 * ```
 */
function HeaderRoot({
  as: Component = 'header',
  align = 'start',
  className,
  children,
  ...rest
}: HeaderProps) {
  return (
    <Component
      className={cn('ratio-header', className)}
      data-align={align === 'start' ? undefined : align}
      {...rest}
    >
      {children}
    </Component>
  );
}

export interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Buttons, a `Badge` with a status, a `Menu`: what the reader can do here. */
  children: ReactNode;
}

/**
 * The trailing edge: buttons, a status, a menu. Outside the heading block,
 * so an `<hgroup>` holds only heading content.
 */
function HeaderActions({ className, children, ...rest }: HeaderActionsProps) {
  return (
    <div className={cn('ratio-header__actions', className)} {...rest}>
      {children}
    </div>
  );
}

HeaderRoot.displayName = 'Header';
HeaderActions.displayName = 'Header.Actions';

export const Header = Object.assign(HeaderRoot, { Actions: HeaderActions });
