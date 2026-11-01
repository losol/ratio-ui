import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Calendar } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { RowTable, type RowTableColumn } from './RowTable';

type EventRow = {
  id: number;
  title: string;
  starts: string;
  place: string;
  registrations: number;
  capacity: number;
  status: 'draft' | 'open' | 'full';
};

const EVENTS: EventRow[] = [
  { id: 1, title: 'Autumn seminar on open badges', starts: '12 Nov 2026', place: 'Oslo', registrations: 24, capacity: 60, status: 'open' },
  { id: 2, title: 'Leadership course, module 3', starts: '19 Nov 2026', place: 'Bergen', registrations: 52, capacity: 60, status: 'open' },
  { id: 3, title: 'Annual conference', starts: '3 Dec 2026', place: 'Trondheim', registrations: 60, capacity: 60, status: 'full' },
  { id: 4, title: 'Winter workshop (draft)', starts: '14 Jan 2027', place: 'Online', registrations: 0, capacity: 40, status: 'draft' },
];

const STATUS: Record<EventRow['status'], { label: string; status: 'neutral' | 'success' | 'warning' }> = {
  draft: { label: 'Draft', status: 'neutral' },
  open: { label: 'Open', status: 'success' },
  full: { label: 'Full', status: 'warning' },
};

const columns: RowTableColumn<EventRow>[] = [
  { key: 'title', header: 'Event', width: 'minmax(0, 2fr)', render: (e) => e.title },
  { key: 'starts', header: 'Starts', width: 'auto', render: (e) => e.starts },
  { key: 'place', header: 'Place', hideBelow: 'lg', render: (e) => e.place },
  {
    key: 'registrations',
    header: 'Registrations',
    width: 'auto',
    align: 'end',
    render: (e) => (
      <span className="tabular-nums">
        {e.registrations} / {e.capacity}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 'auto',
    render: (e) => (
      <Badge variant="subtle" status={STATUS[e.status].status}>
        {STATUS[e.status].label}
      </Badge>
    ),
  },
];

const meta: Meta<typeof RowTable<EventRow>> = {
  title: 'Core/RowTable',
  component: RowTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    stackBelow: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <Card padding="none">
        <Story />
      </Card>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The admin overview: every row links to its event, the place column
 * leaves below `lg`, and below `md` the rows stack with the header hidden
 * from sight but not from screen readers. Resize the canvas to see it.
 */
export const Default: Story = {
  args: {
    'aria-label': 'Events',
    columns,
    rows: EVENTS,
    rowKey: (e) => e.id,
    rowHref: (e) => `#/admin/events/${e.id}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table', { name: 'Events' });
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(columns.length + 1);
    await expect(within(table).getAllByRole('row')).toHaveLength(EVENTS.length + 1);
    const link = canvas.getByRole('link', { name: 'Annual conference' });
    await expect(link).toHaveAttribute('href', '#/admin/events/3');
    await expect(link.closest('[role="row"]')).toHaveClass('ratio-row-table__row--link');
    // The chevrons are decoration: not exposed as cells.
    const chevrons = canvasElement.querySelectorAll('.ratio-row-table__cell--decor[role="cell"]');
    await expect(chevrons).toHaveLength(EVENTS.length);
    await expect(chevrons[0]).toHaveAttribute('aria-hidden', 'true');
  },
};

/** Without `rowHref` the rows are plain: no overlay, no hover, no chevron. */
export const Static: Story = {
  args: {
    'aria-label': 'Events',
    columns,
    rows: EVENTS,
    rowKey: (e) => e.id,
  },
};

/** `empty` takes the rows' place; the header stays for the column names. */
export const Empty: Story = {
  args: {
    'aria-label': 'Events',
    columns,
    rows: [],
    rowKey: (e) => e.id,
    rowHref: (e) => `#/admin/events/${e.id}`,
    empty: (
      <EmptyState
        size="sm"
        icon={<Calendar size={20} />}
        title="No events yet"
        description="Events you create appear here, soonest first."
        action={<Button variant="primary">New event</Button>}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No events yet')).toBeInTheDocument();
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
  },
};

/**
 * A control inside a linked row sits above the overlay with
 * `ratio-row-table__action`, so it takes the click instead of the row.
 */
export const WithRowAction: Story = {
  args: {
    'aria-label': 'Events',
    columns: [
      ...columns.slice(0, 2),
      {
        key: 'actions',
        header: 'Actions',
        width: 'auto',
        render: (e) => (
          <Button size="sm" variant="secondary" className="ratio-row-table__action" onClick={() => alert(e.title)}>
            Duplicate
          </Button>
        ),
      },
    ],
    rows: EVENTS,
    rowKey: (e) => e.id,
    rowHref: (e) => `#/admin/events/${e.id}`,
  },
};

/** `stackBelow="sm"` keeps the columns down to a tablet; `"lg"` stacks earlier. */
export const StackBelowSm: Story = {
  args: {
    ...Default.args,
    stackBelow: 'sm',
  },
};
