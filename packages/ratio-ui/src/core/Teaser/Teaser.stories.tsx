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
  eyebrow: 'Nyheter · 21. okt. 2026',
  title: 'Ny giv for allmennlegetjenesten i nord',
  lead: 'Helsetjenesten er i endring. Flere og mer komplekse pasienter tvinger frem mer tverrfaglig samarbeid.',
  seed: 'nord',
};

const opinion = {
  eyebrow: 'Ytring · 20. okt. 2026',
  title: 'En nord-norsk helsepolitikk?',
  lead: 'Så mange forhold gjør oss forskjellige fra resten av landet.',
  seed: 'ytring',
};

const stories = [
  lead,
  opinion,
  {
    eyebrow: 'Nyheter · 19. okt. 2026',
    title: 'Flere generalister og høyere lønn i nord',
    lead: 'Engasjementet var stort både i panel og sal da bærekraftprosjektet ble debattert.',
    seed: 'panel',
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
      <Teaser href="#" variant="row" eyebrow="9. nov. 2026" title="Grunnkurs D — Allmennlegen som forsker" />
      <Teaser href="#" variant="row" eyebrow="1. des. 2026" title="Emnekurs i helserett" />
      <Teaser href="#" variant="row" eyebrow="21. des. 2026" title="Kirurgi i allmennpraksis" image={picture('kirurgi')} />
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
