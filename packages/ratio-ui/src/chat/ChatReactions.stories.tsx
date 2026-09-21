import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatReactions, type ChatReaction } from './ChatReactions';

const meta: Meta<typeof ChatReactions> = {
  title: 'Chat/Reactions (beta)',
  component: ChatReactions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The emoji tally under a message, built on `ToggleButtonGroup variant="tints"`. Controlled: it reports the emoji and the caller updates the counts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatReactions>;

/**
 * Click a reaction to add or remove yours. The row is one tab stop; the arrow
 * keys move between reactions, and Space or Enter toggles.
 */
export const Toggle: Story = {
  render: function ToggleStory() {
    const [reactions, setReactions] = useState<ChatReaction[]>([
      { emoji: '👍', count: 4, me: true },
      { emoji: '🎉', count: 1 },
      { emoji: '👀', count: 2 },
    ]);

    const toggle = (emoji: string) =>
      setReactions(prev =>
        prev.map(r => (r.emoji === emoji ? { ...r, me: !r.me, count: r.count + (r.me ? -1 : 1) } : r)),
      );

    return <ChatReactions reactions={reactions} onToggle={toggle} aria-label="Reactions" />;
  },
};
