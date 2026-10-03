import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ChatLog, type ChatLogMessage } from './ChatLog';
import { Button } from '../core/Button';

const meta: Meta<typeof ChatLog> = {
  title: 'Chat/Log (beta)',
  component: ChatLog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The dense, IRC-style log for channels: one line per message, role glyphs on nicks, join/part events and `/me` actions. Purely presentational — the consumer owns the messages and the scroll.',
      },
    },
  },
  // The log fills its parent's height, so give it one.
  decorators: [
    Story => (
      <div className="flex h-[420px] max-w-3xl flex-col rounded-lg border border-border-1 bg-surface">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatLog>;

const volunteers: ChatLogMessage[] = [
  { id: 'd1', type: 'divider', text: 'Today' },
  { id: 'e1', type: 'event', time: '09:41', text: 'marcus has joined #volunteers' },
  {
    id: 'm1',
    time: '09:42',
    nick: 'ingrid',
    role: 'op',
    text: 'Morning all — badge printing starts at 10 in the foyer.',
  },
  {
    id: 'm2',
    time: '09:44',
    nick: 'aisha',
    role: 'voice',
    text: '@tor do we have extra lanyards?',
    reactions: [{ emoji: '👍', count: 2, me: true }],
  },
  { id: 'm3', time: '09:46', nick: 'tor', role: 'op', text: 'Two boxes behind the desk. Ask for @jonas.' },
  { id: 'a1', type: 'action', time: '09:53', nick: 'marcus', text: 'heads to room 2.04' },
  {
    id: 'e2',
    type: 'event',
    time: '09:58',
    text: 'ingrid set the topic to "Shifts, badges and where the coffee is."',
  },
  { id: 'd2', type: 'divider', text: 'New messages' },
  {
    id: 'm4',
    time: '10:03',
    nick: 'ingrid',
    role: 'op',
    text: 'Printers are live. Queue is short, come by if you have five minutes.',
    reactions: [
      { emoji: '🎉', count: 3 },
      { emoji: '🙏', count: 1 },
    ],
  },
  {
    id: 'm5',
    time: '10:04',
    nick: 'sofie',
    role: 'op',
    text: 'Reminder that the 11:00 keynote hall opens at 10:30 — we need four people on doors.',
  },
  { id: 'm6', time: '10:04', nick: 'tor', role: 'op', text: "I'll take door A. Anyone for B–D?" },
  { id: 'm7', time: '10:05', nick: 'marcus', text: 'B' },
  { id: 'm8', time: '10:05', nick: 'aisha', role: 'voice', text: 'C for me' },
  { id: 'e3', type: 'event', time: '10:06', text: 'lena has joined #volunteers' },
  { id: 'm9', time: '10:06', nick: 'lena', text: 'back — D is mine' },
];

/**
 * A channel as `tor` sees it. Ops carry `@`, voiced users `+`; your own nick
 * takes the voice colour, and a row that mentions you gets the accent band.
 */
export const Channel: Story = {
  args: { messages: volunteers, me: 'tor', 'aria-label': '#volunteers' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The band is visual only; screen readers get the note instead.
    await expect(canvas.getAllByText('Mentions you:', { exact: false })).toHaveLength(1);
    // Role glyphs are hidden, and the role is named instead of read as "at".
    for (const glyph of canvas.getAllByText('@', { exact: true })) {
      await expect(glyph.getAttribute('aria-hidden')).toBe('true');
    }
    await expect(canvas.getAllByText('(op)', { exact: false }).length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('(voice)', { exact: false }).length).toBeGreaterThan(0);
  },
};

/**
 * Mentions match the nick whatever its case or Unicode form, and only the
 * whole nick: `@åsen` is someone else.
 */
export const MentionMatching: Story = {
  args: {
    me: 'åse',
    'aria-label': '#mentions',
    labels: { mentionsYou: 'Nevner deg' },
    messages: [
      { id: '1', time: '10:00', nick: 'tor', text: '@Åse, composed and capitalised' },
      // "a" plus a combining ring: the same name, spelled decomposed.
      { id: '2', time: '10:01', nick: 'tor', text: '@a\u030Ase, decomposed' },
      { id: '3', time: '10:02', nick: 'tor', text: '@åsen is someone else' },
      { id: '4', time: '10:03', nick: 'tor', text: 'åse without the @' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Nevner deg:', { exact: false })).toHaveLength(2);
  },
};

/**
 * http(s) URLs in messages and `/me` actions are links that open in a new
 * tab. Sentence punctuation stays outside the link, a parenthesis that opens
 * inside the URL stays in it, and a `@nick` inside a URL is not a mention.
 * Other schemes and bare `www.` hosts stay plain text.
 */
export const Links: Story = {
  args: {
    me: 'tor',
    'aria-label': '#links',
    messages: [
      { id: '1', time: '10:00', nick: 'ingrid', role: 'op', text: 'Slides are up at https://example.org/talks/2026/keynote.' },
      { id: '2', time: '10:01', nick: 'aisha', text: 'Background reading: https://en.wikipedia.org/wiki/Mercury_(planet), then the planning page (https://example.org/plan).' },
      { id: '3', time: '10:02', nick: 'tor', text: 'Mind the schedule, @aisha — https://example.org/@aisha/schedule is yours, not a mention.' },
      { id: '4', time: '10:03', nick: 'marcus', text: 'Not links: www.example.org, javascript:alert(1) and mailto:desk@example.org.' },
      { id: '5', time: '10:04', nick: 'sofie', text: 'Also «https://example.org/room-2.04»! Breaks anywhere: https://example.org/a-very-long-path/that-keeps-going/and-going/with-no-spaces-in-it-at-all/until-the-row-would-overflow' },
      { id: 'a1', type: 'action', time: '10:05', nick: 'marcus', text: 'posts https://example.org/photos?day=2' },
      { id: 'e1', type: 'event', time: '10:06', text: 'ingrid set the topic to https://example.org/topic' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hrefs = canvas.getAllByRole('link').map(a => a.getAttribute('href'));
    await expect(hrefs).toEqual([
      'https://example.org/talks/2026/keynote',
      'https://en.wikipedia.org/wiki/Mercury_(planet)',
      'https://example.org/plan',
      'https://example.org/@aisha/schedule',
      'https://example.org/room-2.04',
      'https://example.org/a-very-long-path/that-keeps-going/and-going/with-no-spaces-in-it-at-all/until-the-row-would-overflow',
      'https://example.org/photos?day=2',
    ]);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer ugc');
      await expect(link).toHaveAccessibleName(/opens in a new tab/);
    }
    // The URL's `@aisha` is part of the link; the one before it is the mention.
    await expect(canvas.getAllByText('@aisha', { exact: true })).toHaveLength(1);
    // An address is not a mention either.
    await expect(canvas.queryByText('@example', { exact: true })).toBeNull();
    // Event rows stay plain.
    await expect(canvas.getByText(/set the topic to https:/).querySelector('a')).toBeNull();
    // A long URL never widens the log.
    await expect(canvasElement.scrollWidth).toBe(canvasElement.clientWidth);
  },
};

// A neutral thumbnail, so the stories load nothing from the network.
const thumbnail = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(${hue} 40% 55%)"/><circle cx="24" cy="26" r="9" fill="hsl(${hue} 40% 80%)"/><path d="M4 56l18-20 12 14 10-8 16 14z" fill="hsl(${hue} 40% 35%)"/></svg>`,
  )}`;

const linkPreviews: ChatLogMessage[] = [
  {
    id: 'p1',
    time: '11:02',
    nick: 'ingrid',
    role: 'op',
    text: 'The venue map is up: https://example.org/venue/map',
    preview: {
      url: 'https://example.org/venue/map',
      siteName: 'Example Venue',
      title: 'Map of the conference centre',
      description: 'Halls, rooms, coffee and the quiet corners — on one page.',
      image: { src: thumbnail(210), width: 64, height: 64 },
    },
  },
  {
    id: 'p2',
    time: '11:04',
    nick: 'aisha',
    role: 'voice',
    text: 'And the volunteer handbook https://example.org/handbook',
    preview: {
      url: 'https://example.org/handbook',
      title: 'Volunteer handbook',
      description: 'Shifts, badges, who to call.',
    },
    reactions: [{ emoji: '🙏', count: 2 }],
  },
  {
    id: 'p3',
    time: '11:05',
    nick: 'tor',
    role: 'op',
    text: 'Nothing to preview here: https://example.org/empty',
    preview: { url: 'https://example.org/empty' },
  },
];

/**
 * `preview` puts a card under the text: site name (or the host), title and
 * description, with a square thumbnail when there is an image. The whole
 * card is one link, named by the title. A preview with neither title nor
 * description is not shown.
 */
export const LinkPreview: Story = {
  args: { messages: linkPreviews, me: 'tor', 'aria-label': '#previews' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = canvas.getByRole('link', { name: 'Map of the conference centre opens in a new tab' });
    await expect(map).toHaveAttribute('href', 'https://example.org/venue/map');
    await expect(map).toHaveAttribute('rel', 'noopener noreferrer ugc');
    const img = map.querySelector('img')!;
    await expect(img).toHaveAttribute('alt', '');
    await expect(img).toHaveAttribute('loading', 'lazy');
    // The host stands in for a missing site name.
    const handbook = canvas.getByRole('link', { name: 'Volunteer handbook opens in a new tab' });
    await expect(handbook).toHaveTextContent('example.org');
    await expect(handbook.querySelector('img')).toBeNull();
    // Three text links and two cards: the empty preview draws nothing.
    await expect(canvas.getAllByRole('link')).toHaveLength(5);
  },
};

/** Long titles and descriptions clamp to two lines each; the card never grows past them. */
export const LinkPreviewLongText: Story = {
  args: {
    me: 'tor',
    'aria-label': '#previews',
    messages: [
      {
        id: 'l1',
        time: '11:10',
        nick: 'sofie',
        role: 'op',
        text: 'Worth a read before Thursday https://example.org/articles/long-form',
        preview: {
          url: 'https://example.org/articles/long-form',
          siteName: 'Example Journal',
          title:
            'A very long title that goes on about the history of knowledge sharing in learned societies, the circulation of letters and the slow birth of the public lecture',
          description:
            'The description is longer still. It summarises the article in several sentences, mentions the author, the issue and the date, and keeps going well past the point where a card has room for it, so the card cuts it off after two lines.',
          image: { src: thumbnail(30) },
        },
      },
    ],
  },
};

/** In a narrow log the card spans the whole row, under the stacked header. */
export const LinkPreviewNarrow: Story = {
  args: { messages: linkPreviews, me: 'tor', 'aria-label': '#previews' },
  decorators: [Story => <div className="flex h-full w-[360px] flex-col"><Story /></div>],
};

/**
 * Below 32rem of log width (a phone, or a side panel — the log measures
 * itself, not the viewport) each message stacks: nick and time on one line,
 * the text on its own below, over the full width. Events, actions and
 * dividers keep their single line.
 */
export const Narrow: Story = {
  args: { messages: volunteers, me: 'tor', 'aria-label': '#volunteers' },
  decorators: [Story => <div className="flex h-full w-[360px] flex-col"><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByText('Morning all — badge printing starts at 10 in the foyer.');
    const row = text.closest('.group\\/row')!;
    const [time, nick] = row.querySelectorAll(':scope > span');
    // Nick first on the header line, the time beside it; the text below, at the row's left edge.
    await expect(nick!.getBoundingClientRect().left).toBeLessThan(time!.getBoundingClientRect().left);
    // Same line: the two boxes overlap vertically (their fonts differ in size).
    await expect(time!.getBoundingClientRect().top).toBeLessThan(nick!.getBoundingClientRect().bottom);
    await expect(time!.getBoundingClientRect().bottom).toBeGreaterThan(nick!.getBoundingClientRect().top);
    await expect(text.getBoundingClientRect().top).toBeGreaterThan(nick!.getBoundingClientRect().bottom - 1);
    await expect(Math.round(text.getBoundingClientRect().left)).toBe(Math.round(nick!.getBoundingClientRect().left));
  },
};

/** The card reads on a dark surface too, with the same tokens. */
export const LinkPreviewDark: Story = {
  args: { messages: linkPreviews, me: 'tor', 'aria-label': '#previews' },
  decorators: [Story => <div className="surface-dark flex flex-1 flex-col bg-surface"><Story /></div>],
};

const tap = async (el: Element, { drift = 0 } = {}) => {
  const { left, top } = el.getBoundingClientRect();
  const [x, y] = [left + 2, top + 2];
  const opts = { pointerType: 'touch', bubbles: true, composed: true };
  el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, clientX: x, clientY: y }));
  el.dispatchEvent(
    new PointerEvent('pointerup', { ...opts, clientX: x + drift, clientY: y }),
  );
};

/** A router's Link stands in for `a`: same props, and it tags what it renders. */
const RouterLink = ({ href, children, ...rest }: ComponentProps<'a'>) => (
  <a href={href} data-router {...rest}>
    {children}
  </a>
);

/** Every message gets its own address; events and dividers have none. */
const withHref = (m: ChatLogMessage): ChatLogMessage =>
  m.type && m.type !== 'msg' ? m : { ...m, href: `#/rooms/volunteers/${m.id}` };

/**
 * With `href` the time is a link to the message — the usual chat permalink,
 * in-app and in the same tab, rendered through `LinkComponent` so a router can
 * navigate without a reload. With `onCopyLink` the bar gets a "Copy link"
 * button on those messages; the caller copies, since it knows the absolute
 * URL. A message without `href` keeps a plain time and no copy button.
 */
export const MessageLinks: Story = {
  args: {
    messages: [
      ...volunteers.map(withHref),
      { id: 'nolink', time: '10:06', nick: 'ingrid', role: 'op', text: 'This one has no address.' },
    ],
    me: 'tor',
    'aria-label': '#volunteers',
    LinkComponent: RouterLink,
    onToggleReaction: fn(),
    onCopyLink: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Message from ingrid at 09:42' });
    await expect(link).toHaveAttribute('href', '#/rooms/volunteers/m1');
    await expect(link).toHaveAttribute('data-router');
    await expect(link.getAttribute('target')).toBeNull();
    // Without an address the time is plain text.
    const plain = canvas.getByText('This one has no address.').closest('.group\\/row')!;
    await expect(plain.querySelector('a')).toBeNull();
    // "Copy link" sits in the bar, only on messages with an address.
    const bars = canvas.getAllByRole('toolbar', { name: 'React to message' });
    const copy = within(bars[0]!).getByRole('button', { name: 'Copy link' });
    copy.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onCopyLink).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
    await expect(within(bars.at(-1)!).queryByRole('button', { name: 'Copy link' })).toBeNull();
  },
};

/** A read-only log with `onCopyLink` still gets a bar, with just that button. */
export const ReadOnlyCopyLink: Story = {
  args: { messages: volunteers.map(withHref), me: 'tor', 'aria-label': '#volunteers', onCopyLink: fn() },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getAllByRole('toolbar', { name: 'React to message' })[0]!;
    await expect(within(bar).getAllByRole('button')).toHaveLength(1);
    await expect(within(bar).getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
  },
};

/**
 * On touch there is no hover, so the bar over a message would never show and
 * its reactions and "Copy link" would be out of reach on a phone. A tap
 * reports the message it landed on through `onActivate`, and the caller
 * decides what is open by passing `activeId` back — the log keeps no state,
 * so this is the caller's to own, as `highlightedId` is.
 *
 * A tap on another message moves the bar, the same message again puts it
 * away, and taps on a link — the text's own URLs, or the time — are left
 * alone. A scroll is not a tap.
 */
export const TapToReveal: Story = {
  render: function TapToRevealStory(args) {
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    return <ChatLog {...args} activeId={activeId} onActivate={setActiveId} />;
  },
  args: {
    messages: volunteers.map(withHref),
    me: 'tor',
    'aria-label': '#volunteers',
    LinkComponent: RouterLink,
    onToggleReaction: fn(),
    onCopyLink: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvasElement.querySelector<HTMLElement>('[data-message-id="m1"]')!;
    const other = canvasElement.querySelector<HTMLElement>('[data-message-id="m2"]')!;
    const text = () => within(row).getByText(/badge printing/);
    const otherText = () => within(other).getByText(/extra lanyards/);

    // A finger, not a mouse: hover never happens, so the row starts closed.
    await expect(row).not.toHaveAttribute('data-active');

    await tap(text());
    await waitFor(() => expect(row).toHaveAttribute('data-active'));

    // The same message again puts the bar away.
    await tap(text());
    await waitFor(() => expect(row).not.toHaveAttribute('data-active'));

    // Another message moves it rather than opening a second bar.
    await tap(text());
    await waitFor(() => expect(row).toHaveAttribute('data-active'));
    await tap(otherText());
    await waitFor(() => expect(other).toHaveAttribute('data-active'));
    await expect(row).not.toHaveAttribute('data-active');

    // A tap that drifts is a scroll, and leaves the bar where it is.
    await tap(text(), { drift: 40 });
    await expect(other).toHaveAttribute('data-active');

    // The time keeps its own tap, so the permalink still opens.
    await tap(canvas.getByRole('link', { name: 'Message from ingrid at 09:42' }));
    await expect(other).toHaveAttribute('data-active');
  },
};

/** Without `onActivate` the log ignores taps, exactly as it did before. */
export const TapIgnoredWithoutHandler: Story = {
  args: { messages: volunteers.map(withHref), me: 'tor', 'aria-label': '#volunteers', onToggleReaction: fn() },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>('[data-message-id="m1"]')!;
    await tap(within(row).getByText(/badge printing/));
    await expect(row).not.toHaveAttribute('data-active');
  },
};

const older: ChatLogMessage[] = Array.from({ length: 40 }, (_, i) => ({
  id: `old${i}`,
  time: `08:${String(i).padStart(2, '0')}`,
  nick: ['ingrid', 'aisha', 'tor', 'marcus'][i % 4]!,
  text: `Earlier message #${i + 1}`,
}));

/**
 * `highlightedId` points at one message: its row gets a tinted band and
 * `aria-current`, and the log scrolls it to the middle of its own scroll
 * box. If the row isn't there yet — history still loading — the scroll
 * happens when it arrives, once; messages posted afterwards leave the view
 * where it is.
 */
export const Highlighted: Story = {
  render: function HighlightedStory() {
    const [messages, setMessages] = useState(volunteers);
    const loadOlder = () => setMessages(prev => [...older, ...prev]);
    const post = () =>
      setMessages(prev => [
        ...prev,
        { id: `n${prev.length}`, time: '10:07', nick: 'marcus', text: `Update #${prev.length}` },
      ]);
    return (
      <>
        <ChatLog messages={messages} me="tor" aria-label="#volunteers" highlightedId="old20" testId="log" />
        <div className="flex gap-2 border-t border-border-1 p-3">
          <Button size="sm" variant="outline" onPress={loadOlder}>
            Load older messages
          </Button>
          <Button size="sm" variant="outline" onPress={post}>
            Post a message
          </Button>
        </div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = canvas.getByTestId('log');
    // Keyboard-driven, like the other stories: a pointer click would switch
    // the page's focus modality and hide the reaction bar in later tests.
    const press = async (name: string) => {
      canvas.getByRole('button', { name }).focus();
      await userEvent.keyboard('{Enter}');
    };
    // Not loaded yet: nothing is current, nothing scrolls.
    await expect(log.querySelector('[aria-current]')).toBeNull();
    await press('Load older messages');
    const row = (await canvas.findByText('Earlier message #21')).closest('[aria-current="true"]');
    await expect(row).not.toBeNull();
    // Scrolled to the middle of the log, inside the log.
    await waitFor(() => {
      const r = row!.getBoundingClientRect();
      const l = log.getBoundingClientRect();
      expect(Math.abs((r.top + r.bottom) / 2 - (l.top + l.bottom) / 2)).toBeLessThan(r.height);
    });
    // Let the smooth scroll finish before measuring.
    await waitFor(async () => {
      const before = log.scrollTop;
      await new Promise(r => setTimeout(r, 150));
      expect(log.scrollTop).toBe(before);
    });
    const scrollTop = log.scrollTop;
    // A message posted later doesn't pull the view back.
    await press('Post a message');
    await canvas.findByText(/Update #/);
    await expect(Math.abs(log.scrollTop - scrollTop)).toBeLessThan(2);
  },
};

/** Add your reaction, or take it back; a reaction nobody has left goes away. */
const toggle = (reactions: ChatLogMessage['reactions'] = [], emoji: string) => {
  const hit = reactions.find(r => r.emoji === emoji);
  const next = hit
    ? reactions.map(r => (r === hit ? { ...r, me: !r.me, count: r.count + (r.me ? -1 : 1) } : r))
    : [...reactions, { emoji, count: 1, me: true }];
  return next.filter(r => r.count > 0);
};

/**
 * Reactions sit under the message text. Hover a message, or tab to it, and a
 * bar offers quick reactions and a picker with more. The log reports the
 * message and the emoji either way; the caller updates `reactions`, here in
 * local state.
 */
export const Reactions: Story = {
  render: function ReactionsStory() {
    const [messages, setMessages] = useState(volunteers);

    const toggleReaction = (messageId: string, emoji: string) =>
      setMessages(prev =>
        prev.map(m => (m.id !== messageId ? m : { ...m, reactions: toggle(m.reactions, emoji) })),
      );

    return (
      <ChatLog
        messages={messages}
        me="tor"
        aria-label="#volunteers"
        onToggleReaction={toggleReaction}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const bars = canvas.getAllByRole('toolbar', { name: 'React to message' });
    const bar = within(bars[0]!);
    // Driven by keyboard: synthetic hover doesn't set :hover, and keyboard
    // focus is what shows the bar without a pointer.
    const press = async (name: string) => {
      bar.getByRole('button', { name }).focus();
      await userEvent.keyboard('{Enter}');
    };

    await waitFor(() => expect(getComputedStyle(bars[0]!).opacity).toBe('0'));
    bar.getByRole('button', { name: 'React with 👍' }).focus();
    await waitFor(() => expect(getComputedStyle(bars[0]!).opacity).toBe('1'));

    // A quick reaction on a message with none yet adds it.
    await press('React with ❤️');
    await waitFor(() => expect(canvas.getByText('❤️ 1')).toBeInTheDocument());

    // The picker offers more; picking one adds it too.
    await press('More reactions');
    const party = await body.findByRole('menuitem', { name: 'React with 🎉' });
    party.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('🎉 1')).toBeInTheDocument());

    // Picking one you already left takes it back.
    await press('React with ❤️');
    await waitFor(() => expect(canvas.queryByText('❤️ 1')).toBeNull());
  },
};

/** Without `onToggleReaction` the reactions are read-only, and there is no bar. */
export const ReadOnly: Story = {
  args: { messages: volunteers, me: 'tor', 'aria-label': '#volunteers' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('toolbar', { name: 'React to message' })).toBeNull();
  },
};

/** The arrow keys move between the bar's buttons; Tab leaves the bar. */
export const ReactionBarKeyboard: Story = {
  args: {
    messages: [{ id: 'k1', time: '10:00', nick: 'ingrid', text: 'Tab to me' }],
    'aria-label': '#keyboard',
    onToggleReaction: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('toolbar', { name: 'React to message' });
    within(bar).getByRole('button', { name: 'React with 👍' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(bar).getByRole('button', { name: 'React with ❤️' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(within(bar).getByRole('button', { name: 'More reactions' })).toHaveFocus();
  },
};

/**
 * The log never scrolls itself — the ref is the scroll container, so the
 * caller picks the policy. This one follows new messages only while you are
 * already at the bottom, and leaves you alone when you have scrolled up to
 * read.
 */
export const FollowNewMessages: Story = {
  render: function FollowNewMessagesStory() {
    const logRef = useRef<HTMLDivElement>(null);
    const atBottom = useRef(true);
    const [messages, setMessages] = useState(volunteers);

    useEffect(() => {
      const log = logRef.current;
      if (log && atBottom.current) log.scrollTop = log.scrollHeight;
    }, [messages]);

    const post = () => {
      const log = logRef.current;
      // Measure before the new row lands; 24px of slack counts as "at the bottom".
      atBottom.current = !log || log.scrollHeight - log.scrollTop - log.clientHeight < 24;
      setMessages(prev => [
        ...prev,
        { id: `n${prev.length}`, time: '10:07', nick: 'marcus', text: `Update #${prev.length - volunteers.length + 1}` },
      ]);
    };

    return (
      <>
        <ChatLog ref={logRef} messages={messages} me="tor" aria-label="#volunteers" />
        <div className="border-t border-border-1 p-3">
          <Button size="sm" variant="outline" onPress={post}>
            Post a message
          </Button>
        </div>
      </>
    );
  },
};
