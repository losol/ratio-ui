// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, useMemo, useState } from 'react';
import type { Key, Selection } from 'react-aria-components';
import { Badge } from '../core/Badge';
import { Kbd } from '../core/Kbd';
import { ChevronDown, ChevronUp, File, Folder, FolderOpen, MoreHorizontal, Search, X } from '../icons';
import { Tree, type TreeNode, type TreeNodeState } from './Tree';

/**
 * # Branches of science — a composed knowledge base
 *
 * The demo is also a lesson: a map of how human knowledge divides into the
 * natural, formal, social, and applied sciences. Browse it, search it, tick the
 * fields you care about, and drag to reorganise.
 *
 * This is **not** a library component — it's a Storybook composition showing how
 * far the generic `Tree` primitive reaches using only its public API plus
 * existing Ratio UI primitives (`Badge`, `Kbd`). Anything domain-specific (the
 * toolbar, search filtering, the selection bar, per-row icons/count/actions)
 * lives here in the consumer, never in `Tree`.
 *
 * What it exercises from the primitive:
 * - **controlled `expandedKeys` / `onExpandedChange`** → expand-all /
 *   collapse-all, and auto-expanding search matches.
 * - **controlled `selectedKeys` / `onSelectionChange`** → the selection bar and
 *   "Clear".
 * - **`renderNode` state incl. `isSelected`** → area/field icons, a discipline
 *   count badge, and a hover action affordance.
 * - **`sortable`** → drag to reorganise.
 *
 * Note: `items` seeds the tree once (uncontrolled internally), so search
 * remounts it (`key={q}`) to re-seed the filtered set, and structural edits
 * (add / rename / delete) aren't wired here — driving `items` from outside is
 * the natural next step for a full editor.
 */
const meta: Meta = {
  title: 'Tree/Knowledge base',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

/* ── data: the map of knowledge ───────────────────────────────────────── */

interface Subject extends TreeNode {
  name: string;
  children?: Subject[];
}

const s = (id: string, name: string, children?: Subject[]): Subject =>
  children ? { id, name, children } : { id, name };

const KNOWLEDGE: Subject[] = [
  s('natural', 'Natural sciences', [
    s('physics', 'Physics', [
      s('mechanics', 'Classical mechanics'),
      s('electromagnetism', 'Electromagnetism'),
      s('thermodynamics', 'Thermodynamics'),
      s('quantum', 'Quantum mechanics'),
    ]),
    s('chemistry', 'Chemistry', [
      s('organic', 'Organic chemistry'),
      s('inorganic', 'Inorganic chemistry'),
      s('physical-chem', 'Physical chemistry'),
    ]),
    s('biology', 'Biology', [
      s('molecular', 'Molecular biology'),
      s('genetics', 'Genetics'),
      s('ecology', 'Ecology'),
      s('evolution', 'Evolutionary biology'),
    ]),
    s('earth', 'Earth science', [
      s('geology', 'Geology'),
      s('meteorology', 'Meteorology'),
      s('oceanography', 'Oceanography'),
    ]),
  ]),
  s('formal', 'Formal sciences', [
    s('mathematics', 'Mathematics', [
      s('algebra', 'Algebra'),
      s('geometry', 'Geometry'),
      s('analysis', 'Analysis'),
      s('number-theory', 'Number theory'),
    ]),
    s('logic', 'Logic'),
    s('computer-science', 'Computer science', [
      s('algorithms', 'Algorithms'),
      s('data-structures', 'Data structures'),
      s('machine-learning', 'Machine learning'),
    ]),
    s('statistics', 'Statistics'),
  ]),
  s('social', 'Social sciences', [
    s('psychology', 'Psychology'),
    s('economics', 'Economics', [
      s('microeconomics', 'Microeconomics'),
      s('macroeconomics', 'Macroeconomics'),
    ]),
    s('sociology', 'Sociology'),
    s('anthropology', 'Anthropology'),
    s('political-science', 'Political science'),
  ]),
  s('applied', 'Applied sciences', [
    s('engineering', 'Engineering', [
      s('mechanical', 'Mechanical engineering'),
      s('electrical', 'Electrical engineering'),
      s('civil', 'Civil engineering'),
    ]),
    s('medicine', 'Medicine'),
    s('agronomy', 'Agronomy'),
  ]),
];

/* ── tree helpers (kept in the consumer, not the primitive) ───────────── */

const isBranch = (n: Subject): boolean => Array.isArray(n.children) && n.children.length > 0;

function leaves(n: Subject): Subject[] {
  if (!isBranch(n)) return [n];
  return n.children!.flatMap(leaves);
}

function branchKeys(nodes: Subject[], acc: Key[] = []): Key[] {
  for (const n of nodes) {
    if (isBranch(n)) {
      acc.push(n.id);
      branchKeys(n.children!, acc);
    }
  }
  return acc;
}

/** Prune to matches (keeping ancestors) and collect the branches to auto-expand. */
function filterTree(nodes: Subject[], q: string): { items: Subject[]; expand: Set<Key> } {
  const expand = new Set<Key>();
  const walk = (list: Subject[]): Subject[] => {
    const out: Subject[] = [];
    for (const n of list) {
      const selfMatch = n.name.toLowerCase().includes(q);
      if (!isBranch(n)) {
        if (selfMatch) out.push(n);
        continue;
      }
      if (selfMatch) {
        out.push(n); // whole subtree stays visible
        expand.add(n.id);
      } else {
        const kids = walk(n.children!);
        if (kids.length) {
          out.push({ ...n, children: kids });
          expand.add(n.id);
        }
      }
    }
    return out;
  };
  return { items: walk(nodes), expand };
}

/* ── chrome styles (inline tokens) ────────────────────────────────────── */

const ghostBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  height: '34px',
  padding: '0 12px',
  border: '1px solid var(--border-1)',
  borderRadius: '999px',
  background: 'var(--card)',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  cursor: 'pointer',
};

const seg = (active: boolean): CSSProperties => ({
  padding: '5px 12px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  background: active ? 'var(--primary)' : 'transparent',
  color: active ? 'var(--text-on-primary)' : 'var(--text-muted)',
});

/* ── the composition ──────────────────────────────────────────────────── */

function KnowledgeBase() {
  const [items, setItems] = useState<Subject[]>(KNOWLEDGE);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<Key>>(
    () => new Set(['natural', 'formal', 'social', 'applied']),
  );
  const [selected, setSelected] = useState<Selection>(() => new Set<Key>());
  const [checkboxes, setCheckboxes] = useState(true);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => filterTree(items, q), [items, q]);
  const shown = q ? filtered.items : items;
  const expandedKeys = q ? filtered.expand : expanded;

  const selCount = selected === 'all' ? -1 : selected.size;
  const hasSelection = selected === 'all' || selCount > 0;

  const renderRow = (node: Subject, state: TreeNodeState) => {
    const area = state.level === 1 && state.hasChildren;
    const color = area ? 'var(--accent)' : state.hasChildren ? 'var(--primary)' : 'var(--text-subtle)';
    return (
      <span
        className="group"
        style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}
      >
        <span aria-hidden style={{ display: 'inline-flex', color }}>
          {state.hasChildren ? (
            state.isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
          ) : (
            <File size={15} />
          )}
        </span>
        <span
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: area ? 'var(--font-serif)' : 'var(--font-body)',
            fontWeight: area ? 700 : state.hasChildren ? 600 : 400,
          }}
        >
          {node.name}
        </span>
        {state.hasChildren && <Badge variant="subtle">{leaves(node).length}</Badge>}
        <button
          type="button"
          aria-label="Actions"
          title="Actions (wired up in a full editor)"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            display: 'inline-flex',
            padding: '4px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-subtle)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <MoreHorizontal size={15} />
        </button>
      </span>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        background: 'var(--surface)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '820px', padding: '32px 20px' }}>
        <div style={{ margin: '0 0 18px 2px' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '28px',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Branches of science
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
            A map of how knowledge divides — search it, select fields, and drag to reorganise.
          </div>
        </div>

        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderBottom: '1px solid var(--border-1)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '170px', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '11px', display: 'flex', color: 'var(--text-subtle)', pointerEvents: 'none' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search fields…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 34px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--text)',
                  background: 'var(--card)',
                  border: '1px solid var(--border-1)',
                  borderRadius: 'var(--radius-full)',
                  outline: 'none',
                }}
              />
              {q.length > 0 && (
                <button
                  type="button"
                  title="Clear search"
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: '8px', display: 'flex', padding: '3px', border: 'none', background: 'transparent', color: 'var(--text-subtle)', cursor: 'pointer', borderRadius: '999px' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '4px',
                background: 'color-mix(in srgb, var(--text) 7%, transparent)',
                border: '1px solid var(--border-1)',
                borderRadius: '999px',
                padding: '3px',
              }}
            >
              <button type="button" style={seg(checkboxes)} onClick={() => setCheckboxes(true)}>
                Checkbox
              </button>
              <button type="button" style={seg(!checkboxes)} onClick={() => setCheckboxes(false)}>
                Click
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                title="Expand all"
                style={ghostBtn}
                onClick={() => setExpanded(new Set(branchKeys(items)))}
              >
                <ChevronDown size={16} />
              </button>
              <button type="button" title="Collapse all" style={ghostBtn} onClick={() => setExpanded(new Set())}>
                <ChevronUp size={16} />
              </button>
            </div>
          </div>

          {/* Selection bar */}
          {hasSelection && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 16px',
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                borderBottom: '1px solid var(--border-1)',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                {selCount === -1
                  ? 'All selected'
                  : `${selCount} ${selCount === 1 ? 'field' : 'fields'} selected`}
              </span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                style={{ marginLeft: 'auto', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Tree — remounts on query so the uncontrolled data re-seeds to the filtered set */}
          <div style={{ maxHeight: '440px', overflow: 'auto', padding: '8px' }}>
            <Tree<Subject>
              key={q || '__all__'}
              aria-label="Branches of science"
              items={shown}
              getLabel={(n) => n.name}
              renderNode={renderRow}
              sortable={q === ''}
              dragHandle={false}
              selectionMode="multiple"
              showCheckboxes={checkboxes}
              selectionBehavior={checkboxes ? 'toggle' : 'replace'}
              selectedKeys={selected}
              onSelectionChange={setSelected}
              expandedKeys={expandedKeys}
              onExpandedChange={(keys) => {
                if (!q) setExpanded(keys);
              }}
              onChange={(next) => {
                if (!q) setItems(next);
              }}
            />
          </div>

          {/* Footer hints */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              padding: '10px 16px',
              borderTop: '1px solid var(--border-1)',
              fontSize: '12.5px',
              color: 'var(--text-subtle)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Kbd>↑↓</Kbd> navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Kbd>→←</Kbd> expand / collapse
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Kbd>Space</Kbd> select
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Kbd>Drag</Kbd> move
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The full knowledge-base chrome, composed on `Tree` + Ratio UI primitives. */
export const BranchesOfScience: Story = {
  render: () => <KnowledgeBase />,
};
