// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BookOpen, Calculator, Compass } from 'lucide-react';
import { Diploma } from './Diploma';
import { AchievementBadge, AchievementBadgeArt } from '../AchievementBadge';
import { defineAchievement, defineCredential } from '@eventuras/ratio-ui-core/badges';

const issuer = { id: 'https://school.example', name: 'Example School' };

const timesTables = defineAchievement({
  id: 'https://school.example/achievements/times-tables',
  name: 'Times Tables Master',
  description: 'Knows the times tables from 1 to 10.',
  criteria: { narrative: 'Every product from 1 × 1 to 10 × 10 right, twice in a row.' },
});
const reader = defineAchievement({
  id: 'https://school.example/achievements/reader',
  name: 'Reader',
  description: 'Has read ten books on their own.',
  criteria: { narrative: 'Ten books read and written up in the reading log.' },
});
const navigator = defineAchievement({
  id: 'https://school.example/achievements/navigator',
  name: 'Navigator',
  description: 'Finds the way with a map and a compass.',
  criteria: { narrative: 'The orienteering course, completed without help.' },
});

// One credential per achievement, all awarded on the same day: a diploma
// is the year's awards gathered on one sheet.
const awards = [timesTables, reader, navigator].map((achievement) =>
  defineCredential({ issuer, achievement, validFrom: '2026-06-18T00:00:00Z' }),
);

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'long' });

const meta: Meta<typeof Diploma> = {
  title: 'Badges/Diploma',
  component: Diploma,
  tags: ['autodocs'],
  argTypes: {
    sheet: { control: 'select', options: [undefined, 'a4'] },
  },
};

export default meta;
type Story = StoryObj<typeof Diploma>;

const sheet = (args: React.ComponentProps<typeof Diploma>) => (
  <Diploma {...args}>
    <Diploma.Eyebrow>Example School</Diploma.Eyebrow>
    <Diploma.Title>Diploma</Diploma.Title>
    <Diploma.Text>is awarded to</Diploma.Text>
    <Diploma.Recipient>Alex Example</Diploma.Recipient>
    <Diploma.Text>for the learning goals reached in year 4, school year 2025–2026</Diploma.Text>
    <Diploma.Achievements>
      <AchievementBadge achievement={timesTables} credential={awards[0]} emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Times' }} formatDate={longDate} />
      <AchievementBadge achievement={reader} credential={awards[1]} emblem={<BookOpen />} display={{ shape: 'circle', tier: 'silver', caption: '10 books' }} formatDate={longDate} />
      <AchievementBadge achievement={navigator} credential={awards[2]} emblem={<Compass />} display={{ shape: 'shield', caption: '2026' }} formatDate={longDate} />
    </Diploma.Achievements>
    <Diploma.Footer>
      <Diploma.Signature name="Sam Teacher" role="Class teacher" />
      <Diploma.Signature name="Robin Head" role="Head teacher" />
    </Diploma.Footer>
    <Diploma.Meta>Oslo, 18 June 2026</Diploma.Meta>
  </Diploma>
);

/**
 * A diploma, in reading order: who issues it (`Eyebrow`), the big word
 * (`Title`, an `h1`), to whom (`Recipient`), for what (`Text`), the
 * achievements as badges with their dates (`Achievements`, one list item
 * per badge), the signatures (`Footer`, `Signature`) and the small print
 * (`Meta`). Plain markup, so it renders on the server and prints as it
 * shows.
 */
export const Default: Story = {
  args: { children: null },
  render: (args) => sheet(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Diploma' })).toBeInTheDocument();
    await expect(canvas.getByText('Alex Example')).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText('Sam Teacher')).toBeInTheDocument();
  },
};

/**
 * The portrait page, for a preview of the print: `sheet="a4"` holds the
 * proportion and pushes the footer to the foot. The app's `@page` sets
 * the paper size and margins; the diploma itself only keeps together and
 * drops its shadow in print.
 */
export const A4: Story = {
  args: { sheet: 'a4', children: null },
  render: (args) => sheet(args),
};

/** A seal in the corner: the school's own medallion, a `Stamp`, or a logo — any element. */
export const WithSeal: Story = {
  name: 'With a seal',
  args: {
    sheet: 'a4',
    children: null,
    seal: <AchievementBadgeArt display={{ shape: 'rosette', symbol: 'C' }} width={72} height={72} />,
  },
  render: (args) => sheet(args),
};

/** On Tabula the frame is thick and the words condensed, as the rest of the printed sheet. */
export const OnTabula: Story = {
  parameters: { theme: 'tabula' },
  args: { sheet: 'a4', children: null },
  render: (args) => sheet(args),
};
