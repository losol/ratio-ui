// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /**
   * Pin the header to the top of the window. It then measures itself and
   * sets `--app-shell-header-offset` and `--scroll-margin-top` on the shell,
   * so anchor jumps land below it and `Sidebar` / `AsideLayout.Aside` stick
   * under it without a `top`. Pin the header, not the `Navbar` inside it.
   */
  sticky?: boolean;
  className?: string;
}

/** The custom properties a sticky header publishes on the shell. */
const OFFSET_PROPERTIES = ['--app-shell-header-offset', '--scroll-margin-top'] as const;

/**
 * The page's header — a `<header>`, the banner landmark — round the
 * `Navbar` and anything else at the top of every page. A client module: a
 * sticky header measures itself in the browser.
 */
export const AppShellHeader = ({ sticky = false, className, children, ...rest }: AppShellHeaderProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!sticky || !header) return;
    const shell = header.closest<HTMLElement>('.ratio-app-shell') ?? document.documentElement;
    // The height it covers at the top of the window, re-measured when it
    // changes (a wrapping row on a phone, a larger text size).
    const publish = () => {
      const height = `${header.getBoundingClientRect().height}px`;
      for (const property of OFFSET_PROPERTIES) shell.style.setProperty(property, height);
    };
    publish();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publish);
    observer?.observe(header);
    return () => {
      observer?.disconnect();
      for (const property of OFFSET_PROPERTIES) shell.style.removeProperty(property);
    };
  }, [sticky]);

  return (
    <header
      ref={ref}
      data-sticky={sticky || undefined}
      className={cn('ratio-app-shell__header', className)}
      {...rest}
    >
      {children}
    </header>
  );
};
AppShellHeader.displayName = 'AppShell.Header';
