/**
 * DataTable stories — the console list: an admin table of manuscripts held by
 * the Library of Alexandria, with the copies of each work folded into the row.
 * The numbers are the ancient estimates; the works are the ones the Pinakes
 * catalogued.
 */

import type { FC } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ActionButton } from '@eventuras/ratio-ui/core/ActionButton';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { EmptyState } from '@eventuras/ratio-ui/core/EmptyState';
import { Chip } from '@eventuras/ratio-ui/core/Chip';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { ToggleButton } from '@eventuras/ratio-ui/core/ToggleButton';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { ChevronRight, ScrollText } from '@eventuras/ratio-ui/icons';
import DataTable, { createColumnHelper } from './DataTable';
import type { DataTableProps } from './DataTable';

type Copy = { scriptorium: string; condition: string; year: string };
type Manuscript = {
  id: string;
  title: string;
  author: string;
  subject: string;
  status: 'catalogued' | 'copying' | 'lost';
  copies: Copy[];
};

const MANUSCRIPTS: Manuscript[] = [
  {
    id: 'almagest',
    title: 'Almagest',
    author: 'Ptolemy',
    subject: 'Astronomy',
    status: 'catalogued',
    copies: [
      { scriptorium: 'Museum, north hall', condition: 'Good', year: '150' },
      { scriptorium: 'Serapeum annex', condition: 'Foxed', year: '190' },
    ],
  },
  {
    id: 'elements',
    title: 'Elements',
    author: 'Euclid',
    subject: 'Mathematics',
    status: 'catalogued',
    copies: [
      { scriptorium: 'Museum, north hall', condition: 'Good', year: '-300' },
      { scriptorium: 'Museum, north hall', condition: 'Good', year: '-240' },
      { scriptorium: 'Pergamon exchange', condition: 'Repaired', year: '-180' },
    ],
  },
  {
    id: 'geographia',
    title: 'Geographia',
    author: 'Eratosthenes',
    subject: 'Geography',
    status: 'copying',
    copies: [{ scriptorium: 'Museum, west hall', condition: 'In progress', year: '-230' }],
  },
  {
    id: 'on-floating-bodies',
    title: 'On Floating Bodies',
    author: 'Archimedes',
    subject: 'Physics',
    status: 'catalogued',
    copies: [{ scriptorium: 'Serapeum annex', condition: 'Fragmentary', year: '-250' }],
  },
  {
    id: 'histories',
    title: 'Aegyptiaca',
    author: 'Manetho',
    subject: 'History',
    status: 'lost',
    copies: [],
  },
];

const STATUS = {
  catalogued: { status: 'success', label: 'Catalogued' },
  copying: { status: 'info', label: 'Copying' },
  lost: { status: 'error', label: 'Lost' },
} as const;

const column = createColumnHelper<Manuscript>();

const columns = [
  column.accessor('title', {
    header: 'Work',
    cell: info => <span className="font-medium text-(--text)">{info.getValue()}</span>,
  }),
  column.accessor('author', { header: 'Author' }),
  column.accessor('subject', { header: 'Subject' }),
  column.accessor('copies', {
    header: 'Copies',
    cell: info => <Chip>{info.getValue().length}</Chip>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: info => {
      const { status, label } = STATUS[info.getValue()];
      return (
        <Badge variant="subtle" status={status}>
          {label}
        </Badge>
      );
    },
  }),
];

// The expander is a column, TanStack-style — the table renders the open row's
// content but never invents the control that opens it.
const expander = column.display({
  id: 'expander',
  header: () => null,
  cell: ({ row }) =>
    row.getCanExpand() ? (
      <ActionButton
        variant="ghost"
        size="sm"
        ariaLabel={`${row.getIsExpanded() ? 'Hide' : 'Show'} copies of ${row.original.title}`}
        onPress={row.getToggleExpandedHandler()}
      >
        <ChevronRight
          size={16}
          className={row.getIsExpanded() ? 'rotate-90 transition-transform' : 'transition-transform'}
        />
      </ActionButton>
    ) : null,
});

const copyList = (row: { original: Manuscript }) => (
  <div className="flex flex-col gap-2">
    {row.original.copies.length === 0 ? (
      <span className="text-(--text-subtle)">No copy survives — known only from the Pinakes.</span>
    ) : (
      row.original.copies.map(copy => (
        <div key={`${copy.scriptorium}-${copy.year}`} className="flex gap-4 text-(--text-muted)">
          <span className="min-w-[12rem]">{copy.scriptorium}</span>
          <span>{copy.condition}</span>
          <span className="font-mono text-xs">{copy.year}</span>
        </div>
      ))
    )}
  </div>
);

// DataTable is generic; pinning the row type here is what lets story `args`
// (and the render callbacks) stay typed as manuscripts.
type ManuscriptTable = FC<DataTableProps<Manuscript>>;

const meta = {
  title: 'Datatable/DataTable',
  component: DataTable as ManuscriptTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<ManuscriptTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The plain list: columns rendered through Ratio UI's `Table`, so hairlines,
 * header tone and cell rhythm come from the theme's tokens and the table
 * tracks light/dark with everything else on the page.
 */
export const Default: Story = {
  args: {
    columns,
    data: MANUSCRIPTS,
  },
};

/**
 * Search, expandable rows and the counts. `rowCountLabel` puts a count under
 * the table, and `renderToolbar` receives the same numbers so a filter
 * summary can sit next to the field. Typing in the search opens every row, so
 * a match inside an expanded copy list is visible; clearing it collapses them.
 */
export const SearchAndCounts: Story = {
  args: {
    columns: [expander, ...columns],
    data: MANUSCRIPTS,
    enableGlobalSearch: true,
    getRowCanExpand: () => true,
    renderSubComponent: ({ row }) => copyList(row),
    rowCountLabel: (shown, total) => `${shown} of ${total} works`,
    // The slot takes any node — Ratio UI's EmptyState is what it's for.
    // `role="status"` announces the message when it replaces the rows.
    emptyState: <EmptyState size="sm" role="status" title="No work matches the search." />,
  },
};

/**
 * `expanded` + `onExpandedChange` hand expansion to the caller — here a
 * toolbar switch that unfolds every row at once (`true` is TanStack's
 * "all rows"), the density control an admin list needs when the detail
 * matters more than the row count. Uncontrolled, the table keeps one row
 * open at a time (`expansionMode`).
 */
export const ExpandAll: Story = {
  args: { columns: [expander, ...columns], data: MANUSCRIPTS },
  render: function ExpandAllStory(args) {
    const [showCopies, setShowCopies] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Heading as="h2">Manuscripts</Heading>
          <ToggleButton
            className="ml-auto"
            isSelected={showCopies}
            onChange={setShowCopies}
            aria-label="Show copies for every work"
          >
            Show copies
          </ToggleButton>
        </div>
        <DataTable
          {...args}
          getRowCanExpand={() => true}
          renderSubComponent={({ row }) => copyList(row)}
          expanded={showCopies ? true : {}}
          onExpandedChange={() => setShowCopies(false)}
        />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Folded: the copy detail is not in the DOM.
    expect(canvas.queryByText('Pergamon exchange')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Show copies for every work' }));
    expect(canvas.getByText('Pergamon exchange')).toBeVisible();
    expect(canvas.getByText(/No copy survives/)).toBeVisible();
  },
};

/**
 * `onRowClick` is the pointer convenience an admin list is expected to have.
 * It doesn't make the row focusable, so the real destination stays in a cell
 * — keyboard and screen-reader users follow the link, not the row.
 */
export const ClickableRows: Story = {
  args: { columns, data: MANUSCRIPTS },
  render: function ClickableRowsStory(args) {
    const [opened, setOpened] = useState<string | null>(null);
    return (
      <div className="flex flex-col gap-4">
        <DataTable
          {...args}
          columns={[
            column.accessor('title', {
              header: 'Work',
              cell: info => (
                <a
                  href={`#/manuscripts/${info.row.original.id}`}
                  className="font-medium text-(--primary) underline-offset-2 hover:underline"
                  onClick={e => {
                    e.preventDefault();
                    setOpened(info.getValue());
                  }}
                >
                  {info.getValue()}
                </a>
              ),
            }),
            ...columns.slice(1),
          ]}
          onRowClick={row => setOpened(row.original.title)}
        />
        <p className="text-sm text-(--text-muted)">
          {opened ? `Opened: ${opened}` : 'Click a row, or the work’s link.'}
        </p>
      </div>
    );
  },
};

/**
 * Nothing matched. `emptyState` replaces the rows while the header stays put,
 * so the columns don't jump when a filter empties the list.
 */
export const Empty: Story = {
  args: {
    columns,
    data: [],
    // Nothing catalogued yet reads differently from a filter that matched
    // nothing: it names what would appear, and offers the way to add it.
    emptyState: (
      <EmptyState
        icon={<ScrollText size={24} />}
        title="No works catalogued yet"
        description="Registered works appear here, newest first."
        action={<Button variant="primary">Register a work</Button>}
      />
    ),
    rowCountLabel: (shown, total) => `${shown} of ${total} works`,
  },
};
