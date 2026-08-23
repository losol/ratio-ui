// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { EmptyState } from './EmptyState';
import { SearchField } from '../../forms/SearchField';
import { ScrollText } from '../../icons';

const meta = {
  title: 'Core/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Nothing has been created yet. Name what is missing in the domain's words —
 * "No manuscripts catalogued", never "No data" — say what would appear here,
 * and offer the one action that fills it.
 */
export const Default: Story = {
  args: {
    icon: <ScrollText size={28} />,
    title: 'No manuscripts catalogued',
    description: 'Works registered by the librarians appear here, newest first.',
    action: <Button variant="primary">Register a work</Button>,
  },
};

/**
 * A filter matched nothing. This is a different message from the one above:
 * the shelves aren't empty, the query is too narrow — and saying so is what
 * stops the reader concluding the list is broken. No action, because the way
 * out is the filter they already have.
 */
export const NoMatches: Story = {
  args: {
    size: 'sm',
    title: 'No work matches the search.',
  },
};

/**
 * `size="sm"` is the row that sits inside a list, menu or table; `md` is the
 * panel that fills a card or a page section.
 */
export const Sizes: Story = {
  args: { title: '' },
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'md'] as const).map(size => (
        <div key={size} className="rounded-lg border border-border-1 bg-card">
          <EmptyState
            size={size}
            icon={<ScrollText size={size === 'sm' ? 20 : 28} />}
            title={`size="${size}"`}
            description="Works registered by the librarians appear here."
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * In place: a filtered list that empties as you type. `role="status"` reaches
 * the root along with the rest of the div's attributes, so the message is
 * announced when it replaces the results — search for "Hypatia" to see it,
 * then for something that isn't there.
 */
export const InAFilteredList: Story = {
  args: { title: '' },
  render: function InAFilteredListStory() {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();
    const scholars = [
      'Eratosthenes — measured the Earth',
      'Hypatia — commentaries on Apollonius',
      'Aristarchus — the Sun at the centre',
      'Callimachus — the Pinakes',
    ].filter(name => !q || name.toLowerCase().includes(q));

    return (
      <div className="flex max-w-[30rem] flex-col gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Filter scholars…"
          aria-label="Filter scholars"
        />
        <div className="rounded-lg border border-border-1 bg-card">
          {scholars.length === 0 ? (
            <EmptyState size="sm" role="status" title="No scholar matches the filter." />
          ) : (
            <ul className="divide-y divide-border-1">
              {scholars.map(name => (
                <li key={name} className="px-4 py-2.5 text-sm text-(--text-muted)">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('searchbox', { name: 'Filter scholars' });

    expect(canvas.getByText(/Hypatia/)).toBeVisible();

    await userEvent.type(field, 'Ptolemy');
    const empty = await canvas.findByRole('status');
    expect(empty).toHaveTextContent('No scholar matches the filter.');
    expect(canvas.queryByText(/Hypatia/)).toBeNull();

    // Clear through the field's own button — the real way out of an empty
    // result — and wait, since SearchField debounces onChange by 300ms.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    expect(await canvas.findByText(/Hypatia/)).toBeVisible();
    expect(canvas.queryByRole('status')).toBeNull();
  },
};
