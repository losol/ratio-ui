import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChatUsers } from './ChatUsers';

const meta: Meta<typeof ChatUsers> = {
  title: 'Chat/Users (beta)',
  component: ChatUsers,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Who is in the room: ops first, then voiced users, then everyone else, alphabetically. Away people collapse to one line at the bottom — a long list of absent names is noise. Every label is passed in, so no English ships in the component.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatUsers>;

const users = [
  { nick: 'marcus' },
  { nick: 'ingrid', role: 'op' as const },
  { nick: 'lena' },
  { nick: 'aisha', role: 'voice' as const },
  { nick: 'tor', role: 'op' as const, you: true },
  { nick: 'jonas', role: 'voice' as const },
  { nick: 'frida' },
  { nick: 'nora', away: true },
  { nick: 'elias', away: true },
];

/** The aside of a channel, at its usual 200px. */
export const InAChannel: Story = {
  render: args => (
    <div className="h-96 w-50 border border-border-1">
      <ChatUsers {...args} />
    </div>
  ),
  args: {
    users,
    'aria-label': 'People in #volunteers',
  },
};

/** Norwegian through `labels`: the headings take the counts the component makes. */
export const Localized: Story = {
  render: InAChannel.render,
  args: {
    ...InAChannel.args,
    labels: {
      online: (n) => `${n} pålogget`,
      away: (n) => `Borte · ${n}`,
      you: 'deg',
      op: 'op',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('7 pålogget')).toBeInTheDocument();
    await expect(canvas.getByText('Borte · 2')).toBeInTheDocument();
    await expect(canvas.getByText('deg')).toBeInTheDocument();
  },
};

/** With nobody away, the bottom line is left out entirely. */
export const AllPresent: Story = {
  render: InAChannel.render,
  args: {
    ...InAChannel.args,
    users: users.filter(u => !u.away),
  },
};
