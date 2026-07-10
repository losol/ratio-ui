// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import type { ReactElement, ReactNode } from 'react';
import {
  Button,
  Checkbox,
  Collection,
  type Key,
  type Selection,
  Tree as AriaTree,
  TreeItem,
  TreeItemContent,
} from 'react-aria-components';
import { Check, ChevronRight, GripVertical, Minus } from '../icons';
import { cn } from '../utils/cn';
import { type TreeNode, type TreeStateItem, useSortableTree } from './useSortableTree';
import './Tree.css';

export type { TreeNode };

/** Per-row state handed to `renderNode` — enough to pick a node icon. */
export interface TreeNodeState {
  /** Whether this (container) row is expanded. */
  isExpanded: boolean;
  /** Whether this row has children. */
  hasChildren: boolean;
  /** Depth in the tree, 1 = top level. */
  level: number;
  /** Whether this row is selected. */
  isSelected: boolean;
}

export interface TreeProps<T extends TreeNode> {
  /** Accessible label for the tree. */
  'aria-label': string;
  /** Initial tree data (uncontrolled — use `onChange` to persist). */
  items: T[];
  /** Fires with the new nested data after a drag reorder or reparent. */
  onChange?: (items: T[]) => void;
  /** Render a row's content. Receives per-row state for icon choices. Defaults to the node id. */
  renderNode?: (node: T, state: TreeNodeState) => ReactNode;
  /** Plain-text label per node (drag preview + typeahead). Defaults to the id. */
  getLabel?: (node: T) => string;
  /**
   * Enable drag-to-reorder and drop-to-reparent (pointer + keyboard).
   * Off by default — a plain display/selection tree until you opt in.
   */
  sortable?: boolean;
  /**
   * Show the drag handle when `sortable`. When false, the whole row is the
   * drag source (matches designs without a visible handle). Default true.
   */
  dragHandle?: boolean;
  /** Row density. `compact` tightens row height. Default `comfortable`. */
  density?: 'comfortable' | 'compact';
  /** Whether a node may accept children dropped onto it. Default: always. */
  canHaveChildren?: (node: T) => boolean;
  selectionMode?: 'none' | 'single' | 'multiple';
  /** `toggle` = click/checkbox selects; `replace` = click replaces selection. */
  selectionBehavior?: 'toggle' | 'replace';
  /** Render a checkbox per row. Only meaningful when selection is enabled. */
  showCheckboxes?: boolean;
  /** Controlled selection. Pair with `onSelectionChange`; omit for uncontrolled. */
  selectedKeys?: Selection;
  /** Initial selection when uncontrolled. Ignored if `selectedKeys` is set. */
  defaultSelectedKeys?: 'all' | Iterable<Key>;
  /** Fires with the new selection after a click/checkbox change. */
  onSelectionChange?: (keys: Selection) => void;
  /** Controlled expansion. Pair with `onExpandedChange`; omit for uncontrolled. */
  expandedKeys?: Iterable<Key>;
  /** Initial expansion when uncontrolled. Ignored if `expandedKeys` is set. Default `all`. */
  defaultExpandedKeys?: 'all' | Iterable<Key>;
  /** Fires with the new expanded set after an expand/collapse. */
  onExpandedChange?: (keys: Set<Key>) => void;
  className?: string;
}

/**
 * Tree — a generic, accessible hierarchical tree.
 *
 * One primitive, composable capabilities (all built on React Aria's `Tree`):
 * - **display** — the default: expand/collapse, keyboard navigation.
 * - **selection** — `selectionMode="single" | "multiple"`, optional
 *   `showCheckboxes`. Controllable via `selectedKeys`/`onSelectionChange`.
 * - **sortable** — `sortable` enables drag-to-reorder and drop-to-reparent,
 *   with pointer *and* keyboard support and screen-reader announcements.
 *
 * Expansion is controllable via `expandedKeys`/`onExpandedChange` — the hook
 * for toolbar affordances like expand-all/collapse-all or search auto-expand.
 *
 * Domain-agnostic: give it `{ id, children }` nodes and a `renderNode`. Meant
 * as the substrate for builders like a form/questionnaire editor — the domain
 * mapping stays in the consuming app.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function Tree<T extends TreeNode>(props: TreeProps<T>): ReactElement {
  const {
    'aria-label': ariaLabel,
    items,
    onChange,
    renderNode,
    getLabel,
    sortable = false,
    dragHandle = true,
    density = 'comfortable',
    canHaveChildren,
    selectionMode = 'none',
    selectionBehavior,
    showCheckboxes = false,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    expandedKeys,
    defaultExpandedKeys = 'all',
    onExpandedChange,
    className,
  } = props;

  const { tree, dragAndDropHooks } = useSortableTree<T>({
    items,
    onChange,
    canHaveChildren,
    getLabel,
  });

  const withCheckbox = showCheckboxes && selectionMode !== 'none';

  const renderItem = (node: TreeStateItem<T>): ReactElement => (
    <TreeItem
      id={node.key}
      textValue={getLabel ? getLabel(node.value) : node.value.id}
      className="tree__item"
    >
      <TreeItemContent>
        {({
          hasChildItems,
          isExpanded,
          level,
          isSelected,
          isFocusVisible,
          isHovered,
          isDragging,
          isDropTarget,
        }) => (
          <div
            className="tree__row"
            data-selected={isSelected || undefined}
            data-focus-visible={isFocusVisible || undefined}
            data-hovered={isHovered || undefined}
            data-dragging={isDragging || undefined}
            data-drop-target={isDropTarget || undefined}
          >
            {sortable && dragHandle && (
              <Button slot="drag" className="tree__handle" aria-label="Drag to reorder">
                <GripVertical size={15} aria-hidden />
              </Button>
            )}
            {withCheckbox && (
              <Checkbox slot="selection" className="tree__checkbox">
                {({ isSelected, isIndeterminate }) => (
                  <span
                    className="tree__checkbox-box"
                    data-selected={isSelected || undefined}
                    data-indeterminate={isIndeterminate || undefined}
                    aria-hidden
                  >
                    {isIndeterminate ? (
                      <Minus size={13} strokeWidth={3} />
                    ) : isSelected ? (
                      <Check size={13} strokeWidth={3} />
                    ) : null}
                  </span>
                )}
              </Checkbox>
            )}
            {hasChildItems ? (
              <Button
                slot="chevron"
                className="tree__chevron"
                data-open={isExpanded || undefined}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronRight size={16} />
              </Button>
            ) : (
              <span className="tree__chevron tree__chevron--leaf" aria-hidden />
            )}
            <span className="tree__label">
              {renderNode
                ? renderNode(node.value, {
                    isExpanded,
                    hasChildren: hasChildItems,
                    level,
                    isSelected,
                  })
                : node.value.id}
            </span>
          </div>
        )}
      </TreeItemContent>
      <Collection items={[...(node.children ?? [])]}>{renderItem}</Collection>
    </TreeItem>
  );

  return (
    <AriaTree
      aria-label={ariaLabel}
      items={tree.items}
      dragAndDropHooks={sortable ? dragAndDropHooks : undefined}
      selectionMode={selectionMode}
      selectionBehavior={selectionBehavior ?? (withCheckbox ? 'toggle' : undefined)}
      selectedKeys={selectedKeys}
      defaultSelectedKeys={selectedKeys === undefined ? defaultSelectedKeys : undefined}
      onSelectionChange={onSelectionChange}
      // `expandedKeys` (controlled) and `defaultExpandedKeys` are mutually
      // exclusive in React Aria — only pass the default when uncontrolled.
      expandedKeys={expandedKeys}
      defaultExpandedKeys={expandedKeys === undefined ? defaultExpandedKeys : undefined}
      onExpandedChange={onExpandedChange}
      className={cn('tree', density === 'compact' && 'tree--compact', className)}
    >
      {renderItem}
    </AriaTree>
  );
}
