// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Card } from '../Card';
import { Navbar } from '../Navbar';
import { Announcement, type AnnouncementTone } from './Announcement';
import { Info, Telescope } from '../../icons';

const meta = {
  title: 'Core/Announcement',
  component: Announcement,
  parameters: { noPadding: true },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'warning', 'success', 'error', 'neutral', 'ink'],
    },
    variant: { control: 'radio', options: ['row', 'banner'] },
    onDismiss: { control: false },
  },
} satisfies Meta<typeof Announcement>;

export default meta;
type Story = StoryObj<typeof meta>;

// The site chrome the band sits against. Elevated and centered, so the
// band's container lines up with the brand.
const SiteNavbar = () => (
  <Navbar elevated>
    <Navbar.Brand>
      <span className="font-serif text-xl font-semibold">Alexandria</span>
    </Navbar.Brand>
    <Navbar.Links>
      <Navbar.Link href="#" isCurrent>
        Catalogue
      </Navbar.Link>
      <Navbar.Link href="#">Lectures</Navbar.Link>
      <Navbar.Link href="#">Visit</Navbar.Link>
    </Navbar.Links>
    <Navbar.Spacer />
    <Navbar.Actions>
      <Button size="sm" variant="primary">
        Sign in
      </Button>
    </Navbar.Actions>
  </Navbar>
);

const pageBody = (
  <div className="container mx-auto px-4 py-8">
    <h2 className="mt-0 font-serif text-2xl">Upcoming lectures</h2>
    <p className="text-(--text-muted)">
      Twelve evenings on the history of astronomy, from Eratosthenes to the first
      photographic plates.
    </p>
  </div>
);

// A warm placeholder for the picture slot — the real band carries a photograph.
const PORTRAIT =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='104' height='78'>" +
      "<rect width='104' height='78' fill='#5b4a3a'/>" +
      "<circle cx='52' cy='30' r='14' fill='#d9c6a5'/>" +
      "<ellipse cx='52' cy='72' rx='26' ry='22' fill='#d9c6a5'/></svg>",
  );

/**
 * The everyday form: one line below the navbar — icon, sentence, an inline
 * link, and the dismiss button. `info` for news and deadlines. Adjust the
 * controls to try the other tones and the `banner` form.
 */
export const Default: Story = {
  args: { onDismiss: fn() },
  render: args => (
    <Announcement {...args}>
      <Info size={17} aria-hidden className="shrink-0" />
      <Announcement.Body>
        Registration for the autumn programme opens 1 September.{' '}
        <Announcement.Link href="#programme">See the programme</Announcement.Link>
      </Announcement.Body>
    </Announcement>
  ),
};

/**
 * The taller form, above the navbar: a 2px ochre `Rule`, a serif `Title`
 * over the sentence, and the `Action` pill pushed right. `ink` is the
 * mourning band — near-black, never dismissible, shown alone. The sentence
 * says what changes in practice; the linked page carries the rest.
 */
export const Banner: Story = {
  args: { tone: 'ink', variant: 'banner' },
  render: args => (
    <div className="min-h-80 bg-surface">
      <Announcement {...args}>
        <Announcement.Rule />
        <Announcement.Body>
          <Announcement.Title>Ingrid Solheim, 1937–2026</Announcement.Title>
          The institute's founder has died. Lectures 3–5 September are postponed; registered
          participants will receive an email.
        </Announcement.Body>
        <Announcement.Action href="#in-memoriam">Read more</Announcement.Action>
      </Announcement>
      <SiteNavbar />
      {pageBody}
    </div>
  ),
};

/**
 * The picture slot replaces the rule: a 4:3 photograph, 104×78, left of the
 * text — a portrait, a flag, a place. Photographic, never an illustration;
 * `alt` is required because the picture carries meaning here.
 */
export const BannerWithImage: Story = {
  args: { tone: 'ink', variant: 'banner' },
  render: args => (
    <div className="min-h-80 bg-surface">
      <Announcement {...args}>
        <Announcement.Image src={PORTRAIT} alt="Ingrid Solheim" />
        <Announcement.Body>
          <Announcement.Title>Ingrid Solheim, 1937–2026</Announcement.Title>
          The institute's founder has died. Lectures 3–5 September are postponed; registered
          participants will receive an email.
        </Announcement.Body>
        <Announcement.Action href="#in-memoriam">Read more</Announcement.Action>
      </Announcement>
      <SiteNavbar />
      {pageBody}
    </div>
  ),
};

const TONES: { tone: AnnouncementTone; label: string; text: string }[] = [
  { tone: 'info', label: 'Info', text: 'Registration opens 1 September.' },
  { tone: 'warning', label: 'Operations', text: 'Lectures 3–5 September are postponed.' },
  { tone: 'success', label: 'Resolved', text: 'The catalogue is back at full speed.' },
  { tone: 'error', label: 'Outage', text: 'Sign-in is unavailable. Reading works as usual.' },
  { tone: 'neutral', label: 'Marking', text: 'The flag flies at half mast today.' },
  { tone: 'ink', label: 'Mourning', text: 'Ingrid Solheim, 1937–2026.' },
];

/**
 * Six tones, one component. The status tones reuse the tokens `Panel` and
 * `Badge` use, so a warning here matches a warning anywhere. `neutral` is
 * Linen-300 with muted text — a marking that asks for nothing. `ink` is
 * the only bespoke surface. Severity increases downwards: while a mourning
 * band is active, the caller shows nothing else.
 *
 * In a `row` the `Title` is the bold lead-in, not a headline.
 */
export const Tones: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col py-6">
      {TONES.map(({ tone, label, text }) => (
        <Announcement key={tone} tone={tone}>
          <Announcement.Body>
            <Announcement.Title>{label}</Announcement.Title> · {text}
          </Announcement.Body>
        </Announcement>
      ))}
    </div>
  ),
};

/**
 * Where the band goes is composition, not a prop: a `row` sits directly
 * below the navbar as a notice, a `banner` above it as an announcement.
 * Either way the band pushes the page down — it never overlays the chrome
 * and never changes the layout beneath it.
 */
export const Placement: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-8 py-6">
      <div>
        <p className="container mx-auto mt-0 mb-2 px-5 font-mono text-xs text-(--text-subtle) uppercase">
          Row · below the navbar
        </p>
        <div className="bg-surface pb-6">
          <SiteNavbar />
          <Announcement tone="warning" onDismiss={() => {}}>
            <Info size={17} aria-hidden className="shrink-0" />
            <Announcement.Body>
              The reading room is closed 3–5 September while the floor is replaced.{' '}
              <Announcement.Link href="#notice">Read more</Announcement.Link>
            </Announcement.Body>
          </Announcement>
          {pageBody}
        </div>
      </div>
      <div>
        <p className="container mx-auto mt-0 mb-2 px-5 font-mono text-xs text-(--text-subtle) uppercase">
          Banner · above the navbar
        </p>
        <div className="bg-surface pb-6">
          <Announcement tone="neutral" variant="banner">
            <Announcement.Rule />
            <Announcement.Body>
              <Announcement.Title>The flag flies at half mast</Announcement.Title>
              3–9 September, in memory of the institute's founder.
            </Announcement.Body>
            <Announcement.Action href="#in-memoriam">Read more</Announcement.Action>
          </Announcement>
          <SiteNavbar />
          {pageBody}
        </div>
      </div>
    </div>
  ),
};

/**
 * Operational notices in the order a reader meets them: the warning before
 * the work, the error while it goes wrong, the all-clear after. Say what is
 * affected and what still works — "reading works as usual" is the sentence
 * that stops people refreshing.
 */
export const OperationalNotices: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4 py-6">
      <Announcement tone="warning" onDismiss={() => {}}>
        <Announcement.Body>
          <Announcement.Title>Maintenance</Announcement.Title> · The catalogue is
          read-only on Sunday 6 September, 02:00–04:00, while it moves to new servers.
        </Announcement.Body>
      </Announcement>
      <Announcement tone="error" onDismiss={() => {}}>
        <Announcement.Body>
          Sign-in is unavailable while our identity provider is down. Reading works as usual.
        </Announcement.Body>
        <Announcement.Action href="#status">Status page</Announcement.Action>
      </Announcement>
      <Announcement tone="success" onDismiss={() => {}}>
        <Announcement.Body>
          The move is complete — the catalogue is back at full speed.
        </Announcement.Body>
      </Announcement>
    </div>
  ),
};

/**
 * `onDismiss` renders the close button; the band does not hide itself. The
 * caller unmounts it and decides what the dismissal means — for a session,
 * for this browser, for this user. Here it lasts until "Show again".
 */
export const Dismissible: Story = {
  args: { onDismiss: fn() },
  render: function DismissibleStory(args) {
    const [open, setOpen] = useState(true);
    return open ? (
      <Announcement
        {...args}
        onDismiss={() => {
          args.onDismiss?.();
          setOpen(false);
        }}
      >
        <Info size={17} aria-hidden className="shrink-0" />
        <Announcement.Body>
          Hypatia and the Alexandrian school — Thursday 19:00 in the west reading room.{' '}
          <Announcement.Link href="#lecture">Reserve a seat</Announcement.Link>
        </Announcement.Body>
      </Announcement>
    ) : (
      <div className="container mx-auto px-5 py-3">
        <Button size="sm" variant="secondary" onPress={() => setOpen(true)}>
          Show again
        </Button>
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('region', { name: 'Announcement' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    expect(args.onDismiss).toHaveBeenCalledTimes(1);
    expect(canvas.queryByRole('region', { name: 'Announcement' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Show again' }));
    expect(await canvas.findByRole('region', { name: 'Announcement' })).toBeVisible();
  },
};

/**
 * Remembering the dismissal is the caller's job, and the key is the
 * message's id — never its period — so an edited message stays dismissed
 * and a new one shows again to everyone. Render nothing until the stored
 * flag has been read, or the band flashes on every load. Signed-in readers
 * would get the same flag on their profile instead of `localStorage`.
 */
export const RememberedAcrossVisits: Story = {
  args: {},
  render: function RememberedStory() {
    const MESSAGE_ID = 'autumn-programme-2026';
    const KEY = `announcement:${MESSAGE_ID}`;
    // `null` = not read yet; nothing renders until we know.
    const [seen, setSeen] = useState<boolean | null>(null);

    useEffect(() => {
      setSeen(window.localStorage.getItem(KEY) === '1');
    }, [KEY]);

    const remember = (value: boolean) => {
      if (value) window.localStorage.setItem(KEY, '1');
      else window.localStorage.removeItem(KEY);
      setSeen(value);
    };

    if (seen === null) return <></>;

    return seen ? (
      <div className="container mx-auto px-5 py-4">
        <p className="mt-0 text-sm text-(--text-muted)">
          Dismissed — the flag lives in <code>localStorage</code> under <code>{KEY}</code>,
          so this stays hidden on reload.
        </p>
        <Button size="sm" variant="secondary" onPress={() => remember(false)}>
          Forget the dismissal
        </Button>
      </div>
    ) : (
      <Announcement onDismiss={() => remember(true)}>
        <Info size={17} aria-hidden className="shrink-0" />
        <Announcement.Body>
          Registration for the autumn programme opens 1 September.{' '}
          <Announcement.Link href="#programme">See the programme</Announcement.Link>
        </Announcement.Body>
      </Announcement>
    );
  },
};

/**
 * The app placement: `fluid` drops the centered container so the text
 * lines up with a full-width app header's brand.
 */
export const InAnAppHeader: Story = {
  args: {},
  render: () => (
    <div className="min-h-80 bg-surface">
      <Navbar elevated fluid>
        <Navbar.Brand>
          <span className="inline-flex items-center gap-2 font-semibold">
            <Telescope size={18} aria-hidden /> Observatory console
          </span>
        </Navbar.Brand>
        <Navbar.Spacer />
        <Navbar.Actions>
          <Button size="sm" variant="secondary">
            Account
          </Button>
        </Navbar.Actions>
      </Navbar>
      <Announcement fluid onDismiss={() => {}}>
        <Info size={17} aria-hidden className="shrink-0" />
        <Announcement.Body>
          Instrument logs are read-only until the archive migration finishes tonight.{' '}
          <Announcement.Link href="#migration">Migration status</Announcement.Link>
        </Announcement.Body>
      </Announcement>
      <div className="px-5 py-8 text-sm text-(--text-muted)">Console content…</div>
    </div>
  ),
};

/**
 * Named for what it says, not where it sits: with `fluid` the same
 * component tops a `Card` (or a `Drawer`) as a notice scoped to that
 * surface — here, an entry under revision. `padding="none"` and
 * `overflow-hidden` on the card let the band run edge to edge and take the
 * card's corners.
 */
export const InsideACard: Story = {
  args: {},
  render: () => (
    <div className="max-w-2xl p-6">
      <Card padding="none" className="overflow-hidden">
        <Announcement tone="warning" fluid onDismiss={() => {}}>
          <Info size={17} aria-hidden className="shrink-0" />
          <Announcement.Body>
            This entry is being revised; details may change until Friday.{' '}
            <Announcement.Link href="#history">See the revision history</Announcement.Link>
          </Announcement.Body>
        </Announcement>
        <div className="p-6">
          <h3 className="mt-0 font-serif text-xl">Eratosthenes — measured the Earth</h3>
          <p className="mb-0 text-sm text-(--text-muted)">
            Third-century librarian of Alexandria, who used the noon shadow at Syene and a
            surveyed distance to estimate the Earth's circumference to within a few percent.
          </p>
        </div>
      </Card>
    </div>
  ),
};

/**
 * Narrow screens: the sentence wraps inside `Body`, the pill keeps its
 * line, and the dismiss button grows to a 44px touch target without
 * changing the band's height.
 */
export const OnANarrowScreen: Story = {
  args: {},
  render: () => (
    <div className="flex max-w-88 flex-col gap-4 border-r border-border-1 py-6">
      <Announcement tone="warning" onDismiss={() => {}}>
        <Info size={17} aria-hidden className="shrink-0" />
        <Announcement.Body>
          The catalogue is read-only on Sunday 6 September, 02:00–04:00.{' '}
          <Announcement.Link href="#status">Details</Announcement.Link>
        </Announcement.Body>
      </Announcement>
      <Announcement tone="ink" variant="banner">
        <Announcement.Rule />
        <Announcement.Body>
          <Announcement.Title>Ingrid Solheim, 1937–2026</Announcement.Title>
          Lectures 3–5 September are postponed; registered participants will receive an email.
        </Announcement.Body>
        <Announcement.Action href="#in-memoriam">Read more</Announcement.Action>
      </Announcement>
    </div>
  ),
};
