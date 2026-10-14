// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Key } from 'react-aria-components';
import { expect, within } from 'storybook/test';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { Heading } from '../core/Heading';
import { BrandMark } from '../core/BrandMark';
import { ToggleButtonGroup } from '../core/ToggleButtonGroup';
import { TextField } from '../forms/Input/TextField';
import { RadioGroup } from '../forms/RadioGroup/RadioGroup';

/**
 * The `tabula` theme: the printed sheet. White sheets in thick petrol
 * frames on a sand page, no rounded corner anywhere, one condensed grotesk
 * for the big words and the small print. Flat: the frames carry the
 * hierarchy, and the only shadow is the soft one under a button.
 *
 * These stories open in Tabula; the theme button cycles the others, so the
 * same markup can be seen in the standard theme, Bureau and Ink. Nothing
 * here is Tabula-specific: `Card featured` is the sheet, `Card.Meta` and
 * `Card.Footer` the four corners, `Heading.Eyebrow` the small print.
 *
 * Load it with `themes/tabula.css` and, for the fonts, `themes/tabula-fonts.css`;
 * see `docs/tabula-theme-spec.md`.
 */
const meta: Meta = {
  title: 'Themes/Tabula',
  parameters: { theme: 'tabula' },
};

export default meta;
type Story = StoryObj;

const Tablet = () => (
  <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden className="text-(--primary)">
    <rect x="3" y="3" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M10 12h16M10 18h16M10 24h10" stroke="currentColor" strokeWidth="3" />
  </svg>
);

const Lockup = () => (
  <BrandMark>
    <BrandMark.Logo>
      <Tablet />
    </BrandMark.Logo>
    <BrandMark.Name>Nordlys</BrandMark.Name>
    <BrandMark.Subtitle>Evening school</BrandMark.Subtitle>
  </BrandMark>
);

/**
 * A form: what it is and who it is from in the top corners, a field on
 * paper in a petrol frame, one square button, and at the foot whose it is
 * and who signed.
 */
export const Sheet: Story = {
  render: () => (
    <Card featured padding="lg" gap="md" className="max-w-xl">
      <Card.Meta>
        <span>Enrolment form</span>
        <span>Spring term</span>
      </Card.Meta>
      <Card.Body className="flex flex-col gap-4">
        <TextField
          name="name"
          label="Your name"
          description="As you want it on the course list. 2–40 characters."
          placeholder="e.g. Kari Nordmann"
        />
        <Button block size="lg">Enrol</Button>
      </Card.Body>
      <Card.Footer>
        <Lockup />
        <strong className="text-right text-(--primary)">The course office</strong>
      </Card.Footer>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Your name' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Enrol' })).toBeInTheDocument();
  },
};

/**
 * A worksheet: an eyebrow and a heading in the condensed face, the running
 * text in the wider one, and a grid of choices — `ToggleButtonGroup`'s
 * tiles, squared off and framed by the theme.
 */
export const Worksheet: Story = {
  render: () => {
    const [table, setTable] = useState<Set<Key>>(() => new Set(['3']));
    return (
      <Card featured padding="lg" gap="md" className="max-w-xl">
        <Card.Meta>
          <span>Worksheet</span>
          <span>Times tables</span>
        </Card.Meta>
        <Card.Body className="flex flex-col gap-4">
          <Heading.Group>
            <Heading.Eyebrow>Ten at a time</Heading.Eyebrow>
            <Heading as="h2" size="lg" className="uppercase">
              First the ones you missed.
            </Heading>
          </Heading.Group>
          <p className="m-0 text-(--text-muted)">
            Ten problems: first the ones you got wrong today, then the ones with the fewest
            marks. A problem that rusts counts one mark less.
          </p>
          <Heading.Eyebrow className="mb-0">Or practise one table</Heading.Eyebrow>
          <ToggleButtonGroup
            aria-label="Table"
            variant="tiles"
            disallowEmptySelection
            selectedKeys={table}
            onSelectionChange={setTable}
            options={['2', '3', '4', '5', '6', '7', '8', '9'].map((n) => ({
              value: n,
              label: `${n}×`,
            }))}
          />
        </Card.Body>
        <Card.Footer>
          <Lockup />
          <strong className="text-right text-(--primary)">Maths, week 7</strong>
        </Card.Footer>
      </Card>
    );
  },
};

/**
 * The controls on their own: buttons square, with the soft shadow that goes
 * when pressed; a radio group; a field. The `light` variant fills with the
 * theme's tint.
 */
export const Controls: Story = {
  render: () => {
    const [level, setLevel] = useState('normal');
    return (
      <div className="flex max-w-xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Start a round</Button>
          <Button size="lg" variant="light">
            Sound
          </Button>
          <Button size="lg" variant="outline">
            The threes
          </Button>
          <Button size="lg" variant="secondary">
            Later
          </Button>
        </div>
        <RadioGroup
          name="level"
          label="Level"
          value={level}
          onChange={setLevel}
          options={[
            { value: 'easy', label: 'Easy', description: 'Up to 5 × 5' },
            { value: 'normal', label: 'Normal', description: 'Up to 10 × 10' },
            { value: 'hard', label: 'Hard', description: 'Up to 12 × 12, and you type the answer' },
          ]}
        />
        <TextField name="name" label="Your name" placeholder="e.g. Kari Nordmann" />
      </div>
    );
  },
};
