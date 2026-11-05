import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Link } from '../Link';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Core/Timeline (beta)',
  component: Timeline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Basic: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item
        timestamp="2026-04-19 10:22"
        title="Order created"
        status="success"
        actor="Ada Lovelace"
      />
      <Timeline.Item
        timestamp="2026-04-19 10:25"
        title="Payment method updated"
        actor="Ada Lovelace"
      />
      <Timeline.Item
        timestamp="2026-04-19 11:00"
        title="Order verified"
        status="info"
      />
    </Timeline>
  ),
};

export const WithMetadata: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item
        timestamp="2026-04-19 10:22"
        title="Order created"
        status="success"
        actor="Ada Lovelace"
      >
        <pre className="rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-900">
{JSON.stringify({ orderId: 42, total: 1200 }, null, 2)}
        </pre>
      </Timeline.Item>
      <Timeline.Item
        timestamp="2026-04-19 10:25"
        title="Payment method updated"
        actor="Ada Lovelace"
      >
        <div>Changed from <strong>Email invoice</strong> to <strong>EHF invoice</strong>.</div>
      </Timeline.Item>
    </Timeline>
  ),
};

/**
 * `marker="ring"` swaps the filled dot for a hollow one — for items that mark
 * a point in a series (a release, a scheduled step) rather than report an
 * outcome. `icon` still overrides both.
 */
export const Markers: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item timestamp="10:00" title="Filled dot — an outcome" status="success" />
      <Timeline.Item timestamp="10:05" title="Hollow ring — a point in the series" marker="ring" />
      <Timeline.Item timestamp="10:10" title="Ring in a status color" marker="ring" status="warning" />
    </Timeline>
  ),
};

/**
 * `layout="inline"` flips the header: the title leads, timestamp and actor
 * trail it as muted meta. Audit logs read "when, then what"; release notes
 * read "what, then when". `timestamp` is optional in both layouts.
 */
export const InlineHeader: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item
        layout="inline"
        marker="ring"
        title={<span className="font-mono text-base">v2.4.0</span>}
        timestamp="27 Jul 2026"
        actor="3 changes"
      />
      <Timeline.Item
        layout="inline"
        marker="ring"
        title={<span className="font-mono text-base">v2.3.1</span>}
        timestamp="14 Jul 2026"
        actor="no changes"
      />
      <Timeline.Item layout="inline" title="No timestamp at all" actor="draft" />
    </Timeline>
  ),
};

/**
 * The activity feed of an admin page: days as `Timeline.Group`s, the time in
 * a `gutter` column, and each line a sentence (`layout="activity"`) — the
 * actor in bold, a verb, the target as a link — with an optional detail
 * line as children. Filter it with a compact `Tabs` above.
 */
export const ActivityFeed: Story = {
  render: (args) => (
    <div className="max-w-160">
      <Timeline {...args} gutter>
        <Timeline.Group label="Today">
          <Timeline.Item
            layout="activity"
            timestamp="10:22"
            status="success"
            title={
              <>
                <strong>Ingrid Hansen</strong> registered for{' '}
                <Link href="#/admin/events/1">Autumn seminar on open badges</Link>
              </>
            }
          >
            Seat 24 of 60 · paid by card
          </Timeline.Item>
          <Timeline.Item
            layout="activity"
            timestamp="09:48"
            status="info"
            title={
              <>
                <strong>Order 1042</strong> was sent as an EHF invoice to <strong>Bergen kommune</strong>
              </>
            }
          />
          <Timeline.Item
            layout="activity"
            timestamp="08:15"
            status="warning"
            title={
              <>
                <strong>Ola Nordmann</strong> raised the capacity of{' '}
                <Link href="#/admin/events/3">Annual conference</Link> from 50 to 60
              </>
            }
          />
        </Timeline.Group>
        <Timeline.Group label="Yesterday">
          <Timeline.Item
            layout="activity"
            timestamp="16:40"
            status="success"
            title={
              <>
                <strong>Kari Nordmann</strong> registered for{' '}
                <Link href="#/admin/events/2">Leadership course, module 3</Link>
              </>
            }
          >
            Seat 52 of 60
          </Timeline.Item>
          <Timeline.Item
            layout="activity"
            timestamp="11:05"
            status="error"
            title={
              <>
                <strong>Order 1039</strong> failed: the card was declined
              </>
            }
          />
        </Timeline.Group>
      </Timeline>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Today')).toBeInTheDocument();
    await expect(canvas.getByText('Yesterday')).toBeInTheDocument();
    const root = canvasElement.querySelector('ol[data-gutter]');
    await expect(root).toHaveClass('ratio-timeline--gutter');
    const times = canvasElement.querySelectorAll('time.ratio-timeline__time');
    await expect(times).toHaveLength(5);
    const first = times[0];
    await expect(first && getComputedStyle(first).position).toBe('absolute');
    await expect(canvas.getByRole('link', { name: 'Annual conference' })).toBeInTheDocument();
  },
};

/** Groups work in the stacked layout too — a phase per group, the rail restarting with each. */
export const Grouped: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Group label="Registration">
        <Timeline.Item timestamp="2026-04-19 10:22" title="Order created" status="success" actor="Ada Lovelace" />
        <Timeline.Item timestamp="2026-04-19 10:25" title="Payment method updated" actor="Ada Lovelace" />
      </Timeline.Group>
      <Timeline.Group label="Fulfilment">
        <Timeline.Item timestamp="2026-04-20 09:00" title="Invoice sent" status="info" />
        <Timeline.Item timestamp="2026-04-27 14:10" title="Invoice paid" status="success" />
      </Timeline.Group>
    </Timeline>
  ),
};

export const AllStatuses: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item timestamp="10:00" title="Neutral event" status="neutral" />
      <Timeline.Item timestamp="10:05" title="Info event" status="info" />
      <Timeline.Item timestamp="10:10" title="Success event" status="success" />
      <Timeline.Item timestamp="10:15" title="Warning event" status="warning" />
      <Timeline.Item timestamp="10:20" title="Error event" status="error" />
    </Timeline>
  ),
};
