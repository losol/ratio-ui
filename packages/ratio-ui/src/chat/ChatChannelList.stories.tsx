import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ChatChannelList, type ChatChannelListSection } from './ChatChannelList';
import { ChatPresenceDot } from './ChatPresenceDot';
import { Avatar } from '../core/Avatar';
import { Sidebar } from '../layout/Sidebar';
import { Settings } from '../icons';

const meta: Meta<typeof ChatChannelList> = {
  title: 'Chat/ChannelList (beta)',
  component: ChatChannelList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The room list, mapped onto `NavTree`. Rooms are buttons (`activeId` + `onSelect`) or links (`href` + `currentPath`); unread rooms read as bold, muted ones recede. Screen-reader text for the badges comes from `labels`, with English defaults.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatChannelList>;

const labels = {
  unread: (n: number) => `${n} unread`,
  mention: 'mentioned',
  muted: 'muted',
  members: (n: number) => `${n} members`,
  presence: (presence: 'online' | 'away') => presence,
};

type Alerts = Record<string, { unread?: number; mention?: boolean }>;

const sections = (alerts: Alerts): ChatChannelListSection[] => [
  {
    label: 'Channels',
    rooms: [
      { id: 'general', kind: 'channel', name: 'general', members: 128, ...alerts.general },
      { id: 'volunteers', kind: 'channel', name: 'volunteers', members: 47, ...alerts.volunteers },
      { id: 'speakers', kind: 'channel', name: 'speakers', ...alerts.speakers },
      { id: 'av-support', kind: 'channel', name: 'av-support', muted: true, members: 12 },
    ],
  },
  {
    label: 'Groups',
    rooms: [{ id: 'stage-crew', kind: 'group', name: 'stage-crew', members: 6 }],
  },
  {
    label: 'Direct',
    rooms: [
      { id: 'marcus', kind: 'dm', name: 'Marcus Berg', presence: 'online', ...alerts.marcus },
      { id: 'ingrid', kind: 'dm', name: 'Ingrid Solheim', presence: 'online' },
      { id: 'aisha', kind: 'dm', name: 'Aisha Khan', presence: 'away' },
    ],
  },
];

/**
 * Rooms as buttons: the open one is `activeId`, and picking another reports
 * its id. Opening a room reads it, so the count and the mention both go —
 * the caller decides that, here in local state.
 */
export const Rooms: Story = {
  render: function RoomsStory() {
    const [active, setActive] = useState('volunteers');
    const [alerts, setAlerts] = useState<Alerts>({
      speakers: { unread: 3, mention: true },
      marcus: { unread: 1 },
    });
    // Opening a room reads it: the count and the mention both go.
    const open = (id: string) => {
      setActive(id);
      setAlerts(prev => ({ ...prev, [id]: {} }));
    };

    return (
      <div className="w-58">
        <ChatChannelList
          aria-label="Rooms"
          sections={sections(alerts)}
          activeId={active}
          onSelect={open}
          labels={labels}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The badge shows only the count; screen readers hear the mention too.
    await expect(canvas.getByText('3 unread, mentioned')).toBeInTheDocument();
    await expect(canvas.getByText('1 unread')).toBeInTheDocument();
    // Opening the room reads it.
    await userEvent.click(canvas.getByText('speakers'));
    await expect(canvas.queryByText('3 unread, mentioned')).toBeNull();
  },
};

/**
 * Give the rooms a `href` and they become links instead — one URL per room,
 * so the back button and "open in a new tab" work. Pass your router's link
 * as `LinkComponent`.
 */
export const AsLinks: Story = {
  args: {
    'aria-label': 'Rooms',
    currentPath: '/chat/volunteers',
    labels,
    sections: [
      {
        label: 'Channels',
        rooms: [
          { id: 'general', kind: 'channel', name: 'general', href: '/chat/general', members: 128 },
          { id: 'volunteers', kind: 'channel', name: 'volunteers', href: '/chat/volunteers', members: 47 },
          { id: 'speakers', kind: 'channel', name: 'speakers', href: '/chat/speakers', unread: 3 },
        ],
      },
    ],
  },
  render: args => (
    <div className="w-58">
      <ChatChannelList {...args} />
    </div>
  ),
};

/**
 * The whole sidebar: `layout/Sidebar` holds the parts, the list scrolls in
 * the middle, and the chat surface token paints the column. Title, presence
 * text and the footer are the app's own — the list only owns the rooms.
 */
export const InASidebar: Story = {
  render: function SidebarStory() {
    const [active, setActive] = useState('volunteers');

    return (
      <div className="h-[32rem]">
        <Sidebar
          width={232}
          aria-label="Chat"
          className="h-full bg-(--chat-sidebar-bg)"
          style={{ height: '100%' }}
        >
          <Sidebar.Header>
            <div className="flex w-full items-center gap-2.5">
              <span className="font-serif text-[1.125rem] font-semibold tracking-[-0.01em]">
                Eventuras chat
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-(--text-subtle)">
                <ChatPresenceDot presence="online" live />
                online
              </span>
            </div>
          </Sidebar.Header>
          <Sidebar.Body>
            <ChatChannelList
              aria-label="Rooms"
              sections={sections({ speakers: { unread: 3 }, marcus: { unread: 1 } })}
              activeId={active}
              onSelect={setActive}
              labels={labels}
            />
          </Sidebar.Body>
          <Sidebar.Footer>
            <div className="flex w-full items-center gap-2.5">
              <Avatar initials="TE" name="Tor Eide" size="sm" />
              <span className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold">Tor Eide</span>
                <span className="text-[11px] text-(--text-subtle)">tor · organizer</span>
              </span>
              <Settings size={16} aria-hidden className="ml-auto text-(--text-subtle)" />
            </div>
          </Sidebar.Footer>
        </Sidebar>
      </div>
    );
  },
};
