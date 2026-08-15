import type { Meta, StoryObj } from '@storybook/react-vite';
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
