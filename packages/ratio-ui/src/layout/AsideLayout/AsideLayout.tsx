// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type AsideLayoutWidth = 'sm' | 'md' | 'lg';

const asideWidthClasses: Record<AsideLayoutWidth, string> = {
  sm: 'lg:w-64',
  md: 'lg:w-80',
  lg: 'lg:w-96',
};

export interface AsideLayoutProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export interface AsideLayoutMainProps {
  children: ReactNode;
  className?: string;
}

export interface AsideLayoutAsideProps {
  children: ReactNode;
  /** Rail width from `lg`: `sm` 16rem, `md` 20rem (default), `lg` 24rem. */
  width?: AsideLayoutWidth;
  /**
   * Sticky offset for chrome above the layout (an app header): px, or any
   * CSS length — `"calc(var(--spacing) * 16)"` tracks a rem-sized header
   * exactly on the fluid root font size, where a px constant is off by a
   * few px at some viewport widths. Same convention as `Sidebar`'s `top`.
   * @default 0
   */
  top?: number | string;
  /** Accessible label for the aside landmark. */
  'aria-label'?: string;
  className?: string;
}

/**
 * Content with a sticky companion rail — the detail-page pattern where an
 * aside (registration card, summary, table of contents) follows the reader
 * from `lg` and stacks below the content on small screens. Layout-only;
 * put a `Card` or similar inside the aside for a surface.
 *
 * @example
 * <AsideLayout>
 *   <AsideLayout.Main>…article content…</AsideLayout.Main>
 *   <AsideLayout.Aside top="calc(var(--spacing) * 16)">
 *     <Card>…</Card>
 *   </AsideLayout.Aside>
 * </AsideLayout>
 */
const AsideLayoutRoot: React.FC<AsideLayoutProps> = ({ children, className, testId }) => (
  <div className={cn('lg:flex lg:items-start lg:gap-8', className)} data-testid={testId}>
    {children}
  </div>
);

const AsideLayoutMain: React.FC<AsideLayoutMainProps> = ({ children, className }) => (
  <div className={cn('min-w-0 flex-1', className)}>{children}</div>
);
AsideLayoutMain.displayName = 'AsideLayout.Main';

const AsideLayoutAside: React.FC<AsideLayoutAsideProps> = ({
  children,
  width = 'md',
  top = 0,
  'aria-label': ariaLabel,
  className,
}) => (
  <aside
    aria-label={ariaLabel}
    className={cn('mt-8 lg:mt-0 lg:shrink-0 lg:sticky', asideWidthClasses[width], className)}
    style={{ top }}
  >
    {children}
  </aside>
);
AsideLayoutAside.displayName = 'AsideLayout.Aside';

AsideLayoutRoot.displayName = 'AsideLayout';

export const AsideLayout = Object.assign(AsideLayoutRoot, {
  Main: AsideLayoutMain,
  Aside: AsideLayoutAside,
});
