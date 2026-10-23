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

const issuer = { id: 'https://civitas.example', name: 'Civitas skole' };

const gangemester = defineAchievement({
  id: 'https://civitas.example/achievements/gangemester',
  name: 'Gangemester',
  description: 'Kan gangetabellen fra 1 til 10.',
  criteria: { narrative: 'Alle gangestykkene fra 1·1 til 10·10 riktig, to ganger på rad.' },
});
const leser = defineAchievement({
  id: 'https://civitas.example/achievements/leser',
  name: 'Leser',
  description: 'Har lest ti bøker på egen hånd.',
  criteria: { narrative: 'Ti bøker lest og fortalt om i leseloggen.' },
});
const kartleser = defineAchievement({
  id: 'https://civitas.example/achievements/kartleser',
  name: 'Kartleser',
  description: 'Finner fram med kart og kompass.',
  criteria: { narrative: 'Fullført orienteringsløypa uten hjelp.' },
});

const awards = [gangemester, leser, kartleser].map((achievement) =>
  defineCredential({ issuer, achievement, validFrom: '2026-06-18T00:00:00Z' }),
);

const nb = (iso: string) => new Date(iso).toLocaleDateString('nb-NO', { dateStyle: 'long' });
const labels = { earned: 'Oppnådd', locked: 'Ikke oppnådd ennå', inProgress: 'Underveis' };

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
    <Diploma.Eyebrow>Civitas skole</Diploma.Eyebrow>
    <Diploma.Title>Diplom</Diploma.Title>
    <Diploma.Text>tildeles</Diploma.Text>
    <Diploma.Recipient>Ola Nordmann</Diploma.Recipient>
    <Diploma.Text>for oppnådde læringsmål i 4. trinn, skoleåret 2025–2026</Diploma.Text>
    <Diploma.Achievements>
      <AchievementBadge achievement={gangemester} credential={awards[0]} emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Gange' }} formatDate={nb} labels={labels} />
      <AchievementBadge achievement={leser} credential={awards[1]} emblem={<BookOpen />} display={{ shape: 'circle', tier: 'silver', caption: '10 bøker' }} formatDate={nb} labels={labels} />
      <AchievementBadge achievement={kartleser} credential={awards[2]} emblem={<Compass />} display={{ shape: 'shield', caption: '2026' }} formatDate={nb} labels={labels} />
    </Diploma.Achievements>
    <Diploma.Footer>
      <Diploma.Signature name="Kari Lærer" role="Kontaktlærer" />
      <Diploma.Signature name="Per Rektor" role="Rektor" />
    </Diploma.Footer>
    <Diploma.Meta>Oslo, 18. juni 2026</Diploma.Meta>
  </Diploma>
);

/** A diploma: who, from whom, for what — the achievements as badges, with their dates — and the signatures. */
export const Default: Story = {
  args: { children: null },
  render: (args) => sheet(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Diplom' })).toBeInTheDocument();
    await expect(canvas.getByText('Ola Nordmann')).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText('Kari Lærer')).toBeInTheDocument();
  },
};

/** The portrait page, for a preview of the print. The app's `@page` sets the paper size and margins. */
export const A4: Story = {
  args: { sheet: 'a4', children: null },
  render: (args) => sheet(args),
};

/** A seal in the corner: here the school's own medallion. */
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
