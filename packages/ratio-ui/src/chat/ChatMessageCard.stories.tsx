import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChatMessageCard } from './ChatMessageCard';
import type { ChatLogMessage } from './ChatLog';

const meta: Meta<typeof ChatMessageCard> = {
  title: 'Chat/MessageCard (beta)',
  component: ChatMessageCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One message on its own page: author, date and room, the text with links and mentions as in the log, the link preview and read-only reactions, and a link back to the message in its room. The app fetches the message; the card only shows it.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatMessageCard>;

// A neutral thumbnail, so the stories load nothing from the network.
const thumbnail = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(210 40% 55%)"/><circle cx="24" cy="26" r="9" fill="hsl(210 40% 80%)"/><path d="M4 56l18-20 12 14 10-8 16 14z" fill="hsl(210 40% 35%)"/></svg>',
)}`;

const message: ChatLogMessage = {
  id: 'm1',
  time: '11:02',
  nick: 'ingrid',
  role: 'op',
  text: 'The venue map is up: https://example.org/venue/map — ask @tor if a room is missing.',
  preview: {
    url: 'https://example.org/venue/map',
    siteName: 'Example Venue',
    title: 'Map of the conference centre',
    description: 'Halls, rooms, coffee and the quiet corners — on one page.',
    image: { src: thumbnail },
  },
  reactions: [
    { emoji: '👍', count: 3, me: true },
    { emoji: '🙏', count: 1 },
  ],
};

/** The message with everything: a link in the text, a preview, reactions and a way back to the room. */
export const Default: Story = {
  args: {
    message,
    dateTime: 'Thursday 2 October 2026, 11:02',
    room: '#volunteers',
    roomHref: '#/rooms/volunteers/m1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('article', { name: 'ingrid, Thursday 2 October 2026, 11:02' });
    await expect(card).toHaveAttribute('data-message-id', 'm1');
    await expect(canvas.getByRole('link', { name: /^See in the room/ })).toHaveAttribute(
      'href',
      '#/rooms/volunteers/m1',
    );
    await expect(canvas.getByRole('link', { name: /Map of the conference centre/ })).toBeInTheDocument();
    await expect(canvas.getByText('@tor')).toBeInTheDocument();
    await expect(within(card).getByText('👍 3')).toBeInTheDocument();
  },
};

/** A deleted message keeps its place but shows `labels.removed` instead of the text. */
export const Removed: Story = {
  args: {
    message,
    dateTime: 'Thursday 2 October 2026, 11:02',
    room: '#volunteers',
    roomHref: '#/rooms/volunteers/m1',
    removed: true,
    labels: { removed: 'Denne meldingen er fjernet.', seeInRoom: 'Se i rommet' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Denne meldingen er fjernet.')).toBeInTheDocument();
    await expect(canvas.queryByText(/venue map/)).toBeNull();
    await expect(canvas.queryByRole('link', { name: /Map of the conference centre/ })).toBeNull();
    await expect(canvas.getByRole('link', { name: /^Se i rommet/ })).toBeInTheDocument();
  },
};

/** At phone width the preview card spans the whole card. */
export const Narrow: Story = {
  args: Default.args,
  decorators: [
    Story => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/** The card on a dark surface, with the same tokens. */
export const Dark: Story = {
  args: Default.args,
  decorators: [
    Story => (
      <div className="surface-dark rounded-lg bg-surface p-4">
        <Story />
      </div>
    ),
  ],
};

/**
 * A message's prompt is read-only on its own page: it is answered in the
 * room. An answered one shows its receipt, an open one what was asked.
 */
export const WithPrompt: Story = {
  render: args => (
    <div className="flex flex-col gap-3">
      <ChatMessageCard
        {...args}
        testId="answered"
        message={{
          id: 'p1',
          nick: 'concierge',
          text: 'Three rooms are free at 14:00. Which one should I book?',
          prompt: {
            kind: 'choice',
            title: 'Room for the briefing',
            options: [
              { value: 'a', label: 'Room 2.04' },
              { value: 'b', label: 'Room 2.11' },
            ],
            response: { kind: 'choice', values: ['b'] },
          },
        }}
      />
      <ChatMessageCard
        {...args}
        testId="open"
        message={{
          id: 'p2',
          nick: 'concierge',
          text: 'Which shift can you take?',
          prompt: {
            kind: 'choice',
            options: [
              { value: 'doors', label: 'Doors' },
              { value: 'badges', label: 'Badges' },
            ],
          },
        }}
      />
    </div>
  ),
  args: {
    dateTime: 'Thursday 2 October 2026, 13:40',
    room: '#briefing',
    labels: { prompt: { answered: 'Svart' } },
  },
  play: async ({ canvasElement }) => {
    const answered = within(within(canvasElement).getByTestId('answered'));
    await expect(answered.getByRole('group', { name: 'Room for the briefing' })).toHaveTextContent('Svart Room 2.11');
    const open = within(within(canvasElement).getByTestId('open'));
    await expect(open.getAllByRole('listitem')).toHaveLength(2);
    await expect(open.queryByRole('button')).toBeNull();
    await expect(open.queryByRole('radio')).toBeNull();
  },
};
