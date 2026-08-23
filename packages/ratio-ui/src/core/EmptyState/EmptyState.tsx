// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

import { cn } from '../../utils/cn';

export type EmptyStateSize = 'sm' | 'md';

// `title` is omitted from the DOM attributes and redefined below: the native
// one is a tooltip string, and an empty state's title is its headline.
export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Leading icon — pass a sized element, e.g. `<ScrollText size={28} />`
   * (20 suits `sm`). Decorative: the title carries the meaning.
   */
  icon?: React.ReactNode;
  /**
   * What isn't there, in the domain's words — "No manuscripts catalogued",
   * not "No data". A filtered-to-nothing list says so: "No work matches
   * the search."
   */
  title: React.ReactNode;
  /** One line on why, or what would change it. Omit when the title says enough. */
  description?: React.ReactNode;
  /** The way out — typically a single `Button`. */
  action?: React.ReactNode;
  /**
   * `'sm'` is the row inside a list, menu or table; `'md'` (default) is the
   * panel that fills a card or a page section.
   */
  size?: EmptyStateSize;
  className?: string;
  testId?: string;
}

const sizeConfig = {
  sm: { root: 'gap-1.5 px-4 py-6', title: 'text-sm', description: 'text-[13px]', action: 'mt-2' },
  md: { root: 'gap-2 px-6 py-12', title: 'text-base', description: 'text-sm', action: 'mt-4' },
} as const;

/**
 * EmptyState — what a list, table or panel shows when it holds nothing.
 *
 * Two situations, one component: nothing has been created yet (say so, and
 * offer the way to create it), or a filter matched nothing (say *that*, so
 * the reader knows the list isn't broken). The wording is the component's
 * whole job, so `title` is required and everything else is optional.
 *
 * Nothing here is announced by default. When a filter empties a live list,
 * make the surrounding region the live one, or pass `role="status"` — it
 * reaches the root along with the rest of the div's attributes.
 *
 * @example Inside a table that filtered to nothing:
 * ```tsx
 * <EmptyState size="sm" title="No work matches the search." role="status" />
 * ```
 *
 * @example A section nobody has filled yet:
 * ```tsx
 * <EmptyState
 *   icon={<ScrollText size={28} />}
 *   title="No manuscripts catalogued"
 *   description="Registered works appear here, newest first."
 *   action={<Button variant="primary">Register a work</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
  testId,
  ...rest
}: Readonly<EmptyStateProps>) {
  const styles = sizeConfig[size];

  return (
    <div
      {...rest}
      // Only override when `testId` is set: `data-testid={undefined}` after
      // the spread would drop a forwarded one (same guard as `Heading`).
      {...(testId !== undefined && { 'data-testid': testId })}
      className={cn('flex flex-col items-center text-center', styles.root, className)}
    >
      {icon && (
        <span aria-hidden className="text-(--text-subtle)">
          {icon}
        </span>
      )}
      {/* `my-0`: global.css gives every <p> vertical margins, which would
          stack on top of the flex gap and pull the block apart. */}
      <p className={cn(styles.title, 'my-0 font-medium text-(--text)')}>{title}</p>
      {description && (
        <p className={cn(styles.description, 'my-0 max-w-[44ch] text-(--text-muted)')}>
          {description}
        </p>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
