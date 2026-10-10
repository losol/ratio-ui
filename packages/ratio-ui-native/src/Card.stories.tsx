import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { View } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Heading, Text } from './Text';
import { BothModes } from './storyFrame';

const meta: Meta<typeof Card> = {
  title: 'Native/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'A card on the theme\'s card surface, with its border, corner and shadow. With `onPress` it is one pressable target and lifts while pressed — the web card\'s hover, where touch has none.',
      },
    },
  },
  decorators: [
    Story => (
      <BothModes>
        <Story />
      </BothModes>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <View style={{ gap: 8 }}>
        <Text size="xs" tone="subtle" family="mono">
          14.–16. SEP 2026
        </Text>
        <Heading level={3}>Knowledge-sharing summit</Heading>
        <Text tone="muted">Three days of talks, workshops and long lunches in the conference centre.</Text>
        <Button>Register</Button>
      </View>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const [heading] = within(canvasElement).getAllByRole('heading', { name: 'Knowledge-sharing summit' });
    const card = heading!.closest('div[style*="border"]') ?? heading!.parentElement!.parentElement!;
    await expect(getComputedStyle(card).boxShadow).toMatch(/2px 2px 0px/);
  },
};

/** Each elevation tier; Bureau gives all three the same hard shadow, and `none` is flat. */
export const Elevation: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {(['none', 'xs', 'sm', 'md'] as const).map(elevation => (
        <Card key={elevation} elevation={elevation} padding="s">
          <Text>elevation="{elevation}"</Text>
        </Card>
      ))}
    </View>
  ),
};

/**
 * `featured`: the card that should stand out, framed by the theme — in
 * Bureau a thick primary border with no shadow, as on the web.
 */
export const Featured: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Card featured>
        <Heading level={3}>Good morning</Heading>
        <Text tone="muted">The card that should stand out.</Text>
      </Card>
      <Card>
        <Text>An ordinary card.</Text>
      </Card>
    </View>
  ),
  play: async ({ canvasElement }) => {
    const [heading] = within(canvasElement).getAllByRole('heading', { name: 'Good morning' });
    const card = heading!.closest('div[style*="border"]') ?? heading!.parentElement!;
    await expect(getComputedStyle(card).borderTopWidth).toBe('8px');
    await expect(getComputedStyle(card).boxShadow).toBe('none');
  },
};

/** With `onPress` the whole card is one button, named by its content. */
export const Pressable: Story = {
  args: { onPress: fn() },
  render: args => (
    <Card onPress={args.onPress} aria-label="Open the volunteer handbook">
      <View style={{ gap: 4 }}>
        <Heading level={4}>Volunteer handbook</Heading>
        <Text tone="muted" size="sm">
          Shifts, badges, who to call.
        </Text>
      </View>
    </Card>
  ),
  play: async ({ canvasElement, args }) => {
    const [card] = within(canvasElement).getAllByRole('button', { name: 'Open the volunteer handbook' });
    await userEvent.click(card!);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
