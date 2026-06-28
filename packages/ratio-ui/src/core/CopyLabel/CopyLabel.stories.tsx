import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyLabel } from './CopyLabel';

// All values are obviously-fake demo data — never real secrets.
const DEMO = {
  apiKey: 'demo_api_key_1234567890abcdef',
  email: 'jane.doe@example.com',
  orderRef: 'ORDER-2026-0042',
  shareLink: 'https://example.com/share/abc123',
  longToken:
    'demo_token_0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz',
};

const meta: Meta<typeof CopyLabel> = {
  title: 'Core/CopyLabel',
  component: CopyLabel,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['boxed', 'inline'],
      description: 'Visual variant of the component',
    },
    mono: {
      control: 'boolean',
      description: 'Use monospace font for the value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CopyLabel>;

export const Default: Story = {
  args: {
    label: 'API key',
    value: DEMO.apiKey,
    mono: true,
  },
};

export const Email: Story = {
  args: {
    label: 'Email address',
    value: DEMO.email,
    mono: false,
  },
};

export const OrderReference: Story = {
  args: {
    label: 'Order reference',
    value: DEMO.orderRef,
    mono: true,
  },
};

export const ShareLink: Story = {
  args: {
    label: 'Share link',
    value: DEMO.shareLink,
    mono: false,
  },
};

export const Inline: Story = {
  args: {
    label: 'API key',
    value: DEMO.apiKey,
    variant: 'inline',
    mono: true,
  },
};

export const InlineEmail: Story = {
  args: {
    label: 'Email address',
    value: DEMO.email,
    variant: 'inline',
    mono: false,
  },
};

/**
 * Multiple copy labels in a form-like layout
 */
export const MultipleBoxed: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-[520px]">
      <CopyLabel label="API key" value={DEMO.apiKey} mono />
      <CopyLabel label="Email address" value={DEMO.email} />
      <CopyLabel label="Order reference" value={DEMO.orderRef} mono />
      <CopyLabel label="Share link" value={DEMO.shareLink} />
    </div>
  ),
};

/**
 * Multiple inline copy labels
 */
export const MultipleInline: Story = {
  render: () => (
    <div className="flex flex-col gap-[18px] max-w-[520px]">
      <CopyLabel label="API key" value={DEMO.apiKey} variant="inline" mono />
      <CopyLabel label="Email address" value={DEMO.email} variant="inline" />
      <CopyLabel label="Order reference" value={DEMO.orderRef} variant="inline" mono />
      <CopyLabel label="Share link" value={DEMO.shareLink} variant="inline" />
    </div>
  ),
};

/**
 * Long value that overflows with ellipsis
 */
export const LongValue: Story = {
  args: {
    label: 'Access token',
    value: DEMO.longToken,
    mono: true,
  },
};
