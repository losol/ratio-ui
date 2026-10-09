// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './AppShell.css';

export interface AppShellProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Element to render. Defaults to `div`. */
  as?: React.ElementType;
  /**
   * Frame the whole page in the primary colour, like a poster. Width and
   * colour come from the `--app-shell-frame-*` tokens; in dark mode the
   * frame steps back into the surface. Set `--app-shell-frame-width: 0` on
   * the page to let a reader turn it off.
   */
  frame?: boolean;
  className?: string;
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Element to render. Defaults to `main`. */
  as?: React.ElementType;
  /** Defaults to `main`, the target `SkipLink` jumps to. */
  id?: string;
  className?: string;
}

/**
 * The main content: grows to fill the shell, so the footer stays at the
 * bottom. A `<main id="main">` by default — what `SkipLink` jumps to.
 */
const AppShellMain = ({ as: Component = 'main', id = 'main', className, children, ...rest }: AppShellMainProps) => (
  <Component id={id} className={cn('ratio-app-shell__main', className)} {...rest}>
    {children}
  </Component>
);
AppShellMain.displayName = 'AppShell.Main';

/**
 * The column a page sits in: the navbar, `AppShell.Main` and the footer,
 * at least the height of the window, with the footer at the bottom of a
 * short page. Put it inside `<body>` — the framework owns `<html>` and
 * `<body>`. `frame` draws a frame in the primary colour round it all.
 *
 * @beta The prop shape may change before release.
 *
 * @example
 * ```tsx
 * <AppShell frame>
 *   <SkipLink />
 *   <Navbar>…</Navbar>
 *   <AppShell.Main>…</AppShell.Main>
 *   <Footer>…</Footer>
 * </AppShell>
 * ```
 */
const AppShellRoot: React.FC<AppShellProps> = ({
  as: Component = 'div',
  frame = false,
  className,
  children,
  ...rest
}) => (
  <Component className={cn('ratio-app-shell', className)} data-frame={frame || undefined} {...rest}>
    {children}
  </Component>
);
AppShellRoot.displayName = 'AppShell';

export const AppShell = Object.assign(AppShellRoot, {
  Main: AppShellMain,
});
