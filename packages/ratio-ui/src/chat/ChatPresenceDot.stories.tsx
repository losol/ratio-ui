import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatPresenceDot } from './ChatPresenceDot';

const meta: Meta<typeof ChatPresenceDot> = {
  title: 'Chat/PresenceDot (beta)',
  component: ChatPresenceDot,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    presence: { control: 'inline-radio', options: ['online', 'away'] },
  },
};

export default meta;
type Story = StoryObj<typeof ChatPresenceDot>;

export const Online: Story = {
  args: { presence: 'online', label: 'online' },
};

/** Away is a ring, so it differs from online in shape, not only in colour. */
export const Away: Story = {
  args: { presence: 'away', label: 'away' },
};

/**
 * In a list of people the dot stands alone, so give it a `label` for screen
 * readers. `live` pulses — keep it for the one marker that means "connected
 * right now", not for every person online.
 */
export const InAList: Story = {
  render: () => (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
      <li className="flex items-center gap-2">
        <ChatPresenceDot presence="online" label="online" />
        Ada Lovelace
      </li>
      <li className="flex items-center gap-2">
        <ChatPresenceDot presence="online" label="online" />
        Grace Hopper
      </li>
      <li className="flex items-center gap-2">
        <ChatPresenceDot presence="away" label="away" />
        Alan Turing
      </li>
      <li className="flex items-center gap-2 text-(--text-subtle)">
        <ChatPresenceDot presence="online" live />
        connected
      </li>
    </ul>
  ),
};
