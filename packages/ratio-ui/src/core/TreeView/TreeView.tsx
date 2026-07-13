// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import { NavTree, type NavTreeItem, type NavTreeProps } from '../NavTree';

/** @deprecated Renamed — use `NavTreeItem` from `core/NavTree`. */
export type TreeViewNode = NavTreeItem;

/**
 * @deprecated Renamed — use `NavTreeProps` from `core/NavTree`
 * (`tree` is now `items`, and grouped sections are available via `groups`).
 */
export interface TreeViewProps extends Omit<NavTreeProps, 'groups' | 'items'> {
  /** Hierarchical tree of navigation nodes. */
  tree: NavTreeItem[];
}

/**
 * @deprecated `TreeView` was renamed to {@link NavTree}, which adds grouped
 * sections with eyebrow labels and per-item icons. This alias maps `tree` to
 * `items` and will be removed in a future major.
 */
export function TreeView({ tree, ...rest }: Readonly<TreeViewProps>) {
  return <NavTree items={tree} {...rest} />;
}
