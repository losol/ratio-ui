// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandPalette, type CommandPaletteItem } from './CommandPalette';

/**
 * A ⌘K command palette: a trigger button that opens a combobox + listbox
 * overlay with keyboard navigation. It is controlled — you own `items` and
 * react to `onQueryChange`, so the same component serves a static command
 * menu or an async full-text search.
 *
 * Result excerpts use a plain-text `description` plus optional `highlights`
 * (`[start, end)` character ranges the palette wraps in `<mark>` itself), so
 * search-term matches render safely even for untrusted content — no HTML is
 * injected. The legacy `descriptionHtml` prop is deprecated for that reason.
 */
const meta = {
  title: 'Core/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  // Required props — each story drives them from its own state via `render`.
  args: { items: [], onSelect: () => {}, onQueryChange: () => {} },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A small knowledge base to search — each entry's body doubles as the excerpt. */
const ARTICLES = [
  {
    id: 'photosynthesis',
    title: 'Photosynthesis',
    body: 'How plants turn sunlight, water, and carbon dioxide into glucose and oxygen.',
  },
  {
    id: 'plate-tectonics',
    title: 'Plate tectonics',
    body: 'The slow drift of lithospheric plates that reshapes oceans and continents.',
  },
  {
    id: 'general-relativity',
    title: 'General relativity',
    body: 'Gravity described as the curvature of spacetime by mass and energy.',
  },
  {
    id: 'dna-replication',
    title: 'DNA replication',
    body: 'How the double helix is copied so each new cell inherits the same genome.',
  },
  {
    id: 'entropy',
    title: 'Entropy',
    body: 'The second law, and why isolated systems trend toward disorder over time.',
  },
  {
    id: 'natural-selection',
    title: 'Natural selection',
    body: 'Heritable traits that aid survival grow more common across generations.',
  },
];

/**
 * Find every case-insensitive occurrence of `query` in `text` and return the
 * `[start, end)` ranges — exactly the shape a real search provider derives from
 * its match positions, and what `CommandPaletteItem.highlights` expects.
 */
function highlightRanges(text: string, query: string): Array<[number, number]> {
  if (!query) return [];
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  const ranges: Array<[number, number]> = [];
  let from = haystack.indexOf(needle);
  while (from !== -1) {
    ranges.push([from, from + needle.length]);
    from = haystack.indexOf(needle, from + needle.length);
  }
  return ranges;
}

/**
 * Full-text search: typing filters the knowledge base and highlights the
 * matched term in each excerpt via safe `description` + `highlights`. Click the
 * trigger or press ⌘K, then try `the`, `cell`, or `spacetime`.
 */
export const Default: Story = {
  render: function LiveSearch() {
    const [items, setItems] = useState<CommandPaletteItem[]>([]);

    return (
      <CommandPalette
        placeholder="Search the knowledge base…"
        items={items}
        onQueryChange={(query) => {
          const q = query.trim();
          if (!q) {
            setItems([]);
            return;
          }
          const lower = q.toLowerCase();
          setItems(
            ARTICLES.filter(
              (a) =>
                a.title.toLowerCase().includes(lower) || a.body.toLowerCase().includes(lower),
            ).map((a) => ({
              id: a.id,
              title: a.title,
              description: a.body,
              highlights: highlightRanges(a.body, q),
            })),
          );
        }}
        onSelect={(item) => console.log('navigate', item.id)}
      />
    );
  },
};

/**
 * A static command menu: every command shows on open, and typing filters them.
 * Descriptions are plain text — no highlighting needed. Bind a custom shortcut
 * and hint via `shortcut` / `shortcutHint`.
 */
export const CommandMenu: Story = {
  render: function CommandMenuStory() {
    const COMMANDS: CommandPaletteItem[] = [
      { id: 'new-doc', title: 'New document', description: 'Create a blank page' },
      { id: 'invite', title: 'Invite teammate', description: 'Send an invitation by email' },
      { id: 'toggle-theme', title: 'Toggle theme', description: 'Switch between light and dark' },
      { id: 'shortcuts', title: 'Keyboard shortcuts', description: 'Show every available shortcut' },
    ];
    const [items, setItems] = useState<CommandPaletteItem[]>(COMMANDS);

    return (
      <CommandPalette
        placeholder="Type a command…"
        shortcut="cmd+k"
        shortcutHint="⌘K"
        items={items}
        onQueryChange={(query) => {
          const q = query.trim().toLowerCase();
          setItems(
            !q
              ? COMMANDS
              : COMMANDS.filter(
                  (c) =>
                    c.title.toLowerCase().includes(q) ||
                    (c.description ?? '').toLowerCase().includes(q),
                ),
          );
        }}
        onSelect={(item) => console.log('run', item.id)}
      />
    );
  },
};
