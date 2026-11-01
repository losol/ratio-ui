// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { Heading, type HeadingSize } from '../../core/Heading';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  /** The page's title. */
  title: React.ReactNode;
  /**
   * Heading level of the title. A page has one `h1`; a section header inside
   * it takes `h2`.
   * @default 'h1'
   */
  as?: 'h1' | 'h2' | 'h3';
  /**
   * Visual scale of the title, decoupled from `as` — `Heading`'s `size`.
   * @default 'lg'
   */
  size?: HeadingSize;
  /** Small kicker above the title, as `Heading.Eyebrow`. */
  eyebrow?: React.ReactNode;
  /**
   * One line under the title: what the page holds, or the count it reports
   * ("12 events this season").
   */
  description?: React.ReactNode;
  /**
   * What the reader can do here — a primary `Button`, a `Badge` with the
   * page's status. Sits on the trailing edge, and drops under the title when
   * the two don't fit on one line.
   */
  actions?: React.ReactNode;
  className?: string;
  testId?: string;
}

/**
 * The top of an admin or detail page: title and description on the leading
 * edge, actions on the trailing edge, wrapping under the title on a phone.
 * The title and its lines are one `<hgroup>` (`Heading.Group`), so the
 * eyebrow and description read as the heading's subtitle. The surrounding
 * layout owns the spacing around it.
 *
 * @example
 * <PageHeader
 *   title="Events"
 *   description="12 events this season"
 *   actions={<Button variant="primary">New event</Button>}
 * />
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  as = 'h1',
  size = 'lg',
  eyebrow,
  description,
  actions,
  className,
  testId,
}) => (
  <header
    className={cn('flex flex-wrap items-start justify-between gap-x-6 gap-y-3', className)}
    data-testid={testId}
  >
    {/* `basis-64` is the title's share before the actions wrap under it. */}
    <Heading.Group className="min-w-0 flex-1 basis-64">
      {eyebrow != null && <Heading.Eyebrow>{eyebrow}</Heading.Eyebrow>}
      <Heading as={as} size={size}>
        {title}
      </Heading>
      {description != null && (
        <p className="mt-1 max-w-prose text-sm text-(--text-muted)">{description}</p>
      )}
    </Heading.Group>
    {actions != null && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </header>
);
