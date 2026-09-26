import { Meta, StoryFn } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Loading } from './Loading';

const meta: Meta<typeof Loading> = {
  component: Loading,
  tags: ['autodocs'],
};

export default meta;

type LinkStory = StoryFn;

const Template: LinkStory = (args) => <Loading {...args} />;

export const Playground = Template.bind({});
Playground.storyName = 'Playground';

export const Default = Template.bind({});

/** `labels` translates the status; `showLabel` shows it next to the spinner. */
export const LabelledAndShown: LinkStory = () => (
  <div className="flex flex-col gap-4">
    <Loading labels={{ loading: 'Laster inn…' }} />
    <Loading labels={{ loading: 'Henter ordre…' }} showLabel />
  </div>
);
LabelledAndShown.play = async ({ canvasElement }) => {
  const statuses = within(canvasElement).getAllByRole('status');
  const hidden = statuses[0]!;
  const shown = statuses[1]!;
  await expect(hidden).toHaveTextContent('Laster inn…');
  await expect(within(hidden).getByText('Laster inn…')).toHaveClass('sr-only');
  await expect(within(shown).getByText('Henter ordre…')).toBeVisible();
};
