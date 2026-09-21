import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
  { id: 'm2', time: '09:44', nick: 'aisha', role: 'voice', text: '@tor do we have extra lanyards?' },
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
