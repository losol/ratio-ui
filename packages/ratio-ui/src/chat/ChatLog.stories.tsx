import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
    await expect(canvas.getByText('❤️ 1')).toBeInTheDocument();

    // The picker offers more; picking one adds it too.
    await press('More reactions');
    const party = await body.findByRole('menuitem', { name: 'React with 🎉' });
    party.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('🎉 1')).toBeInTheDocument();

    // Picking one you already left takes it back.
    await press('React with ❤️');
    await expect(canvas.queryByText('❤️ 1')).toBeNull();
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
