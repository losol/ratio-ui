import { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ShoppingCart } from '../../icons';
import { ActionButton } from '../ActionButton';
import { Button } from '../Button';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Core/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
    },
    variant: {
      control: 'inline-radio',
      options: ['filled', 'subtle', 'count'],
    },
    tone: {
      control: 'inline-radio',
      options: [undefined, 'primary', 'accent', 'inherit'],
    },
    block: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: {
    children: 'Neutral',
    status: 'neutral',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    status: 'info',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    status: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    status: 'warning',
  },
};

export const ErrorStatus: Story = {
  args: {
    children: 'Error',
    status: 'error',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge status="neutral">Neutral</Badge>
      <Badge status="info">Info</Badge>
      <Badge status="success">Success</Badge>
      <Badge status="warning">Warning</Badge>
      <Badge status="error">Error</Badge>
    </div>
  ),
};

export const Subtle: Story = {
  args: {
    children: 'Course',
    status: 'neutral',
    variant: 'subtle',
  },
};

export const SubtleAllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="subtle" status="neutral">Course</Badge>
      <Badge variant="subtle" status="info">Online</Badge>
      <Badge variant="subtle" status="success">Available</Badge>
      <Badge variant="subtle" status="warning">Few seats</Badge>
      <Badge variant="subtle" status="error">Full</Badge>
    </div>
  ),
};

export const Definition: Story = {
  args: {
    children: 'REG-001',
    definition: true,
    label: 'ID',
    status: 'neutral',
  },
};

export const SubtleDefinition: Story = {
  args: {
    children: 'REG-001',
    definition: true,
    label: 'ID',
    status: 'neutral',
    variant: 'subtle',
  },
};

/**
 * `tone` (beta) takes the brand colours instead of a status, for a badge that
 * reports no state.
 */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge tone="primary">New</Badge>
      <Badge tone="accent">Featured</Badge>
    </div>
  ),
};

/**
 * `count` (beta) is a small solid pill for a number or a single glyph — an
 * unread count on `primary`, an `@` for a mention on `accent`. Without a
 * tone it follows `status` like any badge.
 */
export const Count: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Badge variant="count" tone="primary">3</Badge>
      <Badge variant="count" tone="primary">128</Badge>
      <Badge variant="count" tone="accent">@</Badge>
      <Badge variant="count" status="error">!</Badge>
    </div>
  ),
};

/**
 * Composed inside a button: `tone="inherit"` takes the button's own text
 * colour on a translucent tint, so it fits every variant. Wrap the text in
 * `Button.Label` so the badge becomes its own flex item, spaced like the icon.
 * On a `block` button, `className="flex-1 text-start"` on the label pushes the
 * count to the right edge.
 *
 * The count is part of the button's text ("Checkout 3"); an icon-only button
 * named by `aria-label` should say the count there too.
 */
export const InButton: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '22rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button icon={<ShoppingCart size={16} />}>
          <Button.Label>Checkout</Button.Label>
          <Badge variant="count" tone="inherit">3</Badge>
        </Button>
        <Button variant="secondary" icon={<ShoppingCart size={16} />}>
          <Button.Label>Checkout</Button.Label>
          <Badge variant="count" tone="inherit">12</Badge>
        </Button>
        <ActionButton round size="lg" aria-label="Cart, 3 items">
          <ShoppingCart size={18} />
          <Badge variant="count" tone="inherit">3</Badge>
        </ActionButton>
      </div>
      <Button block icon={<ShoppingCart size={16} />}>
        <Button.Label className="flex-1 text-start">Go to checkout</Button.Label>
        <Badge variant="count" tone="inherit">3</Badge>
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: /Checkout ?(3|12)/ })).toHaveLength(2);
    await expect(canvas.getByRole('button', { name: 'Cart, 3 items' })).toHaveTextContent('3');
    await expect(canvas.getByRole('button', { name: /Go to checkout ?3/ })).toBeInTheDocument();
  },
};
