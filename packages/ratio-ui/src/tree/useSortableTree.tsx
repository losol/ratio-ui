// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useEffect, useRef } from 'react';
import {
  DropIndicator,
  type Key,
  type TextDropItem,
  useDragAndDrop,
} from 'react-aria-components';
import { useTreeData } from 'react-stately';

/**
 * A tree node. Identity is `id`; a `children` array marks the node as a
 * container. Extend this with your own fields and pass a `renderNode`.
 */
export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

/**
 * A node as held by the tree state — the original `value` plus its resolved
 * `children`. Structurally a subset of React Stately's internal tree node, so
 * we avoid depending on an unexported type.
 */
export interface TreeStateItem<T extends TreeNode> {
  key: Key;
  value: T;
  children: readonly TreeStateItem<T>[] | null;
}

/** Internal drag payload — carries the dragged node's key. */
const DRAG_TYPE = 'application/x-ratio-tree-node';

export interface UseSortableTreeOptions<T extends TreeNode> {
  items: T[];
  /** Called with the new nested data after any reorder/reparent. */
  onChange?: (items: T[]) => void;
  /** Whether a node may accept children dropped onto it. Default: always. */
  canHaveChildren?: (node: T) => boolean;
  /** Plain-text label for the drag preview. Defaults to the node id. */
  getLabel?: (node: T) => string;
}

/** Rebuild the nested `T[]` from React Stately's tree nodes. */
function serialize<T extends TreeNode>(nodes: readonly TreeStateItem<T>[]): T[] {
  return nodes.map((node) => {
    const children = node.children ?? [];
    // Preserve container-ness: a node stays/became a container if it had a
    // children array to begin with, or gained children via a drop.
    const isContainer = Array.isArray(node.value.children) || children.length > 0;
    return isContainer ? ({ ...node.value, children: serialize(children) } as T) : node.value;
  });
}

/**
 * State + drag-and-drop wiring for {@link Tree}. Wraps React Stately's
 * `useTreeData` (reorder/reparent operations) and React Aria's
 * `useDragAndDrop` (pointer + keyboard DnD). Kept separate so the tree can be
 * driven headlessly or rendered by a different shell.
 *
 * @beta Prop shape may change before release.
 */
export function useSortableTree<T extends TreeNode>(options: UseSortableTreeOptions<T>) {
  const { items, onChange, canHaveChildren, getLabel } = options;

  const tree = useTreeData<T>({
    initialItems: items,
    getKey: (item) => item.id,
    getChildren: (item) => (item.children ?? []) as T[],
  });

  // Uncontrolled internally; notify the parent after any mutation. Skip mount.
  // Keep the latest onChange in a ref (updated in an effect, not during
  // render) so the tree.items effect doesn't re-fire when onChange changes.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onChangeRef.current?.(serialize(tree.items));
  }, [tree.items]);

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => {
        const node = tree.getItem(key);
        const label = node && getLabel ? getLabel(node.value) : String(key);
        return { [DRAG_TYPE]: String(key), 'text/plain': label };
      }),
    renderDropIndicator: (target) => (
      <DropIndicator target={target} className="tree__drop-indicator" />
    ),
    shouldAcceptItemDrop: (target) => {
      // `canHaveChildren` gates reparenting only (drop *on* a node). Reorder
      // positions (before/after) must always be accepted, even next to a leaf.
      if (target.dropPosition !== 'on' || !canHaveChildren) return true;
      const node = tree.getItem(target.key);
      return node ? canHaveChildren(node.value) : false;
    },
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        tree.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        tree.moveAfter(e.target.key, e.keys);
      }
    },
    async onItemDrop(e) {
      const keys = await Promise.all(
        e.items
          .filter((item): item is TextDropItem => item.kind === 'text' && item.types.has(DRAG_TYPE))
          .map((item) => item.getText(DRAG_TYPE)),
      );
      // Reparent the dragged nodes as the first children of the drop target,
      // advancing the index so their original relative order is preserved.
      let index = 0;
      for (const key of keys) {
        if (key) tree.move(key, e.target.key, index++);
      }
    },
  });

  return { tree, dragAndDropHooks };
}
