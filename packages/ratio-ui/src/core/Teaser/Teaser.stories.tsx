import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Teaser } from './Teaser';

const meta: Meta<typeof Teaser> = {
  title: 'Core/Teaser',
  component: Teaser,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One story as a link: picture, eyebrow, title and lead, in the magazine look. `md` is a card in a grid, `lg` the lead story, `row` a line in a compact list. The picture is fitted to the frame, so any image element will do.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Teaser>;

const picture = (seed: string) => (
  <img src={`https://picsum.photos/seed/${seed}/960/640`} alt="" />
);

const lead = {
  eyebrow: 'Teaching · 21 Oct 2026',
  title: 'What a good explanation does, and how to write one',
  lead: 'The best explanations answer the question the reader has not asked yet. A look at how three teachers structure theirs.',
  seed: 'explain',
};

const opinion = {
  eyebrow: 'Opinion · 20 Oct 2026',
  title: 'Stop grading the reading list',
  lead: 'A reading list is an invitation, not a syllabus. Why one department dropped the quiz.',
  seed: 'reading',
};

const stories = [
  lead,
  opinion,
  {
    eyebrow: 'Research · 19 Oct 2026',
    title: 'Spaced repetition works. Most courses still ignore it',
    lead: 'Forty years of evidence, and a schedule that fits a term. What it would take to use it.',
    seed: 'spaced',
  },
];

export const Card: Story = {
  args: {
    href: '#',
    ...lead,
    image: picture(lead.seed),
  },
  render: args => (
    <div className="max-w-sm">
      <Teaser {...args} />
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-3">
      {stories.map(s => (
        <Teaser key={s.seed} href="#" eyebrow={s.eyebrow} title={s.title} lead={s.lead} image={picture(s.seed)} />
      ))}
    </div>
  ),
};

export const Featured: Story = {
  parameters: {
    docs: { description: { story: 'The lead story large, the next ones as rows beside it.' } },
  },
  render: () => (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:items-start">
      <Teaser href="#" variant="lg" {...lead} image={picture(lead.seed)} />
      <div className="flex flex-col border-t border-border-1">
        {stories.slice(1).map(s => (
          <Teaser key={s.seed} href="#" variant="row" eyebrow={s.eyebrow} title={s.title} image={picture(s.seed)} />
        ))}
      </div>
    </div>
  ),
};

export const Rows: Story = {
  parameters: {
    docs: { description: { story: 'A compact list, with or without pictures: the next courses, say.' } },
  },
  render: () => (
    <div className="max-w-lg flex flex-col border-t border-border-1">
      <Teaser href="#" variant="row" eyebrow="9 Nov 2026" title="Writing for readers who skim" />
      <Teaser href="#" variant="row" eyebrow="1 Dec 2026" title="Peer review in the classroom" />
      <Teaser href="#" variant="row" eyebrow="21 Dec 2026" title="Teaching with worked examples" image={picture('examples')} />
    </div>
  ),
};

export const WithoutPicture: Story = {
  args: { href: '#', ...opinion },
  render: args => (
    <div className="max-w-sm">
      <Teaser {...args} />
    </div>
  ),
};
