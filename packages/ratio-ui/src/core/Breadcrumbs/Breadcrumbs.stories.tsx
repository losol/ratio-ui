import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Breadcrumb, Breadcrumbs } from './Breadcrumbs';

const meta = {
  component: Breadcrumbs,
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Localized: Story = {
  args: {
    'aria-label': 'Brødsmuler',
    children: <>
      <Breadcrumb href="/nb">Hjem</Breadcrumb>
      <Breadcrumb href="/nb/tjenester#school">Skole og utdanning</Breadcrumb>
      <Breadcrumb>Regning</Breadcrumb>
    </>,
  },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Brødsmuler' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await expect(within(list).getByText('Regning')).toHaveAttribute('aria-current', 'page');
    for (const separator of within(list).getAllByText('/')) {
      await expect(separator).toBeVisible();
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
    }
  },
};
