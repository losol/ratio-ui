// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface SidebarProps {
  children: ReactNode;
  /** Fixed width in px. @default 236 */
  width?: number;
  /**
   * Narrow icon-rail mode. Pair with `iconOnly` on the `NavTree` inside, and
   * swap wordmark → mark in `Sidebar.Header` — the consumer owns the toggle
   * state. Width animates between the two modes.
   */
  collapsed?: boolean;
  /** Width in px when `collapsed`. @default 64 */
  collapsedWidth?: number;
  /**
   * Offset in px for a full-width app topbar rendered ABOVE the sidebar
   * (outside it): the sidebar sticks below it and fills the remaining
   * viewport height — one value drives both `top` and `height`. Unrelated
   * to `Sidebar.Header`, which lives inside the sidebar. Leave at 0 for a
   * full-height sidebar with the logo in `Sidebar.Header`. @default 0
   */
  top?: number;
  /** Accessible label for the aside landmark. */
  'aria-label'?: string;
  className?: string;
  testId?: string;
}

interface SidebarSlotProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarComponent extends React.FC<SidebarProps> {
  Header: React.FC<SidebarSlotProps>;
  Body: React.FC<SidebarSlotProps>;
  Footer: React.FC<SidebarSlotProps>;
}

/**
 * Sidebar — the sticky aside chrome for admin consoles and docs shells:
 * fixed width, sticky under the app header, right hairline border, and a
 * flex column for its parts. Content-agnostic; a `NavTree` is the typical
 * body.
 *
 * Compose with the slots (same vocabulary as `Drawer`):
 * - `Sidebar.Header` — pinned top (logo / workspace switcher)
 * - `Sidebar.Body` — the scrollable middle (put the nav here)
 * - `Sidebar.Footer` — pinned bottom behind a hairline (theme/language)
 *
 * For small screens, hide it (`className="hidden lg:flex"`) and reuse the
 * same nav inside a `Drawer` — see the stories for the pairing.
 *
 * @example
 * <Sidebar width={236} top={62} aria-label="Console">
 *   <Sidebar.Header>…logo…</Sidebar.Header>
 *   <Sidebar.Body>
 *     <NavTree groups={…} currentPath={path} />
 *   </Sidebar.Body>
 *   <Sidebar.Footer>…theme toggle…</Sidebar.Footer>
 * </Sidebar>
 */
const Sidebar: SidebarComponent = ({
  children,
  width = 236,
  collapsed = false,
  collapsedWidth = 64,
  top = 0,
  'aria-label': ariaLabel,
  className,
  testId,
}) => (
  <aside
    aria-label={ariaLabel}
    data-collapsed={collapsed || undefined}
    data-testid={testId}
    className={cn(
      'sticky flex shrink-0 flex-col overflow-x-hidden border-r border-border-1',
      'transition-[width] duration-200 ease-out',
      className,
    )}
    style={{ width: collapsed ? collapsedWidth : width, top, height: `calc(100vh - ${top}px)` }}
  >
    {children}
  </aside>
);

const SidebarHeader: React.FC<SidebarSlotProps> = ({ children, className }) => (
  <div className={cn('shrink-0 px-3 pb-3 pt-5', className)}>{children}</div>
);
SidebarHeader.displayName = 'Sidebar.Header';

const SidebarBody: React.FC<SidebarSlotProps> = ({ children, className }) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto px-3 py-4', className)}>{children}</div>
);
SidebarBody.displayName = 'Sidebar.Body';

const SidebarFooter: React.FC<SidebarSlotProps> = ({ children, className }) => (
  <div className={cn('shrink-0 border-t border-border-1 px-3 py-3', className)}>{children}</div>
);
SidebarFooter.displayName = 'Sidebar.Footer';

Sidebar.Header = SidebarHeader;
Sidebar.Body = SidebarBody;
Sidebar.Footer = SidebarFooter;

export { Sidebar };
