import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatUnreadBadge } from './ChatUnreadBadge';

const meta: Meta<typeof ChatUnreadBadge> = {
  title: 'Chat/UnreadBadge (beta)',
  component: ChatUnreadBadge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ChatUnreadBadge>;

export const Unread: Story = {
  args: { count: 3, label: '3 unread' },
};

/** A mention with nothing unread shows `@` on the accent colour. */
export const Mention: Story = {
  args: { mention: true, label: 'mentioned' },
};

/**
 * One thing at a time: when there are unread messages and a mention, the
 * count wins, and the label carries both. Nothing unread and no mention
 * renders nothing.
 */
export const InRoomRows: Story = {
  render: () => (
    <ul className="m-0 flex w-56 list-none flex-col gap-1 p-0 text-sm">
      {[
        { room: '# general', count: 0, mention: false },
        { room: '# speakers', count: 3, mention: false, label: '3 unread' },
        { room: '# volunteers', count: 5, mention: true, label: '5 unread, mentioned' },
        { room: '# av-support', count: 0, mention: true, label: 'mentioned' },
      ].map(row => (
        <li key={row.room} className="flex items-center justify-between rounded px-2.5 py-1.5">
          <span className={row.count || row.mention ? 'font-semibold' : 'text-(--text-muted)'}>
            {row.room}
          </span>
          <ChatUnreadBadge count={row.count} mention={row.mention} label={row.label} />
        </li>
      ))}
    </ul>
  ),
};
