// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../../utils/cn';

export type DescriptionListVariant = 'default' | 'facts' | 'meta';

const rootClasses: Record<DescriptionListVariant, string> = {
  default: 'divide-y divide-border-1',
  // Editorial key-facts strip: mono overline terms above serif values,
  // in a bordered grid — for page headers and hero fact rows.
  facts: 'grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-border-1 py-6',
  // Compact label/value rows — for card asides and summaries.
  meta: 'flex flex-col gap-2 border-y border-border-1 py-3',
};

// Variant propagates from the root via `data-variant` + group-data classes.
// CSS-only so DescriptionList stays server-component-safe (no React context).
const itemClasses = cn(
  'group-data-[variant=default]/dl:grid group-data-[variant=default]/dl:grid-cols-2 md:group-data-[variant=default]/dl:grid-cols-4 group-data-[variant=default]/dl:px-2 group-data-[variant=default]/dl:py-2',
  'group-data-[variant=meta]/dl:flex group-data-[variant=meta]/dl:justify-between group-data-[variant=meta]/dl:gap-4',
);

const termClasses = cn(
  'break-words',
  'group-data-[variant=default]/dl:text-sm group-data-[variant=default]/dl:font-medium group-data-[variant=default]/dl:leading-6 md:group-data-[variant=default]/dl:col-span-1',
  'group-data-[variant=facts]/dl:font-mono group-data-[variant=facts]/dl:text-xs group-data-[variant=facts]/dl:uppercase group-data-[variant=facts]/dl:tracking-widest group-data-[variant=facts]/dl:text-(--text-subtle)',
  'group-data-[variant=meta]/dl:font-mono group-data-[variant=meta]/dl:text-xs group-data-[variant=meta]/dl:uppercase group-data-[variant=meta]/dl:tracking-widest group-data-[variant=meta]/dl:text-(--text-subtle)',
);

const definitionClasses = cn(
  'break-words',
  'group-data-[variant=default]/dl:mt-1 group-data-[variant=default]/dl:text-sm group-data-[variant=default]/dl:leading-6 md:group-data-[variant=default]/dl:col-span-3',
  'group-data-[variant=facts]/dl:mt-1 group-data-[variant=facts]/dl:font-serif group-data-[variant=facts]/dl:text-lg group-data-[variant=facts]/dl:leading-tight group-data-[variant=facts]/dl:text-(--text)',
  'group-data-[variant=meta]/dl:text-sm group-data-[variant=meta]/dl:text-right group-data-[variant=meta]/dl:text-(--text)',
);

export interface DescriptionListProps {
  children: React.ReactNode;
  /**
   * `default` renders divided term/definition rows. `facts` is the editorial
   * key-facts strip (mono overline terms, serif values, bordered grid).
   * `meta` renders compact label/value rows for card asides.
   */
  variant?: DescriptionListVariant;
  className?: string;
  testId?: string;
}

export interface DescriptionListItemProps {
  children: React.ReactNode;
}

export interface DescriptionListTermProps {
  children: React.ReactNode;
}

export interface DescriptionListDefinitionProps {
  children: React.ReactNode;
  testId?: string;
}

export interface DescriptionProps {
  term: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}

const Root: React.FC<DescriptionListProps> = ({
  children,
  variant = 'default',
  className,
  testId,
}) => (
  <dl
    className={cn('group/dl', rootClasses[variant], className)}
    data-variant={variant}
    data-testid={testId}
  >
    {children}
  </dl>
);

const Item: React.FC<DescriptionListItemProps> = ({ children }) => (
  <div className={itemClasses}>{children}</div>
);

const Term: React.FC<DescriptionListTermProps> = ({ children }) => (
  <dt className={termClasses}>{children}</dt>
);

const Definition: React.FC<DescriptionListDefinitionProps> = ({ children, testId }) => (
  <dd className={definitionClasses} data-testid={testId}>
    {children}
  </dd>
);

/**
 * Shortcut combining Item, Term, and Definition. Use this when you have
 * a simple term/value pair. For complex layouts, compose Item/Term/Definition
 * directly.
 *
 * @example
 * <DescriptionList>
 *   <DescriptionList.Description term="Name">Ada Lovelace</DescriptionList.Description>
 *   <DescriptionList.Description term="Email">ada@example.com</DescriptionList.Description>
 * </DescriptionList>
 */
const Description: React.FC<DescriptionProps> = ({ term, children, testId }) => (
  <div className={itemClasses}>
    <dt className={termClasses}>{term}</dt>
    <dd className={definitionClasses} data-testid={testId}>
      {children}
    </dd>
  </div>
);

export const DescriptionList = Object.assign(Root, {
  Item,
  Term,
  Definition,
  Description,
});
