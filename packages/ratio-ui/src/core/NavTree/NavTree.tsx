// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useState, useCallback } from 'react';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';

export interface NavTreeItem {
  /**
   * Visible label. Any node composes here — `<Chip.Dot />`, a logo, `<Kbd>` —
   * but keep some text in it (or plain text) so the row has an accessible name.
   */
  title: React.ReactNode;
  /**
   * Stable key. Needed when `href` is absent and `title` isn't a plain string;
   * otherwise `href`/`title` serve as the key.
   */
  id?: string;
  /** Destination. Omit on a branch to make the whole row a collapse toggle. */
  href?: string;
  /** Optional leading icon — pass a sized element, e.g. `<Database size={18} />`. */
  icon?: React.ReactNode;
  /** Right-aligned adornment — a count `<Chip>`, status dot, or badge. */
  trailing?: React.ReactNode;
  /** Nested items. The row gains a chevron and collapses. */
  children?: NavTreeItem[];
}

export interface NavTreeGroup {
  /** Uppercase eyebrow above the group (e.g. "Workspace"). Omit for none. */
  label?: string;
  items: NavTreeItem[];
}

export interface NavTreeProps {
  /** Sections with eyebrow labels — the admin-sidebar form. */
  groups?: NavTreeGroup[];
  /** Ungrouped convenience — equivalent to one unlabeled group. */
  items?: NavTreeItem[];
  /** Current path — highlights the active item and auto-expands its ancestors. */
  currentPath?: string;
  /** Routing link component (e.g. Next.js Link, React Router Link). */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
  /** Accessible label for the nav element. */
  'aria-label'?: string;
  className?: string;
}

// Row chrome shared by links and toggle rows. The active row is tinted with
// the primary-100/900 pair (the same tint recipe as ToggleButton/Menu).
const ROW =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-(--focus-ring)';
const ROW_ACTIVE = 'bg-primary-100 dark:bg-primary-900 text-(--text) font-medium';
const ROW_IDLE = 'text-(--text-muted) hover:text-(--text) hover:bg-card-hover';

const GROUP_LABEL =
  'px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-(--text-subtle)';

/**
 * NavTree — hierarchical navigation for sidebars and docs. Optionally grouped
 * under uppercase eyebrow labels (the admin-console form), with per-item
 * icons, collapsible branches, and active-path highlighting with auto-expanded
 * ancestors.
 *
 * Pass a `LinkComponent` for SPA routers (e.g. Next.js `Link`). When no
 * `currentPath` is provided, no item is highlighted. A branch with an `href`
 * renders a split row: the label navigates, the chevron toggles.
 *
 * Successor to `TreeView` (kept as a deprecated alias).
 */
export function NavTree({
  groups,
  items,
  currentPath,
  LinkComponent,
  'aria-label': ariaLabel = 'Navigation',
  className,
}: Readonly<NavTreeProps>) {
  const resolvedGroups = groups ?? (items ? [{ items }] : []);

  return (
    <nav aria-label={ariaLabel} className={cn('text-[14.5px]', className)}>
      {resolvedGroups.map((group, index) => (
        // Index is always part of the key: two groups may share a label.
        <div key={`${group.label ?? 'group'}-${index}`} className={index > 0 ? 'mt-6' : undefined}>
          {group.label && <div className={GROUP_LABEL}>{group.label}</div>}
          <ul className="space-y-0.5">
            {group.items.map((node, i) => (
              <NavTreeRow
                key={nodeKey(node, i)}
                node={node}
                currentPath={currentPath}
                LinkComponent={LinkComponent}
                depth={0}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Stable list key: explicit `id`, else `href`, else a string title, else index. */
function nodeKey(node: NavTreeItem, index: number): string {
  return node.id ?? node.href ?? (typeof node.title === 'string' ? node.title : `item-${index}`);
}

function isActive(href: string | undefined, currentPath: string | undefined): boolean {
  if (!href || !currentPath) return false;
  const a = href.replace(/\/$/, '') || '/';
  const b = currentPath.replace(/\/$/, '') || '/';
  return a === b;
}

function hasActiveChild(node: NavTreeItem, currentPath: string | undefined): boolean {
  if (!currentPath) return false;
  if (isActive(node.href, currentPath)) return true;
  return node.children?.some((child) => hasActiveChild(child, currentPath)) ?? false;
}

interface NavTreeRowProps {
  node: NavTreeItem;
  currentPath?: string;
  LinkComponent?: NavTreeProps['LinkComponent'];
  depth: number;
}

function NavTreeRow({ node, currentPath, LinkComponent, depth }: Readonly<NavTreeRowProps>) {
  const hasChildren = !!node.children?.length;
  const active = isActive(node.href, currentPath);
  const containsActive = hasActiveChild(node, currentPath);

  // Open-state is derived from the active path unless the user has toggled the
  // branch manually. A `currentPath` change clears the manual override (state
  // adjusted during render — React's sanctioned "derive from props" pattern),
  // so navigating auto-expands the new active branch again.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [prevPath, setPrevPath] = useState(currentPath);
  if (prevPath !== currentPath) {
    setPrevPath(currentPath);
    setManualOpen(null);
  }
  const isOpen = manualOpen ?? (active || containsActive);

  const toggle = useCallback(() => setManualOpen((prev) => !(prev ?? (active || containsActive))), [active, containsActive]);

  const LinkTag = (LinkComponent ?? 'a') as React.ElementType;
  const paddingLeft = `${0.75 + depth * 0.75}rem`;

  // Text for the chevron's accessible name. A ReactNode title can't be
  // interpolated (it would stringify to "[object Object]"), so fall back to
  // the item's id, then to a bare "Expand"/"Collapse".
  const titleText =
    typeof node.title === 'string' ? node.title : node.id;

  const iconNode = node.icon && (
    <span aria-hidden className="shrink-0">
      {node.icon}
    </span>
  );
  const trailingNode = node.trailing && (
    <span className="ml-auto shrink-0">{node.trailing}</span>
  );
  const chevron = (
    <ChevronRight
      aria-hidden="true"
      className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-90')}
    />
  );

  if (!hasChildren) {
    return (
      <li>
        <LinkTag
          href={node.href ?? '#'}
          aria-current={active ? 'page' : undefined}
          className={cn(ROW, active ? ROW_ACTIVE : ROW_IDLE)}
          style={{ paddingLeft }}
        >
          {iconNode}
          <span className="min-w-0 flex-1 truncate">{node.title}</span>
          {trailingNode}
        </LinkTag>
      </li>
    );
  }

  return (
    <li>
      {node.href ? (
        // Split row: the label navigates, the chevron toggles. (A button can't
        // nest inside a link, so the row is a container with both.)
        <div
          className={cn(
            ROW,
            'py-0 pr-1',
            active ? ROW_ACTIVE : containsActive ? 'text-(--text) font-medium' : ROW_IDLE,
          )}
          style={{ paddingLeft }}
        >
          <LinkTag
            href={node.href}
            aria-current={active ? 'page' : undefined}
            className="flex min-w-0 flex-1 items-center gap-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) rounded-md"
          >
            {iconNode}
            <span className="min-w-0 flex-1 truncate">{node.title}</span>
          </LinkTag>
          {trailingNode}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-label={
              isOpen
                ? titleText
                  ? `Collapse ${titleText}`
                  : 'Collapse'
                : titleText
                  ? `Expand ${titleText}`
                  : 'Expand'
            }
            className="rounded-md p-1.5 outline-none transition-colors hover:bg-card-hover focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
          >
            {chevron}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className={cn(
            ROW,
            'w-full text-left',
            containsActive ? 'text-(--text) font-medium' : ROW_IDLE,
          )}
          style={{ paddingLeft }}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            {iconNode}
            <span className="truncate">{node.title}</span>
          </span>
          {trailingNode}
          {chevron}
        </button>
      )}
      {isOpen && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children!.map((child, i) => (
            <NavTreeRow
              key={nodeKey(child, i)}
              node={child}
              currentPath={currentPath}
              LinkComponent={LinkComponent}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
