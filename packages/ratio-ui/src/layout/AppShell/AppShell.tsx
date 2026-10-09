// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { SkipLink } from '../../core/SkipLink';
import { cn } from '../../utils/cn';
import './AppShell.css';

/** Built-in text of `AppShell`. Each entry falls back to English. */
export interface AppShellLabels {
  /** The skip link's text. @default 'Skip to main content' */
  skipLink?: string;
}

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
  /**
   * Render a `SkipLink` first in the shell, to `AppShell.Main` (its `id`,
   * `main` by default). Turn off only when the page has its own.
   * @default true
   */
  skipLink?: boolean;
  /** Built-in text. Each entry falls back to English. */
  labels?: AppShellLabels;
  className?: string;
}

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /**
   * Pin the header to the top of the window. Pin the header, not the
   * `Navbar` inside it. Anchor targets and sticky rails below it still take
   * its height themselves (`--scroll-margin-top`, `top`).
   */
  sticky?: boolean;
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
 * The page's header — a `<header>`, the banner landmark — round the
 * `Navbar` and anything else at the top of every page.
 */
const AppShellHeader = ({ sticky = false, className, children, ...rest }: AppShellHeaderProps) => (
  <header data-sticky={sticky || undefined} className={cn('ratio-app-shell__header', className)} {...rest}>
    {children}
  </header>
);
AppShellHeader.displayName = 'AppShell.Header';

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
 * The column a page sits in: `AppShell.Header`, `AppShell.Main` and the
 * footer, at least the height of the window, with the footer at the bottom
 * of a short page. Put it inside `<body>` — the framework owns `<html>` and
 * `<body>`.
 *
 * What it wires so no page has to remember: the landmarks — `<header>`
 * (banner), `<main>`, and the `Footer`'s `<footer>` — and a `SkipLink`
 * first, to `AppShell.Main`.
 *
 * `frame` draws a frame in the primary colour round it all.
 *
 * @beta The prop shape may change before release.
 *
 * @example
 * ```tsx
 * <AppShell frame labels={{ skipLink: 'Hopp til hovedinnhold' }}>
 *   <AppShell.Header sticky>
 *     <Navbar>…</Navbar>
 *   </AppShell.Header>
 *   <AppShell.Main>…</AppShell.Main>
 *   <Footer>…</Footer>
 * </AppShell>
 * ```
 */
const AppShellRoot: React.FC<AppShellProps> = ({
  as: Component = 'div',
  frame = false,
  skipLink = true,
  labels,
  className,
  children,
  ...rest
}) => {
  // The skip link goes to Main's own id, read from the element — cheaper
  // than a context, and it keeps the shell server-safe.
  const main = React.Children.toArray(children).find(
    (child): child is React.ReactElement<AppShellMainProps> =>
      React.isValidElement(child) && child.type === AppShellMain,
  );
  const mainId = main?.props.id ?? 'main';
  return (
    <Component className={cn('ratio-app-shell', className)} data-frame={frame || undefined} {...rest}>
      {skipLink ? <SkipLink href={`#${mainId}`}>{labels?.skipLink}</SkipLink> : null}
      {children}
    </Component>
  );
};
AppShellRoot.displayName = 'AppShell';

export const AppShell = Object.assign(AppShellRoot, {
  Header: AppShellHeader,
  Main: AppShellMain,
});
