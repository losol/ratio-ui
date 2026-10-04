import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { View } from 'react-native';
import { Button } from './Button';
import { BothModes } from './storyFrame';

const meta: Meta<typeof Button> = {
  title: 'Native/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'A button in the theme\'s shape: radius, resting shadow and press. Bureau moves the button into its hard shadow on press, so it sinks into the page.',
      },
    },
  },
  args: { onPress: fn() },
  decorators: [
    Story => (
      <BothModes>
        <Story />
      </BothModes>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: args => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Button {...args}>Register</Button>
      <Button {...args} variant="secondary">
        Later
      </Button>
      <Button {...args} variant="outline">
        Details
      </Button>
      <Button {...args} variant="text">
        Skip
      </Button>
      <Button {...args} variant="danger">
        Cancel booking
      </Button>
    </View>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const [register] = canvas.getAllByRole('button', { name: 'Register' });
    // Bureau's hard shadow at rest.
    await expect(getComputedStyle(register!).boxShadow).toMatch(/2px 2px 0px/);
    await userEvent.click(register!);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

export const Sizes: Story = {
  render: args => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args}>Medium</Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </View>
  ),
};

/** A disabled button is announced as such and ignores presses. */
export const Disabled: Story = {
  render: args => (
    <Button {...args} disabled>
      Sold out
    </Button>
  ),
  play: async ({ canvasElement, args }) => {
    const [button] = within(canvasElement).getAllByRole('button', { name: 'Sold out' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button!, { pointerEventsCheck: 0 });
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
