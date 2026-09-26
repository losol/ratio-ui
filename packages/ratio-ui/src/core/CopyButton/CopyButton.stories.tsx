import { expect, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from './CopyButton';

const meta: Meta<typeof CopyButton> = {
  title: 'Core/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    showLabel: { control: 'boolean' },
    iconSize: { control: 'number' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    'aria-label': { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

/** Icon-only affordance (default) */
export const Default: Story = {
  args: {
    value: 'demo_api_key_1234567890abcdef',
    'aria-label': 'Copy API key',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Copy API key' })).toBeInTheDocument();
  },
};

/** With a "Copy"/"Copied" text label */
export const WithLabel: Story = {
  args: {
    value: 'https://example.com/share/abc123',
    showLabel: true,
  },
}; 
