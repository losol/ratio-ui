// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, X } from '../../icons';
import { ActionButton } from '../ActionButton';
import { cn } from '../../utils/cn';

interface NavTreeItemBase {
  /**
   * Stable key. Needed when `href` is absent and `title` isn't a plain string;
   * otherwise `href`/`title` serve as the key.
   */
  id?: string;
}

/** The regular item shape: a link row, optionally a collapsible branch. */
export interface NavTreeLinkItem extends NavTreeItemBase {
  /**
   * Visible label. Any node composes here — `<Chip.Dot />`, a logo, `<Kbd>` —
   * but keep some text in it (or plain text) so the row has an accessible
   * name.
   */
  title: React.ReactNode;
  /**
   * Destination. Omit on a branch to make the whole row a collapse toggle, and
   * on a leaf for a plain row with nothing to click — an empty state, or a
   * grouping that exists only to hold its children.
   */
  href?: string;
  /** Optional leading icon — pass a sized element, e.g. `<Database size={18} />`. */
  icon?: React.ReactNode;
  /** Right-aligned adornment — a count `<Chip>`, status dot, or badge. */
  trailing?: React.ReactNode;
  /** Nested items. The row gains a chevron and collapses. */
  children?: NavTreeItem[];
  /**
   * Start this branch expanded even when it doesn't contain the current
   * page. The user's toggle wins until `currentPath` changes — then the
   * default re-asserts, same as the active branch's auto-expand. Declare it
   * on branches with dynamic children (e.g. a filter in a `content` row) —
   * otherwise filtering away the active child collapses the branch.
   */
  defaultOpen?: boolean;
  content?: never;
  context?: never;
}

/**
 * Arbitrary JSX in place of a link row — e.g. a compact `SearchField`
 * filtering the group it sits in (composed from the call site; NavTree stays
 * in `core`). Ignored in `iconOnly` and `horizontal` modes.
 */
export interface NavTreeContentItem extends NavTreeItemBase {
  content: React.ReactNode;
  /**
   * Stable list key — required on content items. With no `href` or string
   * `title` to fall back on, an index-based key would remount the (often
   * stateful) content whenever siblings are filtered or reordered — e.g. a
   * `SearchField` filtering its own group would lose focus as you type.
   */
  id: string;
  /** Ignored — content items render no row chrome. */
  title?: React.ReactNode;
  href?: never;
  icon?: never;
  trailing?: never;
  children?: never;
  defaultOpen?: never;
  context?: never;
}

/**
 * Names the record a branch is scoped to (the expanding rail) — place it
 * first among the branch's children. Mono eyebrow style, optional close
 * button; ignored in `iconOnly` and `horizontal` modes, like `content`.
 */
export interface NavTreeContextItem extends NavTreeItemBase {
  /** The record's name — truncates to one line. */
  context: React.ReactNode;
  /** Stable list key — required, as for `content` items. */
  id: string;
  /** Renders a close button; leave the record here (e.g. navigate to the list). */
  onClose?: () => void;
  /** Accessible name for the close button. @default 'Close' */
  closeLabel?: string;
  title?: never;
  href?: never;
  icon?: never;
  trailing?: never;
  children?: never;
  defaultOpen?: never;
  content?: never;
}

/**
 * One node in the tree — a link/branch row (required `title`, the row's
 * accessible name), a `content` item rendering arbitrary JSX, or a `context`
 * row naming the record a branch is scoped to. Modeled as a union so a plain
 * row can't silently lack a label, and mixing the kinds' props is a type
 * error instead of silently ignored.
 */
export type NavTreeItem = NavTreeLinkItem | NavTreeContentItem | NavTreeContextItem;

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
  /**
   * Start every branch above this depth expanded — `1` opens the top-level
   * branches, `Infinity` opens everything. Per-item `defaultOpen` and the
   * active path's auto-expand still apply on top; the user's toggle wins
   * until `currentPath` changes. @default 0
   */
  defaultExpandedDepth?: number;
  /** Branches to start expanded, by key — same semantics as `defaultOpen`. Mirrors React Aria. */
  defaultExpandedKeys?: Iterable<string>;
  /**
   * Controlled expansion: open-state follows this set exactly, nothing
   * auto-expands — derive it from the route and the rail matches the URL.
   * Keys: `id`, else `href`, else a string `title`. Mirrors React Aria.
   */
  expandedKeys?: Iterable<string>;
  /** Fires with the full set of open keys after a toggle, controlled or not. */
  onExpandedChange?: (keys: Set<string>) => void;
  /**
   * `vertical` (default) is the stacked sidebar list; `horizontal` lays the
   * top-level items out as a row of tabs with an accent underline on the
   * active item — the navbar nav-row form. Horizontal flattens groups
   * (labels dropped) and renders top-level items only.
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Icon-rail mode: rows collapse to centered icons with the title as
   * accessible name and native tooltip; group labels become dividers and
   * nesting is not rendered (top-level only). Pair with a collapsed
   * `Sidebar`. Rows without an `icon` fall back to the title's first letter.
   * Give items a string `title` or an `id` so rail rows keep an accessible
   * name (falls back to `href`).
   */
  iconOnly?: boolean;
  /**
   * Routing link component (e.g. Next.js Link, React Router Link). Beyond
   * `className`, NavTree passes `style` (the depth indent), `aria-current`
   * on the active row, and `aria-label`/`title` in the icon rail — the
   * adapter must forward them all, so spread the rest:
   * `({ href, ...rest }) => <Link to={href} {...rest} />`.
   */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    'aria-current'?: 'page';
    'aria-label'?: string;
    title?: string;
  }>;
  /** Accessible label for the nav element. */
  'aria-label'?: string;
  className?: string;
}

// Row chrome shared by links and toggle rows. The active row is tinted with
// the primary-100/900 pair (the same tint recipe as ToggleButton/Menu).
const ROW =
  'relative flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-(--focus-ring)';
// Active = accent (Ochre) tint + a 3px accent bar — the same "current"
// marker Menu uses, per the design system's navbar spec.
const ROW_ACTIVE = cn(
  'bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] text-(--text) font-medium',
  'before:content-[""] before:absolute before:left-[3px] before:top-2 before:bottom-2',
  'before:w-[3px] before:rounded-[3px] before:bg-(--accent)',
);
// Horizontal tab: accent underline overlapping the list rule.
const HTAB =
  'relative flex items-center gap-2 py-3 text-[13.5px] font-medium whitespace-nowrap ' +
  'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)';
const HTAB_ACTIVE = cn(
  'text-(--text) font-semibold',
  'after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-px',
  'after:h-[2px] after:bg-(--accent)',
);
const HTAB_IDLE = 'text-(--text-muted) hover:text-(--text)';
const ROW_IDLE = 'text-(--text-muted) hover:text-(--text) hover:bg-card-hover';

const GROUP_LABEL =
  'px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-(--text-subtle)';

/**
 * NavTree — hierarchical navigation for sidebars and docs, or a horizontal
 * tab row for navbars (`orientation="horizontal"`). Optionally grouped
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
  orientation = 'vertical',
  defaultExpandedDepth = 0,
  defaultExpandedKeys,
  expandedKeys,
  onExpandedChange,
  iconOnly = false,
  LinkComponent,
  'aria-label': ariaLabel = 'Navigation',
  className,
}: Readonly<NavTreeProps>) {
  const resolvedGroups = groups ?? (items ? [{ items }] : []);

  // Expansion state lives here so a toggle can report the whole open set.
  // Uncontrolled: derived from the active path + `default*` unless toggled
  // manually; a `currentPath` change clears the overrides (state adjusted
  // during render). Controlled: `expandedKeys` is the whole truth.
  const controlled = expandedKeys !== undefined;
  const controlledSet = useMemo(() => new Set(expandedKeys ?? []), [expandedKeys]);
  const defaultSet = useMemo(() => new Set(defaultExpandedKeys ?? []), [defaultExpandedKeys]);
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [prevPath, setPrevPath] = useState(currentPath);
  if (prevPath !== currentPath) {
    setPrevPath(currentPath);
    setManual({});
  }

  const isOpenWith = (overrides: Record<string, boolean>) =>
    (node: NavTreeLinkItem, key: string, depth: number): boolean => {
      if (controlled) return controlledSet.has(key);
      const derived =
        isActive(node.href, currentPath) ||
        hasActiveChild(node, currentPath) ||
        !!node.defaultOpen ||
        depth < defaultExpandedDepth ||
        defaultSet.has(key);
      return overrides[key] ?? derived;
    };

  const expansion: Expansion = {
    isOpen: isOpenWith(manual),
    toggle: (node, key, depth) => {
      const open = expansion.isOpen(node, key, depth);
      if (controlled) {
        const next = new Set(controlledSet);
        if (open) next.delete(key);
        else next.add(key);
        onExpandedChange?.(next);
        return;
      }
      const nextManual = { ...manual, [key]: !open };
      setManual(nextManual);
      if (onExpandedChange) {
        onExpandedChange(collectOpenKeys(resolvedGroups, isOpenWith(nextManual)));
      }
    },
  };

  if (orientation === 'horizontal') {
    const LinkTag = (LinkComponent ?? 'a') as React.ElementType;
    const flat = resolvedGroups
      .flatMap((g) => g.items)
      .filter((n): n is NavTreeLinkItem => !isContentItem(n) && !isContextItem(n));
    return (
      <nav aria-label={ariaLabel} className={className}>
        <ul className="m-0 flex list-none items-center gap-6 border-b border-border-1 p-0">
          {flat.map((node, i) => {
            const active = isActive(node.href, currentPath) || hasActiveChild(node, currentPath);
            const tabClass = cn(HTAB, active ? HTAB_ACTIVE : HTAB_IDLE);
            const inner = (
              <>
                {node.icon && (
                  <span aria-hidden className="shrink-0">
                    {node.icon}
                  </span>
                )}
                {node.title}
                {node.trailing && <span className="shrink-0">{node.trailing}</span>}
              </>
            );
            return (
              <li key={nodeKey(node, i)} className="list-none">
                {node.href ? (
                  <LinkTag
                    href={node.href}
                    aria-current={active ? 'page' : undefined}
                    className={tabClass}
                  >
                    {inner}
                  </LinkTag>
                ) : (
                  // No destination, and horizontal renders no children to
                  // toggle — a label, not a link. An `href="#"` would look
                  // like one and jump to the top of the page.
                  <span className={cn(tabClass, 'cursor-default')}>{inner}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={cn('text-[14.5px]', className)}>
      {resolvedGroups.map((group, index) => (
        // Index is always part of the key: two groups may share a label.
        <div key={`${group.label ?? 'group'}-${index}`} className={index > 0 ? 'mt-6' : undefined}>
          {group.label &&
            (iconOnly ? (
              // In the rail, a hairline stands in for the group label.
              index > 0 && <div aria-hidden className="mx-2 mb-2 h-px bg-border-1" />
            ) : (
              <div className={GROUP_LABEL}>{group.label}</div>
            ))}
          <ul className="space-y-0.5">
            {group.items.map((node, i) => (
              <NavTreeRow
                key={nodeKey(node, i)}
                node={node}
                branchKey={branchKey(node, `g${index}`, i)}
                currentPath={currentPath}
                iconOnly={iconOnly}
                expansion={expansion}
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

/**
 * Expansion key: `id`, else `href`, else a string `title` — these are what
 * `expandedKeys` addresses, so a title shared across groups needs an `id`.
 * Unnamed branches fall back to their path from the root, which can't collide.
 */
function branchKey(node: NavTreeItem, parentKey: string, index: number): string {
  return (
    node.id ??
    node.href ??
    (typeof node.title === 'string' ? node.title : `${parentKey}/${index}`)
  );
}

/** `in` doesn't narrow past the `?: never` guards on the other kinds — explicit predicates do. */
const isContentItem = (node: NavTreeItem): node is NavTreeContentItem => 'content' in node;
const isContextItem = (node: NavTreeItem): node is NavTreeContextItem => 'context' in node;

interface Expansion {
  isOpen: (node: NavTreeLinkItem, key: string, depth: number) => boolean;
  toggle: (node: NavTreeLinkItem, key: string, depth: number) => void;
}

/** The full set of open branch keys under the given rule — for `onExpandedChange`. */
function collectOpenKeys(groups: NavTreeGroup[], isOpen: Expansion['isOpen']): Set<string> {
  const open = new Set<string>();
  const walk = (nodes: NavTreeItem[], parentKey: string, depth: number) => {
    nodes.forEach((node, i) => {
      if (isContentItem(node) || isContextItem(node) || !node.children?.length) return;
      const key = branchKey(node, parentKey, i);
      if (isOpen(node, key, depth)) open.add(key);
      walk(node.children, key, depth + 1);
    });
  };
  groups.forEach((group, i) => walk(group.items, `g${i}`, 0));
  return open;
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
  /** Expansion key of this row (see `branchKey`). */
  branchKey: string;
  currentPath?: string;
  iconOnly?: boolean;
  expansion: Expansion;
  LinkComponent?: NavTreeProps['LinkComponent'];
  depth: number;
}

function NavTreeRow({
  node,
  branchKey: key,
  currentPath,
  iconOnly,
  expansion,
  LinkComponent,
  depth,
}: Readonly<NavTreeRowProps>) {
  const paddingLeft = `${0.75 + depth * 0.75}rem`;

  // Arbitrary content slot (e.g. a group filter) — plain node, no row chrome.
  // The rail hides it, matching the design (the filter lives in the wide
  // sidebar only).
  if (isContentItem(node)) {
    if (iconOnly) return null;
    return (
      <li className="py-1 pr-1" style={{ paddingLeft }}>
        {node.content}
      </li>
    );
  }

  // Context row: the record's name in the mono eyebrow style, optional
  // close button. Hidden in the rail, like `content`.
  if (isContextItem(node)) {
    if (iconOnly) return null;
    return (
      <li className="flex items-start gap-2 py-1.5 pr-1" style={{ paddingLeft }}>
        <span className="min-w-0 flex-1 truncate pt-0.5 font-mono text-xs leading-snug text-(--text-subtle)">
          {node.context}
        </span>
        {node.onClose && (
          <ActionButton
            variant="ghost"
            size="sm"
            round
            ariaLabel={node.closeLabel ?? 'Close'}
            onPress={node.onClose}
          >
            <X size={14} />
          </ActionButton>
        )}
      </li>
    );
  }

  const hasChildren = !!node.children?.length;
  const active = isActive(node.href, currentPath);
  const containsActive = hasActiveChild(node, currentPath);
  const isOpen = hasChildren && expansion.isOpen(node, key, depth);
  const toggle = () => expansion.toggle(node, key, depth);

  const LinkTag = (LinkComponent ?? 'a') as React.ElementType;

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

  // Icon rail: one centered icon per top-level row — title becomes the
  // accessible name + native tooltip, children are not rendered, and a row
  // that contains the active page is itself marked active.
  if (iconOnly) {
    const railActive = active || containsActive;
    // Accessible name for the icon row: string title, else id, else href —
    // so a rail row is never announced empty.
    const railLabel = titleText ?? node.href;
    const rowClass = cn(ROW, 'justify-center px-2', railActive ? ROW_ACTIVE : ROW_IDLE);
    const inner = node.icon ? (
      <span aria-hidden className="shrink-0">
        {node.icon}
      </span>
    ) : (
      <span aria-hidden className="text-sm font-semibold">
        {(railLabel ?? '·').charAt(0)}
      </span>
    );
    return (
      <li>
        {node.href ? (
          <LinkTag
            href={node.href}
            aria-label={railLabel}
            title={railLabel}
            aria-current={active ? 'page' : undefined}
            className={rowClass}
          >
            {inner}
          </LinkTag>
        ) : (
          <span aria-label={railLabel} title={railLabel} className={cn(rowClass, 'cursor-default')}>
            {inner}
          </span>
        )}
      </li>
    );
  }

  if (!hasChildren) {
    const rowClass = cn(ROW, active ? ROW_ACTIVE : ROW_IDLE);
    const inner = (
      <>
        {iconNode}
        <span className="min-w-0 flex-1 truncate">{node.title}</span>
        {trailingNode}
      </>
    );
    return (
      <li>
        {node.href ? (
          <LinkTag
            href={node.href}
            aria-current={active ? 'page' : undefined}
            className={rowClass}
            style={{ paddingLeft }}
          >
            {inner}
          </LinkTag>
        ) : (
          // Nothing to go to and nothing to toggle — a plain row (an empty
          // state, a heading among the items). `href="#"` would offer a link
          // that jumps to the top of the page and pushes a history entry.
          <span className={cn(rowClass, 'cursor-default')} style={{ paddingLeft }}>
            {inner}
          </span>
        )}
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
              branchKey={branchKey(child, key, i)}
              currentPath={currentPath}
              iconOnly={iconOnly}
              expansion={expansion}
              LinkComponent={LinkComponent}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
