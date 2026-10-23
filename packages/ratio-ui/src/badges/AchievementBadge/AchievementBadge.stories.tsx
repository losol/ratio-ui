// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BookOpen, Calculator, Compass } from 'lucide-react';
import { AchievementBadge, AchievementBadgeArt } from './AchievementBadge';
import { bakeSvg, defineAchievement, defineCredential, unbakeSvg } from '@eventuras/ratio-ui-core/badges';
import { Card } from '../../core/Card';
import { Heading } from '../../core/Heading';

const gangemester = defineAchievement({
  id: 'https://civitas.example/achievements/gangemester',
  name: 'Gangemester',
  description: 'Kan gangetabellen fra 1 til 10.',
  criteria: { narrative: 'Alle gangestykkene fra 1·1 til 10·10 riktig, to ganger på rad.' },
  achievementType: 'Competency',
  inLanguage: 'nb',
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
  criteria: { narrative: 'Fullført orienteringsløypa i skogen uten hjelp.' },
});

const award = defineCredential({
  id: 'urn:uuid:3b7a0c2e-4c1a-4a52-9a2e-7c1f0e0d1a01',
  issuer: { id: 'https://civitas.example', name: 'Civitas skole' },
  achievement: gangemester,
  subject: { id: 'https://civitas.example/users/42' },
  validFrom: '2026-10-23T00:00:00Z',
});

const nb = (iso: string) => new Date(iso).toLocaleDateString('nb-NO', { dateStyle: 'long' });

const labels = { earned: 'Oppnådd', locked: 'Ikke oppnådd ennå', inProgress: 'Underveis' };

const meta: Meta<typeof AchievementBadge> = {
  title: 'Badges/AchievementBadge',
  component: AchievementBadge,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['tile', 'row', 'art'] },
    state: { control: 'select', options: [undefined, 'earned', 'locked', 'in-progress'] },
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    size: { control: { type: 'number', min: 24, max: 240 } },
  },
  args: {
    achievement: gangemester,
    display: { shape: 'rosette', tier: 'gold', symbol: '×' },
    credential: award,
    formatDate: nb,
    labels,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementBadge>;

/** Earned: the medallion in full colour, the name, and the date it was awarded. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Gangemester')).toBeInTheDocument();
    const time = canvasElement.querySelector('time');
    await expect(time).toHaveAttribute('datetime', '2026-10-23T00:00:00Z');
    await expect(canvasElement.querySelector('.ratio-achievement')).toHaveAttribute('data-state', 'earned');
  },
};

/** The four outlines. The tier ring follows the same outline, scaled in. */
export const Shapes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <AchievementBadge {...args} display={{ shape: 'circle', tier: 'gold', symbol: '×' }} />
      <AchievementBadge {...args} display={{ shape: 'shield', tier: 'gold', symbol: '×' }} />
      <AchievementBadge {...args} display={{ shape: 'hexagon', tier: 'gold', symbol: '×' }} />
      <AchievementBadge {...args} display={{ shape: 'rosette', tier: 'gold', symbol: '×' }} />
    </div>
  ),
};

/** The metals, and a badge without levels. Gold is gold in every theme. */
export const Tiers: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <AchievementBadge {...args} achievement={{ ...gangemester, name: 'Gangemester' }} display={{ shape: 'circle', symbol: '×' }} />
      <AchievementBadge {...args} achievement={{ ...gangemester, name: 'Bronse' }} display={{ shape: 'circle', tier: 'bronze', symbol: '×' }} />
      <AchievementBadge {...args} achievement={{ ...gangemester, name: 'Sølv' }} display={{ shape: 'circle', tier: 'silver', symbol: '×' }} />
      <AchievementBadge {...args} achievement={{ ...gangemester, name: 'Gull' }} display={{ shape: 'circle', tier: 'gold', symbol: '×' }} />
    </div>
  ),
};

/**
 * Where the learner stands. Without a credential the badge is locked: the
 * outline of what is still to do, in the muted ink. `in-progress` draws
 * the way there around the rim.
 */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <AchievementBadge {...args} />
      <AchievementBadge {...args} credential={undefined} />
      <AchievementBadge {...args} credential={undefined} state="in-progress" progress={0.6} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ikke oppnådd ennå')).toBeInTheDocument();
    await expect(canvas.getByText('Underveis')).toBeInTheDocument();
    const states = [...canvasElement.querySelectorAll('.ratio-achievement')].map((el) =>
      el.getAttribute('data-state'),
    );
    await expect(states).toEqual(['earned', 'locked', 'in-progress']);
  },
};

/**
 * What goes in the middle: a glyph in 24 units (a Lucide icon, drawn in
 * the ink), or a `symbol` — a character or two in the display face. A
 * `caption` is a word under it, in capitals: keep it short.
 */
export const Emblems: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <AchievementBadge {...args} emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Gange' }} />
      <AchievementBadge {...args} achievement={leser} emblem={<BookOpen />} display={{ shape: 'circle', tier: 'silver', caption: '10 bøker' }} />
      <AchievementBadge {...args} achievement={kartleser} emblem={<Compass />} display={{ shape: 'shield', caption: '2026' }} />
      <AchievementBadge {...args} display={{ shape: 'hexagon', tier: 'bronze', symbol: '7', caption: 'Trinn' }} />
      <AchievementBadge {...args} display={{ shape: 'circle', symbol: 'ABC' }} />
    </div>
  ),
};

/**
 * `tile` stacks the words under the medallion; `row` puts a small
 * medallion beside the name and the criteria, for a list; `art` is the
 * medallion alone, named for a screen reader.
 */
export const Layouts: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      <AchievementBadge {...args} layout="tile" />
      <AchievementBadge {...args} layout="row" />
      <AchievementBadge {...args} layout="art" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Gangemester' })).toBeInTheDocument();
    await expect(canvas.getByText(gangemester.criteria.narrative!)).toBeInTheDocument();
  },
};

/** A list of what there is to earn, in rows, with the ones earned dated. */
export const InAList: Story = {
  name: 'In a list',
  render: (args) => (
    <Card>
      <Heading as="h2" className="mb-4">
        Matematikk, 4. trinn
      </Heading>
      <ul className="flex flex-col gap-4 p-0 list-none">
        <li>
          <AchievementBadge {...args} layout="row" nameAs="h3" emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Gange' }} />
        </li>
        <li>
          <AchievementBadge {...args} layout="row" nameAs="h3" achievement={leser} credential={undefined} state="in-progress" progress={0.4} emblem={<BookOpen />} display={{ shape: 'circle', tier: 'silver' }} />
        </li>
        <li>
          <AchievementBadge {...args} layout="row" nameAs="h3" achievement={kartleser} credential={undefined} emblem={<Compass />} display={{ shape: 'shield' }} />
        </li>
      </ul>
    </Card>
  ),
};

/** On the printed sheet: the frame thickens and the words go condensed, from the tabula tokens. */
export const OnTabula: Story = {
  parameters: { theme: 'tabula' },
  render: (args) => (
    <Card>
      <div className="flex flex-wrap items-start gap-8">
        <AchievementBadge {...args} emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Gange' }} />
        <AchievementBadge {...args} achievement={leser} credential={undefined} display={{ shape: 'shield', symbol: '10' }} />
      </div>
    </Card>
  ),
};

/**
 * For a file. `AchievementBadgeArt` is self-contained SVG, so the markup
 * `renderToStaticMarkup` gives is a complete picture — with the colours
 * resolved, since a custom property means nothing outside the page — and
 * `bakeSvg` puts the credential inside it, the way Open Badges 3.0 says.
 * The issuer signs the credential first; this story bakes it unsigned to
 * show the shape.
 */
export const ForAFile: Story = {
  name: 'For a file',
  render: () => {
    const svg = renderToStaticMarkup(
      <AchievementBadgeArt
        display={{ shape: 'rosette', tier: 'gold', symbol: '×', caption: 'Gange' }}
        title="Gangemester"
        colors={{ ink: '#0b6a78', paper: '#ffffff', muted: '#6b7280' }}
        frame={3}
        fontFamily="Georgia, serif"
        width={240}
        height={240}
      />,
    );
    const baked = bakeSvg(svg, award);
    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(baked)}`;
    return (
      <div className="flex flex-col gap-4">
        <img src={href} alt="Gangemester, as the SVG file" width={120} height={120} />
        <a href={href} download="gangemester.svg">
          Download gangemester.svg
        </a>
        <pre className="max-w-full overflow-auto text-xs" data-testid="baked">
          {baked.slice(0, 600)}…
        </pre>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pre = canvas.getByTestId('baked').textContent ?? '';
    await expect(pre).toContain('xmlns:openbadges="https://purl.imsglobal.org/ob/v3p0"');
    await expect(pre).toContain('<openbadges:credential><![CDATA[');
    const img = canvas.getByRole('img', { name: /SVG file/ });
    const { credential } = unbakeSvg(decodeURIComponent(img.getAttribute('src')!.split(',')[1]!));
    await expect(credential).toEqual(award);
  },
};
