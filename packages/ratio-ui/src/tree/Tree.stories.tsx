// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { File, Folder, FolderOpen } from '../icons';
import { Tree, type TreeNode, type TreeNodeState } from './Tree';

const meta: Meta<typeof Tree> = {
  title: 'Tree/Tree (Beta)',
  component: Tree,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tree>;

/**
 * Standard icons via `renderNode(node, state)`: branches show an open/closed
 * folder from `state.isExpanded`; leaves get a per-domain icon.
 */
function iconLabel(label: ReactNode, state: TreeNodeState, leaf: ReactNode) {
  const icon = state.hasChildren ? (
    state.isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
  ) : (
    leaf
  );
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="inline-flex text-(--text-muted)">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
}

/* ===================================================== branches of science ==
 * The demo data is itself a small lesson: how human knowledge divides into
 * natural, formal, and social sciences. A branch (an area of study) has
 * children; a leaf is a discipline. Every story below reads this one tree — the
 * only things that change are which capabilities of `Tree` are switched on. */

interface Subject extends TreeNode {
  name: string;
  children?: Subject[];
}

const subjects: Subject[] = [
  {
    id: 'natural',
    name: 'Natural sciences',
    children: [
      {
        id: 'physics',
        name: 'Physics',
        children: [
          { id: 'mechanics', name: 'Classical mechanics' },
          { id: 'electromagnetism', name: 'Electromagnetism' },
          { id: 'quantum', name: 'Quantum mechanics' },
        ],
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        children: [
          { id: 'organic', name: 'Organic chemistry' },
          { id: 'inorganic', name: 'Inorganic chemistry' },
        ],
      },
      {
        id: 'biology',
        name: 'Biology',
        children: [
          { id: 'genetics', name: 'Genetics' },
          { id: 'ecology', name: 'Ecology' },
        ],
      },
    ],
  },
  {
    id: 'formal',
    name: 'Formal sciences',
    children: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        children: [
          { id: 'algebra', name: 'Algebra' },
          { id: 'geometry', name: 'Geometry' },
          { id: 'analysis', name: 'Analysis' },
        ],
      },
      {
        id: 'computer-science',
        name: 'Computer science',
        children: [
          { id: 'algorithms', name: 'Algorithms' },
          { id: 'machine-learning', name: 'Machine learning' },
        ],
      },
      { id: 'logic', name: 'Logic' },
    ],
  },
  {
    id: 'social',
    name: 'Social sciences',
    children: [
      { id: 'psychology', name: 'Psychology' },
      {
        id: 'economics',
        name: 'Economics',
        children: [
          { id: 'microeconomics', name: 'Microeconomics' },
          { id: 'macroeconomics', name: 'Macroeconomics' },
        ],
      },
      { id: 'sociology', name: 'Sociology' },
    ],
  },
];

const shared = {
  'aria-label': 'Branches of science',
  items: subjects,
  getLabel: (n: Subject) => n.name,
  renderNode: (n: Subject, s: TreeNodeState) => iconLabel(n.name, s, <File size={16} />),
} as const;

/** Default: a plain, read-only tree — expand/collapse and keyboard nav only. */
export const Display: Story = {
  render: () => (
    <div className="max-w-105">
      <Tree<Subject> {...shared} />
    </div>
  ),
};

const sizeLabel = {
  margin: '0 0 8px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
} as const;

/** The three sizes: `sm` · `md` (default) · `lg` — same scale as Button. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div className="max-w-105">
        <p style={sizeLabel}>Small</p>
        <Tree<Subject> {...shared} size="sm" aria-label="Branches of science (small)" />
      </div>
      <div className="max-w-105">
        <p style={sizeLabel}>Medium (default)</p>
        <Tree<Subject> {...shared} size="md" aria-label="Branches of science (medium)" />
      </div>
      <div className="max-w-105">
        <p style={sizeLabel}>Large</p>
        <Tree<Subject> {...shared} size="lg" aria-label="Branches of science (large)" />
      </div>
    </div>
  ),
};

/** Single selection — click a discipline to select it. */
export const SingleSelect: Story = {
  render: () => (
    <div className="max-w-105">
      <Tree<Subject> {...shared} selectionMode="single" />
    </div>
  ),
};

/** Multiple selection with checkboxes — tick the fields you want to follow. */
export const MultiSelectCheckboxes: Story = {
  render: () => (
    <div className="max-w-105">
      <Tree<Subject> {...shared} selectionMode="multiple" showCheckboxes />
    </div>
  ),
};

/** Sortable: drag a row to reorder within a level, or drop onto a row to nest. */
export const Sortable: Story = {
  render: () => (
    <div className="max-w-105">
      <Tree<Subject>
        {...shared}
        sortable
        selectionMode="single"
        onChange={(items) => console.log('tree changed', items)}
      />
    </div>
  ),
};

/** Sortable, but only areas (branches) accept children dropped onto them. */
export const SortableAreasOnly: Story = {
  render: () => (
    <div className="max-w-105">
      <Tree<Subject>
        {...shared}
        sortable
        selectionMode="single"
        canHaveChildren={(n) => Array.isArray(n.children)}
      />
    </div>
  ),
};

/** Small size + whole-row drag (no handle) — the leaner look. */
export const SmallNoHandle: Story = {
  render: () => (
    <div className="max-w-105">
      <Tree<Subject>
        {...shared}
        sortable
        dragHandle={false}
        size="sm"
        selectionMode="multiple"
        showCheckboxes
      />
    </div>
  ),
};
