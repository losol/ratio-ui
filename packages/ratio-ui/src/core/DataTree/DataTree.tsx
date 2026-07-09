// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { ChevronRight } from '../../icons';
import './DataTree.css';

interface DataNodeBase {
  /** Optional identity; falls back to position when omitted. */
  id?: string;
  /** Label shown on the left. */
  term: React.ReactNode;
}

/**
 * A node is one of three shapes: a **leaf** (`value`), a **group**
 * (`children`), or **empty** (neither → em dash). `value` and `children`
 * are mutually exclusive — the union enforces it at the type level.
 */
export type DataNode = DataNodeBase &
  (
    | { value?: React.ReactNode; children?: never }
    | { value?: never; children: DataNode[] }
  );

export interface DataTreeProps {
  nodes: DataNode[];
  /**
   * Allow nested groups to collapse. Uses native `<details>`, so there's
   * no client-side state — open/closed is owned by the browser. Default off.
   */
  collapsible?: boolean;
  /**
   * Nesting levels open by default when `collapsible` (a group at `depth`
   * is open when `depth < defaultOpenDepth`). Top-level groups are depth 0.
   * Default 1.
   */
  defaultOpenDepth?: number;
  /** Ochre left rule on nested groups instead of the neutral border. Default true. */
  accentRule?: boolean;
  /** Divider line under leaf rows. Default true. */
  rowDividers?: boolean;
  className?: string;
}

// Empty children ([]) render as a leaf (em dash), not an empty group.
const isGroup = (node: DataNode): boolean =>
  Array.isArray(node.children) && node.children.length > 0;

function Leaf({ node }: { node: DataNode }): React.ReactElement {
  const empty = node.value == null || node.value === '';
  return (
    <div className="datatree__row">
      <dt className="datatree__term">{node.term}</dt>
      <dd className="datatree__value">
        {empty ? <span className="datatree__dash">—</span> : node.value}
      </dd>
    </div>
  );
}

/**
 * One level, plain semantics: a single <dl> holding leaf rows and nested
 * groups (group term = <dt>, nested tree = <dd>). Used when not collapsible.
 */
function PlainLevel({
  nodes,
  path,
}: {
  nodes: DataNode[];
  path: string;
}): React.ReactElement {
  return (
    <dl className="datatree__dl">
      {nodes.map((node, i) => {
        const key = `${path}/${node.id ?? i}`;
        if (isGroup(node)) {
          return (
            <div className="datatree__group" key={key}>
              <dt className="datatree__term datatree__term--group">{node.term}</dt>
              <dd className="datatree__nest">
                <PlainLevel nodes={node.children!} path={key} />
              </dd>
            </div>
          );
        }
        return <Leaf node={node} key={key} />;
      })}
    </dl>
  );
}

/**
 * One level, collapsible: consecutive leaves are grouped into a <dl>, and
 * each group becomes a native <details> (open by depth). This keeps valid
 * markup (no <details> inside <dl>) and needs no JavaScript.
 */
function CollapsibleLevel({
  nodes,
  depth,
  path,
  defaultOpenDepth,
}: {
  nodes: DataNode[];
  depth: number;
  path: string;
  defaultOpenDepth: number;
}): React.ReactElement {
  const out: React.ReactNode[] = [];
  let leafRun: React.ReactNode[] = [];

  const flush = () => {
    if (leafRun.length) {
      out.push(
        <dl className="datatree__dl" key={`dl-${out.length}`}>
          {leafRun}
        </dl>
      );
      leafRun = [];
    }
  };

  nodes.forEach((node, i) => {
    const key = `${path}/${node.id ?? i}`;
    if (isGroup(node)) {
      flush();
      out.push(
        <details className="datatree__group" key={key} open={depth < defaultOpenDepth}>
          <summary className="datatree__toggle">
            <ChevronRight size={14} aria-hidden className="datatree__chev" />
            <span className="datatree__toggle-label">{node.term}</span>
          </summary>
          <div className="datatree__nest">
            <CollapsibleLevel
              nodes={node.children!}
              depth={depth + 1}
              path={key}
              defaultOpenDepth={defaultOpenDepth}
            />
          </div>
        </details>
      );
    } else {
      leafRun.push(<Leaf node={node} key={key} />);
    }
  });
  flush();

  return <div className="datatree__level">{out}</div>;
}

/**
 * Recursive term/value renderer for nested data. Owns layout, indentation
 * and dividers; the caller pre-renders every leaf `value`. Renders as a
 * server component — collapsing uses native `<details>`, so there's no
 * `'use client'`.
 */
export function DataTree({
  nodes,
  collapsible = false,
  defaultOpenDepth = 1,
  accentRule = true,
  rowDividers = true,
  className,
}: DataTreeProps): React.ReactElement {
  const classes = [
    'datatree',
    accentRule && 'datatree--accent',
    !rowDividers && 'datatree--no-dividers',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {collapsible ? (
        <CollapsibleLevel
          nodes={nodes}
          depth={0}
          path="root"
          defaultOpenDepth={defaultOpenDepth}
        />
      ) : (
        <PlainLevel nodes={nodes} path="root" />
      )}
    </div>
  );
}
