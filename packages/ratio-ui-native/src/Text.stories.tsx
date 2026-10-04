import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Heading, Text } from './Text';
import { BothModes } from './storyFrame';

const meta: Meta<typeof Text> = {
  title: 'Native/Text',
  component: Text,
  parameters: {
    docs: {
      description: {
        component:
          '`@eventuras/ratio-ui-native` — React Native, shown here through react-native-web. Text in the theme\'s body font, size and colour; Heading in the display font, announced with its level.',
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
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  render: () => (
    <>
      <Heading level={1}>Spaced repetition</Heading>
      <Heading level={3}>Why it works</Heading>
      <Text>Reviewing right before you forget beats cramming. The interval grows with each recall.</Text>
      <Text tone="muted" size="sm">
        Muted, a step down: the date, the author, a count.
      </Text>
      <Text tone="subtle" size="xs" family="mono">
        subtle · mono · 09:42
      </Text>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [h1] = canvas.getAllByRole('heading', { level: 1, name: 'Spaced repetition' });
    await expect(h1).toBeInTheDocument();
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    // The display face is Bureau's pixel font.
    await expect(getComputedStyle(h1!).fontFamily).toContain('Pixelify Sans');
  },
};

/** Every step of the type scale, in points at the phone end of the web's fluid range. */
export const Scale: Story = {
  render: () => (
    <>
      {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'] as const).map(size => (
        <Text key={size} size={size}>
          {size} — The quick brown fox
        </Text>
      ))}
    </>
  ),
};
