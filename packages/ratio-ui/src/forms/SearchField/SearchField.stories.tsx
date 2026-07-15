// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { NavTree, type NavTreeItem } from '../../core/NavTree';
import { SearchField } from './SearchField';

const meta: Meta<typeof SearchField> = {
  title: 'Forms/SearchField',
  component: SearchField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible search field with built-in debouncing (300ms default) and a clear button that appears when the field has content. Built on react-aria-components.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic usage — type something to see the clear button appear. */
export const Basic: Story = {
  render: () => (
    <SearchField placeholder="Search the archive…" aria-label="Search the archive" />
  ),
};

/**
 * `shortcut` focuses the field from anywhere — press ⌘K (or Ctrl+K) and the
 * `Kbd` hint shows the platform-correct label while the field is idle. Built
 * on the generic `useKeyboardShortcut` hook from `hooks/`.
 */
export const WithShortcut: Story = {
  render: () => (
    <SearchField
      shortcut="mod+k"
      placeholder="Search the archive…"
      aria-label="Search the archive"
    />
  ),
};

/** The three sizes: `sm` (sidebars/toolbars) · `md` (default) · `lg`. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <SearchField size="sm" placeholder="Filter types…" aria-label="Filter (small)" />
      <SearchField size="md" placeholder="Search manuscripts…" aria-label="Search (medium)" />
      <SearchField size="lg" placeholder="Search everything…" aria-label="Search (large)" />
    </div>
  ),
};

// The scholars of the Library of Alexandria — the full catalogue, and the
// few consulted so often they stay pinned.
const SCHOLARS: NavTreeItem[] = [
  { title: 'Hypatia — astronomy, mathematics', href: '/hypatia' },
  { title: 'Euclid — geometry', href: '/euclid' },
  { title: 'Ptolemy — astronomy, geography', href: '/ptolemy' },
  { title: 'Eratosthenes — geodesy, chief librarian', href: '/eratosthenes' },
  { title: 'Aristarchus — heliocentrism', href: '/aristarchus' },
  { title: 'Callimachus — the Pinakes catalogue', href: '/callimachus' },
  { title: 'Herophilus — anatomy', href: '/herophilus' },
  { title: 'Zenodotus — first librarian', href: '/zenodotus' },
];
const PINNED = SCHOLARS.slice(0, 3);

/**
 * The sidebar-filter pattern: a compact `SearchField` live-filtering a
 * `NavTree`. Empty query shows the pinned entries; typing switches the group
 * to "Matches" (with an empty state when nothing matches). Filtering is plain
 * consumer logic — NavTree is data-driven.
 */
export const FilterNavigation: Story = {
  render: function FilterNavigationStory() {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();
    const matches = SCHOLARS.filter((s) => (s.title as string).toLowerCase().includes(q));

    return (
      // Fixed height so the centered story doesn't re-center (jump) as the
      // list grows and shrinks — tall enough for the full 8-scholar list.
      <div className="flex min-h-100 w-64 flex-col gap-2">
        <SearchField
          size="sm"
          value={query}
          onChange={setQuery}
          debounce={150}
          placeholder="Filter scholars…"
          aria-label="Filter scholars"
        />
        {q && matches.length === 0 ? (
          <p className="px-3 py-2 text-[13px] italic text-(--text-subtle)">
            No scholars match the filter.
          </p>
        ) : (
          <NavTree
            aria-label="Scholars"
            currentPath="/hypatia"
            groups={[
              q
                ? { label: 'Matches', items: matches }
                : { label: 'Frequently consulted', items: PINNED },
            ]}
          />
        )}
      </div>
    );
  },
};
