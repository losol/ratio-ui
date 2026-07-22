import type { Meta, StoryObj } from '@storybook/react';
import { InlineCode } from './InlineCode';

const meta = {
  title: 'Core/InlineCode',
  component: InlineCode,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InlineCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'npm install',
  },
};

export const InProse: Story = {
  args: {
    children: 'pnpm test',
  },
  render: () => (
    <p>
      Run <InlineCode>pnpm test</InlineCode> before you push, then tag the
      release with <InlineCode>git tag</InlineCode> and let CI publish it.
    </p>
  ),
};
