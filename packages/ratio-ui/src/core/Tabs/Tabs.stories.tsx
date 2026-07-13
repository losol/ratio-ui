import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Tabs } from '../Tabs';

const meta = {
  title: 'Core/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    controls: { hideNoControlsWarning: true },
    docs: {
      description: {
        component:
          'Accessible tabs built on react-aria-components. Provide one or more `<Tabs.Item title="…">…</Tabs.Item>` children.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic usage — one subject, three angles: the life of Marie Curie. */
export const Basic: Story = {
  args: {
    children: (
      <>
        <Tabs.Item id="life" title="Life">
          <p className="mb-2 font-semibold">Maria Skłodowska (1867–1934)</p>
          <p>
            Born in Warsaw, she moved to Paris to study at the Sorbonne — one of
            few universities then open to women — and worked from a shed-turned-lab
            with her husband Pierre.
          </p>
        </Tabs.Item>

        <Tabs.Item id="discoveries" title="Discoveries">
          <p className="mb-2 font-semibold">Polonium and radium, 1898</p>
          <p>
            Curie isolated two new elements and coined the term{' '}
            <em>radioactivity</em> for the radiation they emitted — showing it was
            a property of the atom itself, not a chemical reaction.
          </p>
        </Tabs.Item>

        <Tabs.Item id="legacy" title="Legacy">
          <p className="mb-2 font-semibold">Two Nobel Prizes, two sciences</p>
          <p>
            Physics (1903) and Chemistry (1911) — still the only person awarded
            Nobel Prizes in two different sciences. Her notebooks remain
            radioactive to this day.
          </p>
        </Tabs.Item>
      </>
    ),
  },
  render: (args) => (
    <div className="w-[720px] max-w-full">
      <Tabs {...args} />
    </div>
  ),
};

/**
 * Many tabs demonstrate horizontal scroll/overflow — a small gallery of
 * knowledge heroes, one contribution each.
 */
export const ManyTabsOverflow: Story = {
  args: {
    children: [
      { name: 'Hypatia', fact: 'Taught mathematics and astronomy in Alexandria around 400 CE.' },
      { name: 'Ibn al-Haytham', fact: 'Put optics on an experimental footing — an early scientific method.' },
      { name: 'Galileo', fact: 'Turned the telescope on Jupiter and found its moons.' },
      { name: 'Newton', fact: 'Unified falling apples and orbiting planets under one law of gravitation.' },
      { name: 'Euler', fact: 'Gave mathematics much of its modern notation, including e, i and f(x).' },
      { name: 'Darwin', fact: 'Explained the diversity of life through natural selection.' },
      { name: 'Maxwell', fact: 'Wrote four equations that made light an electromagnetic wave.' },
      { name: 'Curie', fact: 'Discovered polonium and radium; coined the word radioactivity.' },
      { name: 'Einstein', fact: 'Showed that time and space bend — and that E = mc².' },
      { name: 'Noether', fact: 'Proved every symmetry of nature hides a conservation law.' },
      { name: 'Turing', fact: 'Defined what a computer can compute — before computers existed.' },
      { name: 'Franklin', fact: 'Photographed the X-ray diffraction pattern that revealed the DNA helix.' },
    ].map(({ name, fact }) => (
      <Tabs.Item key={name} id={name.toLowerCase().replace(/\s+/g, '-')} title={name}>
        <p className="mb-2 font-semibold">{name}</p>
        <p>{fact}</p>
      </Tabs.Item>
    )),
  },
  render: (args) => (
    <div className="w-[720px] max-w-full">
      <Tabs {...args} />
    </div>
  ),
};

/**
 * Switching one record between representations — here Kepler's third law
 * as prose, JSON, and XML.
 */
export const Representations: Story = {
  args: {
    children: (
      <>
        <Tabs.Item id="view" title="View">
          <p className="mb-1 font-semibold">Kepler&apos;s third law (1619)</p>
          <p>
            The square of a planet&apos;s orbital period is proportional to the
            cube of its semi-major axis: <em>T² ∝ a³</em>. Published in{' '}
            <em>Harmonices Mundi</em>.
          </p>
        </Tabs.Item>
        <Tabs.Item id="json" title="JSON">
          <pre className="font-mono text-sm leading-relaxed">
{`{
  "law": "Kepler's third law",
  "statement": "T² ∝ a³",
  "published": 1619,
  "source": "Harmonices Mundi"
}`}
          </pre>
        </Tabs.Item>
        <Tabs.Item id="xml" title="XML">
          <pre className="font-mono text-sm leading-relaxed">
{`<law name="Kepler's third law" published="1619">
  <statement>T² ∝ a³</statement>
  <source>Harmonices Mundi</source>
</law>`}
          </pre>
        </Tabs.Item>
      </>
    ),
  },
  render: (args) => (
    <div className="w-[720px] max-w-full">
      <Tabs {...args} />
    </div>
  ),
};

/**
 * A single tab can be disabled — skipped by pointer and keyboard alike.
 * Newton's alchemical notebooks stayed private until auctioned in 1936.
 */
export const DisabledTab: Story = {
  args: {
    children: (
      <>
        <Tabs.Item id="principia" title="Principia (1687)">
          <p>Laws of motion and universal gravitation, in Latin and geometry.</p>
        </Tabs.Item>
        <Tabs.Item id="opticks" title="Opticks (1704)">
          <p>Light split by prisms — colour as a property of light itself.</p>
        </Tabs.Item>
        <Tabs.Item id="alchemy" title="Alchemical notebooks" isDisabled>
          <p>Kept private during his lifetime; sold at auction in 1936.</p>
        </Tabs.Item>
      </>
    ),
  },
  render: (args) => (
    <div className="w-[720px] max-w-full">
      <Tabs {...args} />
    </div>
  ),
};
