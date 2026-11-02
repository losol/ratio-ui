import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from '../../core/Badge';
import { Button } from '../../core/Button';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Blocks/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    as: { control: 'inline-radio', options: ['h1', 'h2', 'h3'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Title, a line about the page, and the page's primary action. */
export const Default: Story = {
  args: {
    title: 'Events',
    description: '12 events this season · 3 open for registration',
    actions: <Button variant="primary">New event</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Events' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'New event' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('hgroup')).toContainElement(
      canvas.getByText('12 events this season · 3 open for registration'),
    );
  },
};

/** An eyebrow names the area the page belongs to. */
export const WithEyebrow: Story = {
  args: {
    eyebrow: 'Administration',
    title: 'Registrations',
    description: 'Everyone signed up for the autumn programme.',
    actions: (
      <>
        <Button variant="secondary">Export</Button>
        <Button variant="primary">Add registration</Button>
      </>
    ),
  },
};

/** The trailing edge takes a status as well as a button. */
export const WithStatus: Story = {
  args: {
    title: 'Archive dashboard',
    description: 'The Great Library · est. c. 285 BCE',
    actions: (
      <Badge status="success" variant="subtle">
        Catalogue in sync
      </Badge>
    ),
  },
};

/** A section header inside the page: `as="h2"` at the `md` scale. */
export const Section: Story = {
  args: {
    as: 'h2',
    size: 'md',
    title: 'Recent activity',
    actions: <Button variant="secondary">See all</Button>,
  },
};

/** On a phone the actions drop under the title. */
export const Narrow: Story = {
  args: {
    title: 'Events with a rather long title that wraps',
    description: '12 events this season',
    actions: <Button variant="primary">New event</Button>,
  },
  decorators: [
    (StoryFn) => (
      <div className="max-w-80">
        <StoryFn />
      </div>
    ),
  ],
};
