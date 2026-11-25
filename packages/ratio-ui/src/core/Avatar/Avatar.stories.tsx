import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Core/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  args: {
    name: 'Leo Losen',
    size: 'md',
  },
};

export const SingleWordName: Story = {
  args: {
    name: 'Ola',
    size: 'md',
  },
};

export const ManualInitials: Story = {
  args: {
    name: 'Leo van der Losen',
    initials: 'lv',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Ada Lovelace',
    src: 'https://i.pravatar.cc/100?img=1',
    size: 'md',
  },
};

/**
 * When the image fails to load, the component hides the `<img>` and
 * shows the initials underneath instead of leaving the browser's
 * broken-image indicator on the badge. This story uses an invalid
 * `data:` URL so the failure is synchronous — no real network request.
 */
export const FallsBackToInitialsOnError: Story = {
  args: {
    name: 'Leo Losen',
    src: 'data:image/png;base64,not-a-real-image',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar name="Leo Losen" size="sm" />
        <span className="text-xs text-(--text-muted)">sm — 30px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar name="Leo Losen" size="md" />
        <span className="text-xs text-(--text-muted)">md — 40px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar name="Leo Losen" size="lg" />
        <span className="text-xs text-(--text-muted)">lg — 44px</span>
      </div>
    </div>
  ),
};

/**
 * Beside a visible name, as in a byline or a list of people, the avatar is
 * `decorative`: hidden from assistive technology, so a screen reader reads
 * the name once instead of the label, the initials and the name.
 */
export const BesideAName: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-x-7 gap-y-4 list-none p-0 m-0">
      <li className="flex items-center gap-3">
        <Avatar name="Kari Nordmann" src="https://i.pravatar.cc/100?img=5" size="lg" decorative />
        <span className="flex flex-col leading-tight">
          <span className="font-semibold">Kari Nordmann</span>
          <span className="text-sm text-(--text-muted)">Text</span>
        </span>
      </li>
      <li className="flex items-center gap-3">
        <Avatar name="Ola Hansen" size="lg" decorative />
        <span className="flex flex-col leading-tight">
          <span className="font-semibold">Ola Hansen</span>
          <span className="text-sm text-(--text-muted)">Photos</span>
        </span>
      </li>
    </ul>
  ),
};

export const InsideMenuTrigger: Story = {
  render: () => (
    <button
      type="button"
      className="inline-flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-border-2 bg-card text-(--text) hover:border-(--primary) transition-colors"
    >
      <Avatar name="Leo Losen" size="sm" />
      <span className="text-sm">leo@losen.com</span>
    </button>
  ),
};
