import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { View } from 'react-native';
import type { ChatLogMessage } from '@eventuras/ratio-ui-core/chat';
import { ChatLog } from './ChatLog';
import { BothModes } from '../storyFrame';

const meta: Meta<typeof ChatLog> = {
  title: 'Native/Chat Log (beta)',
  component: ChatLog,
  parameters: {
    docs: {
      description: {
        component:
          'The channel log for React Native, shown through react-native-web: nick and time above the text, as the web lays out a narrow log. Links and mentions are read by `@eventuras/ratio-ui-core/chat`, the same rules as the web\'s `Chat.Log`.',
      },
    },
  },
  args: { onOpenLink: fn() },
  decorators: [
    Story => (
      <BothModes>
        <View style={{ height: 520 }}>
          <Story />
        </View>
      </BothModes>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatLog>;

// A neutral thumbnail, so the stories load nothing from the network.
const thumbnail = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(210 40% 55%)"/><circle cx="24" cy="26" r="9" fill="hsl(210 40% 80%)"/><path d="M4 56l18-20 12 14 10-8 16 14z" fill="hsl(210 40% 35%)"/></svg>',
)}`;

const volunteers: ChatLogMessage[] = [
  { id: 'd1', type: 'divider', text: 'Today' },
  { id: 'e1', type: 'event', time: '09:41', text: 'marcus has joined #volunteers' },
  {
    id: 'm1',
    time: '09:42',
    nick: 'ingrid',
    role: 'op',
    text: 'Morning all — badge printing starts at 10. Map: https://example.org/venue/map.',
    preview: {
      url: 'https://example.org/venue/map',
      siteName: 'Example Venue',
      title: 'Map of the conference centre',
      description: 'Halls, rooms, coffee and the quiet corners — on one page.',
      image: { src: thumbnail },
    },
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
  { id: 'm5', time: '10:04', nick: 'marcus', text: 'B' },
];

/** Add your reaction, or take it back. */
const toggle = (reactions: ChatLogMessage['reactions'] = [], emoji: string) => {
  const hit = reactions.find(r => r.emoji === emoji);
  const next = hit
    ? reactions.map(r => (r === hit ? { ...r, me: !r.me, count: r.count + (r.me ? -1 : 1) } : r))
    : [...reactions, { emoji, count: 1, me: true }];
  return next.filter(r => r.count > 0);
};

/**
 * A channel as `tor` sees it: a mention of you gets the band, ops carry `@`
 * and voiced users `+`, links and the preview open through `onOpenLink`,
 * and tapping a reaction adds or takes back yours.
 */
export const Channel: Story = {
  render: function ChannelStory(args) {
    const [messages, setMessages] = useState(volunteers);
    return (
      <ChatLog
        {...args}
        messages={messages}
        me="tor"
        onToggleReaction={(id, emoji) =>
          setMessages(prev => prev.map(m => (m.id === id ? { ...m, reactions: toggle(m.reactions, emoji) } : m)))
        }
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    // Light and dark render side by side, so every query finds two.
    const all = within(canvasElement);
    // The header speaks the role's name and the mention.
    await expect(all.getAllByLabelText('aisha (voice), 09:44, mentions you')).toHaveLength(2);
    await expect(all.getAllByLabelText('ingrid (op), 09:42')).toHaveLength(2);
    // The link in the text, and the card, open through onOpenLink.
    const [link] = all.getAllByText('https://example.org/venue/map');
    await userEvent.click(link!);
    await expect(args.onOpenLink).toHaveBeenLastCalledWith('https://example.org/venue/map');
    const [card] = all.getAllByRole('link', { name: 'Map of the conference centre' });
    await userEvent.click(card!);
    await expect(args.onOpenLink).toHaveBeenCalledTimes(2);
    // The sentence's full stop stays outside the link.
    await expect(link!.textContent).toBe('https://example.org/venue/map');
    // Tapping a reaction you left takes it back.
    const [thumbs] = all.getAllByRole('button', { name: '👍 2' });
    await expect(thumbs).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(thumbs!);
    await expect(all.getAllByRole('button', { name: '👍 1' })[0]).toHaveAttribute('aria-pressed', 'false');
  },
};

/** Without `onToggleReaction` the reactions are read-only. */
export const ReadOnly: Story = {
  args: { messages: volunteers, me: 'tor' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('button', { name: /🎉/ })).toHaveLength(0);
  },
};
