// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BookOpen, Calculator, Compass } from 'lucide-react';
import { AchievementBadge, AchievementBadgeArt } from './AchievementBadge';
import {
  achievementOf,
  bakeSvg,
  defineAchievement,
  defineCredential,
  isOpenBadgeCredential,
  unbakeSvg,
} from '@eventuras/ratio-ui-core/badges';
import { Card } from '../../core/Card';
import { Heading } from '../../core/Heading';

// The achievement is Open Badges JSON: what can be earned, defined once by
// its creator. `defineAchievement` fills in the `type`.
const timesTables = defineAchievement({
  id: 'https://school.example/achievements/times-tables',
  name: 'Times Tables Master',
  description: 'Knows the times tables from 1 to 10.',
  criteria: { narrative: 'Every product from 1 × 1 to 10 × 10 right, twice in a row.' },
  achievementType: 'Competency',
  inLanguage: 'en',
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
  criteria: { narrative: 'The orienteering course in the woods, completed without help.' },
});

// The award: a Verifiable Credential whose subject holds the achievement.
// With one the badge is earned; `validFrom` is the date shown.
const award = defineCredential({
  id: 'urn:uuid:3b7a0c2e-4c1a-4a52-9a2e-7c1f0e0d1a01',
  issuer: { id: 'https://school.example', name: 'Example School' },
  achievement: timesTables,
  subject: { id: 'https://school.example/users/42' },
  validFrom: '2026-10-23T00:00:00Z',
});

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'long' });

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
    achievement: timesTables,
    display: { shape: 'rosette', tier: 'gold', symbol: '×' },
    credential: award,
    formatDate: longDate,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementBadge>;

/**
 * Earned: the medallion in full colour, the name, and the date it was
 * awarded. Two inputs: the `achievement` (Open Badges JSON, what can be
 * earned) and the `credential` (the award, who earned it and when); the
 * `display` says how it is drawn.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Times Tables Master')).toBeInTheDocument();
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
      <AchievementBadge {...args} achievement={{ ...timesTables, name: 'No tier' }} display={{ shape: 'circle', symbol: '×' }} />
      <AchievementBadge {...args} achievement={{ ...timesTables, name: 'Bronze' }} display={{ shape: 'circle', tier: 'bronze', symbol: '×' }} />
      <AchievementBadge {...args} achievement={{ ...timesTables, name: 'Silver' }} display={{ shape: 'circle', tier: 'silver', symbol: '×' }} />
      <AchievementBadge {...args} achievement={{ ...timesTables, name: 'Gold' }} display={{ shape: 'circle', tier: 'gold', symbol: '×' }} />
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
    await expect(canvas.getByText('Not yet earned')).toBeInTheDocument();
    await expect(canvas.getByText('In progress')).toBeInTheDocument();
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
      <AchievementBadge {...args} emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Times' }} />
      <AchievementBadge {...args} achievement={reader} emblem={<BookOpen />} display={{ shape: 'circle', tier: 'silver', caption: '10 books' }} />
      <AchievementBadge {...args} achievement={navigator} emblem={<Compass />} display={{ shape: 'shield', caption: '2026' }} />
      <AchievementBadge {...args} display={{ shape: 'hexagon', tier: 'bronze', symbol: '7', caption: 'Level' }} />
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
    await expect(canvas.getByRole('img', { name: 'Times Tables Master' })).toBeInTheDocument();
    await expect(canvas.getByText(timesTables.criteria.narrative!)).toBeInTheDocument();
  },
};

/**
 * A list of what there is to earn, in rows: the ones earned dated, one
 * underway, one still locked. `nameAs="h3"` makes each name a heading
 * under the list's own.
 */
export const InAList: Story = {
  name: 'In a list',
  render: (args) => (
    <Card>
      <Heading as="h2" className="mb-4">
        Mathematics, year 4
      </Heading>
      <ul className="flex flex-col gap-4 p-0 list-none">
        <li>
          <AchievementBadge {...args} layout="row" nameAs="h3" emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Times' }} />
        </li>
        <li>
          <AchievementBadge {...args} layout="row" nameAs="h3" achievement={reader} credential={undefined} state="in-progress" progress={0.4} emblem={<BookOpen />} display={{ shape: 'circle', tier: 'silver' }} />
        </li>
        <li>
          <AchievementBadge {...args} layout="row" nameAs="h3" achievement={navigator} credential={undefined} emblem={<Compass />} display={{ shape: 'shield' }} />
        </li>
      </ul>
    </Card>
  ),
};

/**
 * From a credential alone. What an app is handed is usually the award —
 * an `OpenBadgeCredential`, from its own issuer or another — and the
 * achievement is inside it: `isOpenBadgeCredential` checks the shape and
 * `achievementOf` takes it out. The look is not in the credential (the
 * spec has no field for it), so the app pairs the achievement's `id` with
 * a `BadgeDisplay` of its own.
 */
export const FromACredential: Story = {
  name: 'From a credential',
  render: () => {
    // As it would arrive: parsed JSON of unknown shape.
    const json: unknown = JSON.parse(JSON.stringify(award));
    if (!isOpenBadgeCredential(json)) return <p>Not an Open Badge.</p>;
    const achievement = achievementOf(json);
    const looks: Record<string, React.ComponentProps<typeof AchievementBadge>['display']> = {
      'https://school.example/achievements/times-tables': { shape: 'rosette', tier: 'gold', symbol: '×' },
    };
    return (
      <AchievementBadge
        achievement={achievement}
        credential={json}
        display={looks[achievement.id]}
        layout="row"
        formatDate={longDate}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Times Tables Master')).toBeInTheDocument();
    await expect(canvas.getByText(/23 October 2026/)).toBeInTheDocument();
  },
};

/**
 * In another language. The achievement's text comes from its creator in
 * whatever language it was written (`inLanguage` says which); the words
 * the component adds — "Earned", "Not yet earned", "In progress" — are
 * `labels`, and the date is `formatDate`. Here, Norwegian.
 */
export const InAnotherLanguage: Story = {
  name: 'In another language',
  render: (args) => {
    const gangemester = defineAchievement({
      ...timesTables,
      id: 'https://skole.example/achievements/gangemester',
      name: 'Gangemester',
      description: 'Kan gangetabellen fra 1 til 10.',
      criteria: { narrative: 'Alle gangestykkene fra 1·1 til 10·10 riktig, to ganger på rad.' },
      inLanguage: 'nb',
    });
    const labels = { earned: 'Oppnådd', locked: 'Ikke oppnådd ennå', inProgress: 'Underveis' };
    const nb = (iso: string) => new Date(iso).toLocaleDateString('nb-NO', { dateStyle: 'long' });
    return (
      <div className="flex flex-wrap items-start gap-8">
        <AchievementBadge {...args} achievement={gangemester} labels={labels} formatDate={nb} />
        <AchievementBadge {...args} achievement={gangemester} labels={labels} credential={undefined} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // getByText matches an element's own text nodes: the label and the <time> are two.
    await expect(canvas.getByText(/^Oppnådd/)).toBeInTheDocument();
    await expect(canvas.getByText('23. oktober 2026')).toBeInTheDocument();
    await expect(canvas.getByText('Ikke oppnådd ennå')).toBeInTheDocument();
  },
};

/** On the printed sheet: the frame thickens and the words go condensed, from the tabula tokens. */
export const OnTabula: Story = {
  parameters: { theme: 'tabula' },
  render: (args) => (
    <Card>
      <div className="flex flex-wrap items-start gap-8">
        <AchievementBadge {...args} emblem={<Calculator />} display={{ shape: 'rosette', tier: 'gold', caption: 'Times' }} />
        <AchievementBadge {...args} achievement={reader} credential={undefined} display={{ shape: 'shield', symbol: '10' }} />
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
        display={{ shape: 'rosette', tier: 'gold', symbol: '×', caption: 'Times' }}
        title="Times Tables Master"
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
        <img src={href} alt="Times Tables Master, as the SVG file" width={120} height={120} />
        <a href={href} download="times-tables.svg">
          Download times-tables.svg
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
