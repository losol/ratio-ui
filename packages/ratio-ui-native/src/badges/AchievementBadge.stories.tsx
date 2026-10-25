import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { View } from 'react-native';
import { Path } from 'react-native-svg';
import { AchievementBadge } from './AchievementBadge';
import { Heading } from '../Text';
import { Card } from '../Card';
import { BothModes } from '../storyFrame';
import { defineAchievement, defineCredential } from '@eventuras/ratio-ui-core/badges';

// The same achievements as the web's stories: the data is shared, so what
// an app shows is what the site shows.
const timesTables = defineAchievement({
  id: 'https://school.example/achievements/times-tables',
  name: 'Times Tables Master',
  description: 'Knows the times tables from 1 to 10.',
  criteria: { narrative: 'Every product from 1 × 1 to 10 × 10 right, twice in a row.' },
  achievementType: 'Competency',
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

const award = defineCredential({
  issuer: { id: 'https://school.example', name: 'Example School' },
  achievement: timesTables,
  validFrom: '2026-10-23T00:00:00Z',
});

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'long' });

// A 24-unit glyph as react-native-svg elements, as `lucide-react-native`
// gives: Lucide's "calculator", drawn in `currentColor`.
const calculator = (
  <>
    <Path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const meta: Meta<typeof AchievementBadge> = {
  title: 'Native/AchievementBadge',
  component: AchievementBadge,
  parameters: {
    docs: {
      description: {
        component:
          'An Open Badges achievement as a medallion with its name, criteria and date — the web\'s `AchievementBadge` for the app, drawn through `react-native-svg` from the same `BadgeDisplay` and the same outline geometry in `@eventuras/ratio-ui-core/badges`. Import it from `@eventuras/ratio-ui-native/badges`.',
      },
    },
  },
  decorators: [
    Story => (
      <BothModes>
        <Story />
      </BothModes>
    ),
  ],
  args: {
    achievement: timesTables,
    display: { shape: 'rosette', tier: 'gold', symbol: '×' },
    credential: award,
    formatDate: longDate,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementBadge>;

/** Earned: the medallion in the theme's ink on its card paper, the name in the display face, and the date. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Times Tables Master')).toHaveLength(2);
    await expect(canvas.getAllByText('Earned 23 October 2026')).toHaveLength(2);
  },
};

/** The four outlines, from the geometry the web draws with. */
export const Shapes: Story = {
  render: args => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {(['circle', 'shield', 'hexagon', 'rosette'] as const).map(shape => (
        <AchievementBadge key={shape} {...args} display={{ shape, tier: 'gold', symbol: '×' }} />
      ))}
    </View>
  ),
};

/** Where the learner stands: earned, locked (the dashed outline in the subtle ink), and in progress with the way there around the rim. */
export const States: Story = {
  render: args => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      <AchievementBadge {...args} />
      <AchievementBadge {...args} credential={undefined} />
      <AchievementBadge {...args} credential={undefined} state="in-progress" progress={0.6} />
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Not yet earned')).toHaveLength(2);
    await expect(canvas.getAllByText('In progress')).toHaveLength(2);
  },
};

/** What goes in the middle: a glyph in 24 units (react-native-svg elements, as a Lucide icon gives), a symbol, a caption. */
export const Emblems: Story = {
  render: args => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      <AchievementBadge {...args} emblem={calculator} display={{ shape: 'rosette', tier: 'gold', caption: 'Times' }} />
      <AchievementBadge {...args} achievement={reader} display={{ shape: 'circle', tier: 'silver', symbol: '10', caption: 'books' }} />
      <AchievementBadge {...args} achievement={navigator} display={{ shape: 'shield', symbol: 'N', caption: '2026' }} />
    </View>
  ),
};

/** A list of what there is to earn, in rows on a card, with the criteria beside each medallion. */
export const InAList: Story = {
  render: args => (
    <Card>
      <View style={{ gap: 12 }}>
        <Heading level={3}>Mathematics, year 4</Heading>
        <AchievementBadge {...args} layout="row" emblem={calculator} display={{ shape: 'rosette', tier: 'gold' }} />
        <AchievementBadge {...args} layout="row" achievement={reader} credential={undefined} state="in-progress" progress={0.4} display={{ shape: 'circle', tier: 'silver', symbol: '10' }} />
        <AchievementBadge {...args} layout="row" achievement={navigator} credential={undefined} display={{ shape: 'shield', symbol: 'N' }} />
      </View>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(timesTables.criteria.narrative!)).toHaveLength(2);
  },
};
