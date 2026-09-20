import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Panel } from './Panel';
import { Button } from '../Button';
import { DescriptionList } from '../DescriptionList';
import { Stack } from '../../layout/Stack/Stack';
import { AlertTriangle, Info, MapPin } from '../../icons';

/**
 * Panel is a bordered block that carries a status. Three axes decide how it
 * looks, and they are independent: `status` picks the colour, `accent`
 * decides how that colour meets the edge, and `surface` decides what sits
 * behind the content.
 */
const meta = {
  title: 'Core/Panel',
  component: Panel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    accent: { control: 'select', options: ['none', 'pill', 'flush', 'top', 'ring', 'tint'] },
    surface: { control: 'select', options: ['filled', 'card', 'outline', 'transparent'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: [undefined, 'alert', 'callout', 'notice'] },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'info',
    accent: 'flush',
    children: 'Your session expires in five minutes.',
  },
};

/**
 * The five status tones. `neutral` is the default and carries no signal —
 * it borrows the card surface, so a panel you have not given a status reads
 * as structure rather than as news.
 */
export const Status: Story = {
  render: () => (
    <Stack gap="sm">
      {(['neutral', 'info', 'success', 'warning', 'error'] as const).map(status => (
        <Panel key={status} status={status} accent="flush">
          <Panel.Header>
            <Panel.Title>{status}</Panel.Title>
          </Panel.Header>
          <Panel.Body>The same panel in the {status} tone.</Panel.Body>
        </Panel>
      ))}
    </Stack>
  ),
};

/**
 * Six ways to put the status on the edge. `flush` is the 4px left rule that
 * v1 called `variant="alert"`; `tint` moves the colour into the header band
 * and leaves the body on the card surface.
 */
export const Accent: Story = {
  render: () => (
    <Stack gap="sm">
      {(['none', 'pill', 'flush', 'top', 'ring', 'tint'] as const).map(accent => (
        <Panel key={accent} status="info" accent={accent}>
          <Panel.Header>
            <Panel.Title>accent="{accent}"</Panel.Title>
          </Panel.Header>
          <Panel.Body>Registration is open. Twelve seats left.</Panel.Body>
        </Panel>
      ))}
    </Stack>
  ),
};

/**
 * What sits behind the content, independent of the status colour. `card` is
 * the system's translucent surface; `transparent` gives structure with no
 * frame at all.
 */
export const Surface: Story = {
  render: () => (
    <Stack gap="sm">
      {(['filled', 'card', 'outline', 'transparent'] as const).map(surface => (
        <Panel key={surface} status="info" surface={surface}>
          <Panel.Header>
            <Panel.Title>surface="{surface}"</Panel.Title>
          </Panel.Header>
          <Panel.Body>The same status on a different ground.</Panel.Body>
        </Panel>
      ))}
    </Stack>
  ),
};

/**
 * Size moves the padding and the title step. Body text holds one size
 * throughout — it is the padding that carries the difference, not the prose.
 */
export const Size: Story = {
  render: () => (
    <Stack gap="sm">
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Panel key={size} status="info" accent="flush" size={size}>
          <Panel.Header>
            <Panel.Title>size="{size}"</Panel.Title>
          </Panel.Header>
          <Panel.Body>Registration is open. Twelve seats left.</Panel.Body>
        </Panel>
      ))}
    </Stack>
  ),
};

/** The full anatomy: icon, title, description, actions, body and a footer. */
export const Composed: Story = {
  render: () => (
    <Panel status="warning" accent="flush">
      <Panel.Header
        icon={<AlertTriangle />}
        actions={
          <Button variant="text" size="sm">
            Help
          </Button>
        }
      >
        <Panel.Title>Payment missing</Panel.Title>
        <Panel.Description>Due 12 March 2026</Panel.Description>
      </Panel.Header>
      <Panel.Body>
        We have not registered a payment for your booking. The seat is held until the
        deadline passes.
      </Panel.Body>
      <Panel.Footer>
        <Button variant="outline" size="sm">
          View invoice
        </Button>
        <Button size="sm">Pay now</Button>
      </Panel.Footer>
    </Panel>
  ),
};

/**
 * `collapsible` renders a native `<details>`, so the panel opens and closes
 * before any JavaScript loads and find-in-page can reach the closed content.
 * The header becomes the `<summary>`; put actions in the footer instead.
 */
export const Collapsible: Story = {
  render: () => (
    <Stack gap="sm">
      <Panel collapsible surface="card">
        <Panel.Header>
          <Panel.Title>Programme</Panel.Title>
          <Panel.Description>Three sessions</Panel.Description>
        </Panel.Header>
        <Panel.Body divided>
          <div className="flex justify-between py-1.5">
            <span>Opening and introduction</span>
            <span className="tabular-nums text-(--text-subtle)">09:00</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Workshop</span>
            <span className="tabular-nums text-(--text-subtle)">10:15</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Close</span>
            <span className="tabular-nums text-(--text-subtle)">13:00</span>
          </div>
        </Panel.Body>
      </Panel>
      <Panel collapsible defaultOpen={false} surface="card">
        <Panel.Header>
          <Panel.Title>Terms</Panel.Title>
        </Panel.Header>
        <Panel.Body>Cancellations after 1 June are charged in full.</Panel.Body>
      </Panel>
    </Stack>
  ),
};

/**
 * `open` with `onToggle` hands the state to the caller — here so one button
 * can open or close every section, while each summary still toggles its own.
 */
export const Controlled: Story = {
  render: function ControlledStory() {
    const sections = ['Programme', 'Venue', 'Terms'];
    const [open, setOpen] = useState(() => sections.map(() => false));
    const allOpen = open.every(Boolean);
    return (
      <Stack gap="sm">
        <div>
          <Button size="sm" variant="outline" onPress={() => setOpen(open.map(() => !allOpen))}>
            {allOpen ? 'Close all' : 'Open all'}
          </Button>
        </div>
        {sections.map((title, i) => (
          <Panel
            key={title}
            collapsible
            surface="card"
            open={open[i]}
            onToggle={next => setOpen(prev => prev.map((v, j) => (j === i ? next : v)))}
          >
            <Panel.Header>
              <Panel.Title>{title}</Panel.Title>
            </Panel.Header>
            <Panel.Body>Details for {title.toLowerCase()}.</Panel.Body>
          </Panel>
        ))}
      </Stack>
    );
  },
};

/**
 * The dismiss button is rendered, but the panel never hides itself — the
 * caller unmounts it and decides what remembers the dismissal. Same contract
 * as `Announcement`.
 */
export const Dismissible: Story = {
  args: {
    status: 'success',
    accent: 'flush',
    dismissible: true,
    children: 'Your booking is confirmed. A receipt is on its way by email.',
  },
};

/** `loading` swaps the body for a skeleton and sets `aria-busy`. */
export const Loading: Story = {
  args: { surface: 'card', loading: true },
};

/** `href` makes the whole panel a link and adds the canonical hover surface. */
export const AsLink: Story = {
  args: {
    surface: 'card',
    href: '#',
    children: 'Travel and accommodation — agreed rates for participants',
  },
};

/**
 * `Panel.Meta` renders a `DescriptionList` in `meta` form at the panel's own
 * padding. All the styling and every prop stay on the list; the panel only
 * drops the outer rules its own border already provides.
 */
export const MetaRows: Story = {
  render: () => (
    <Panel size="sm" surface="card" className="max-w-sm">
      <Panel.Header icon={<MapPin />}>
        <Panel.Title>Practical information</Panel.Title>
      </Panel.Header>
      <Panel.Meta>
        <DescriptionList.Description term="Location">
          Central Library
        </DescriptionList.Description>
        <DescriptionList.Description term="Date">
          12–14 June 2026
        </DescriptionList.Description>
        <DescriptionList.Description term="Price">£340</DescriptionList.Description>
      </Panel.Meta>
    </Panel>
  ),
};

/**
 * The v1 API still works. `variant` is a preset over `accent` + `surface`,
 * applied only where those are not given, and bare children are wrapped in
 * `Panel.Body`.
 */
export const LegacyVariants: Story = {
  render: () => (
    <Stack gap="sm">
      <Panel variant="alert" status="error">
        variant="alert" — flush accent on a filled surface
      </Panel>
      <Panel variant="callout" status="info">
        variant="callout" — outline only
      </Panel>
      <Panel variant="notice" status="warning">
        variant="notice" — filled, no accent
      </Panel>
    </Stack>
  ),
};

/**
 * Status alone does not decide whether a panel is live. A server-rendered
 * panel is part of the page, not news, so pass `role={null}` to keep it out
 * of the screen reader's live region.
 */
export const StaticContent: Story = {
  render: () => (
    <Panel status="info" accent="flush" role={null}>
      <Panel.Header icon={<Info />}>
        <Panel.Title>Rendered with the page</Panel.Title>
      </Panel.Header>
      <Panel.Body>
        This panel carries a status colour but announces nothing — it was in the
        document when it loaded.
      </Panel.Body>
    </Panel>
  ),
};
