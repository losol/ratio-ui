// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Meta, StoryFn } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import type { Key } from 'react-aria-components';
import { expect, userEvent, within } from 'storybook/test';
import { Badge } from '../Badge/Badge';
import { ToggleButtonGroup, ToggleButtonGroupProps } from './ToggleButtonGroup';

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
  tags: ['autodocs'],
};

export default meta;

type ToggleButtonGroupStory = StoryFn<ToggleButtonGroupProps>;

const caption: CSSProperties = {
  marginTop: 12,
  fontSize: 13,
  color: 'var(--text-muted)',
};

/**
 * The default: `segmented` look, single selection. Here it switches between the
 * three classical branches of natural science.
 */
export const Playground: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(() => new Set(['physics']));

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Branch of science"
        options={[
          { value: 'physics', label: 'Physics' },
          { value: 'chemistry', label: 'Chemistry' },
          { value: 'biology', label: 'Biology' },
        ]}
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p style={caption}>Studying: {[...selected][0] ?? 'nothing selected'}</p>
    </div>
  );
};

/**
 * `count` badges after each label — handy for filter bars showing how many
 * items sit behind each option.
 */
export const WithCounts: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(() => new Set(['manuscripts']));

  return (
    <ToggleButtonGroup
      aria-label="Filter the archive"
      options={[
        { value: 'manuscripts', label: 'Manuscripts', count: 42 },
        { value: 'letters', label: 'Letters', count: 28 },
        { value: 'instruments', label: 'Instruments', count: 14 },
      ]}
      selectedKeys={selected}
      onSelectionChange={setSelected}
    />
  );
};

/**
 * `selectionMode="multiple"` turns the control into a compact filter — any
 * number of segments can be active at once. Here: filtering a reading list by
 * branch of philosophy.
 */
export const MultipleSelection: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(
    () => new Set(['logic', 'ethics']),
  );

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Filter by branch of philosophy"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        options={[
          { value: 'logic', label: 'Logic' },
          { value: 'ethics', label: 'Ethics' },
          { value: 'metaphysics', label: 'Metaphysics' },
          { value: 'epistemology', label: 'Epistemology' },
        ]}
      />
      <p style={caption}>
        {selected.size ? `Showing: ${[...selected].join(', ')}` : 'Showing everything'}
      </p>
    </div>
  );
};

/**
 * With empty selection allowed (the default), clicking the active segment
 * toggles it off — a single-choice filter that can also mean "any".
 */
export const ClearToEmpty: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(() => new Set(['kepler']));

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Highlight an astronomer"
        options={[
          { value: 'copernicus', label: 'Copernicus' },
          { value: 'kepler', label: 'Kepler' },
          { value: 'galileo', label: 'Galileo' },
        ]}
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p style={caption}>
        {selected.size
          ? `Highlighting ${[...selected][0]}`
          : 'No one highlighted — click a name to focus it, click again to clear.'}
      </p>
    </div>
  );
};

/**
 * `disallowEmptySelection` gives radio-style behaviour: exactly one segment
 * stays active and the current one can't be toggled off.
 */
export const RadioStyle: ToggleButtonGroupStory = () => (
  <ToggleButtonGroup
    aria-label="Temperature scale"
    disallowEmptySelection
    defaultSelectedKeys={['celsius']}
    options={[
      { value: 'celsius', label: 'Celsius', title: 'Anders Celsius, 1742' },
      { value: 'fahrenheit', label: 'Fahrenheit', title: 'Daniel Fahrenheit, 1724' },
      { value: 'kelvin', label: 'Kelvin', title: 'William Thomson (Lord Kelvin), 1848' },
    ]}
  />
);

const fieldLabel: CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
};

/** The three sizes: `sm` · `md` (default) · `lg` — same scale as Button. */
export const Sizes: ToggleButtonGroupStory = () => {
  const eras = [
    { value: 'antiquity', label: 'Antiquity' },
    { value: 'enlightenment', label: 'Enlightenment' },
    { value: 'modern', label: 'Modern' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <div>
        <span style={fieldLabel}>Small</span>
        <ToggleButtonGroup aria-label="Era (small)" size="sm" defaultSelectedKeys={['enlightenment']} options={eras} />
      </div>
      <div>
        <span style={fieldLabel}>Medium (default)</span>
        <ToggleButtonGroup aria-label="Era (medium)" size="md" defaultSelectedKeys={['enlightenment']} options={eras} />
      </div>
      <div>
        <span style={fieldLabel}>Large</span>
        <ToggleButtonGroup aria-label="Era (large)" size="lg" defaultSelectedKeys={['enlightenment']} options={eras} />
      </div>
    </div>
  );
};

/** `fullWidth` stretches the track; segments then share the width equally. */
export const FullWidth: ToggleButtonGroupStory = () => (
  <div style={{ width: 360 }}>
    <ToggleButtonGroup
      aria-label="Method of inquiry"
      fullWidth
      defaultSelectedKeys={['empirical']}
      options={[
        { value: 'empirical', label: 'Empirical' },
        { value: 'rational', label: 'Rational' },
        { value: 'dialectic', label: 'Dialectic' },
      ]}
    />
  </div>
);

/**
 * A single segment can be disabled — e.g. a discipline no longer taught — while
 * the rest stay interactive.
 */
export const DisabledSegment: ToggleButtonGroupStory = () => (
  <ToggleButtonGroup
    aria-label="Field of study"
    defaultSelectedKeys={['mathematics']}
    options={[
      { value: 'mathematics', label: 'Mathematics' },
      { value: 'astronomy', label: 'Astronomy' },
      { value: 'alchemy', label: 'Alchemy', isDisabled: true, title: 'Retired from the curriculum' },
    ]}
  />
);

/**
 * `variant="chips"` drops the shared track: each option becomes its own
 * outlined pill and the row wraps. That is the filter-chip form — a set with
 * no fixed length, where any number may be on at once — as against the
 * segmented track, which suits a few mutually exclusive views seen together.
 *
 * The selection API is the same either way; only the chrome changes. Both
 * forms render `ToggleButton`'s pill variants, so a lone toggle matches a row
 * of them.
 */
export const Chips: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(() => new Set(['astronomy', 'mathematics']));
  const fields = [
    { value: 'astronomy', label: 'Astronomy', count: 41 },
    { value: 'mathematics', label: 'Mathematics', count: 63 },
    { value: 'medicine', label: 'Medicine', count: 18 },
    { value: 'geography', label: 'Geography', count: 12 },
    { value: 'poetry', label: 'Poetry', count: 87 },
    { value: 'rhetoric', label: 'Rhetoric', count: 24 },
    { value: 'law', label: 'Law', count: 9 },
  ];
  return (
    <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ToggleButtonGroup
        variant="chips"
        aria-label="Filter by field of study"
        selectionMode="multiple"
        options={fields}
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
        {selected.size === 0
          ? 'No field selected — the shelves stay closed.'
          : `${selected.size} of ${fields.length} fields`}
      </p>
    </div>
  );
};

/**
 * `tints` (beta) is a wrapping row of soft toggles for content — reactions
 * under a comment. Any number can be on, and the whole row is one tab stop:
 * the arrow keys move between reactions.
 */
export const Tints: ToggleButtonGroupStory = () => {
  const [counts, setCounts] = useState<Record<string, number>>({ '👍': 4, '🎉': 1, '👀': 2 });
  const [mine, setMine] = useState<Set<Key>>(() => new Set(['👍']));

  return (
    <ToggleButtonGroup
      aria-label="Reactions"
      variant="tints"
      size="sm"
      selectionMode="multiple"
      selectedKeys={mine}
      onSelectionChange={next => {
        setCounts(prev =>
          Object.fromEntries(
            Object.entries(prev).map(([emoji, n]) => [
              emoji,
              n + Number(next.has(emoji)) - Number(mine.has(emoji)),
            ]),
          ),
        );
        setMine(next);
      }}
      options={Object.entries(counts).map(([emoji, n]) => ({ value: emoji, label: `${emoji} ${n}` }))}
    />
  );
};

const wave = (d: string) => (
  <svg width="36" height="20" viewBox="0 0 28 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/**
 * `tiles` (beta): equal-width blocks, each stacking its `icon` over its
 * label — for a choice among a few things best shown rather than named.
 * Single selection with `disallowEmptySelection` keeps one chosen, so the
 * group announces as a radio group.
 */
export const Tiles: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(() => new Set(['triangle']));

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Waveform"
        variant="tiles"
        disallowEmptySelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
        options={[
          { value: 'sine', label: 'Sine', icon: wave('M1 8 C 4 1, 8 1, 10 8 S 16 15, 19 8 S 24 1, 27 8') },
          { value: 'triangle', label: 'Triangle', icon: wave('M1 8 L5 2 L13 14 L21 2 L27 11') },
          { value: 'square', label: 'Square', icon: wave('M1 13 L1 3 L8 3 L8 13 L15 13 L15 3 L22 3 L22 13 L27 13') },
          { value: 'sawtooth', label: 'Sawtooth', icon: wave('M1 13 L10 3 L10 13 L19 3 L19 13 L27 4') },
        ]}
      />
      <p style={caption}>Waveform: {[...selected][0]}</p>
    </div>
  );
};
Tiles.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const group = canvas.getByRole('radiogroup', { name: 'Waveform' });
  const square = within(group).getByRole('radio', { name: 'Square' });
  expect(square).not.toBeChecked();
  await userEvent.click(square);
  expect(square).toBeChecked();
  expect(within(group).getByRole('radio', { name: 'Triangle' })).not.toBeChecked();
};

/**
 * Numbered steps: a `Badge` as each option's `icon` numbers the levels, and
 * the segmented track shows them as one scale. The page below it explains
 * the chosen level.
 */
export const NumberedSteps: ToggleButtonGroupStory = () => {
  const [selected, setSelected] = useState<Set<Key>>(() => new Set(['2']));
  const levels = [
    { value: '1', label: 'Simple', text: 'One oscillator, wired for you.' },
    { value: '2', label: 'More modules', text: 'Every module, with the cables fixed.' },
    { value: '3', label: 'Patch it yourself', text: 'Drag from an output to an input.' },
  ];
  const current = levels.find((l) => selected.has(l.value));

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Level"
        disallowEmptySelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
        options={levels.map((l) => ({
          value: l.value,
          label: l.label,
          icon: (
            <Badge variant="count" tone="inherit">
              {l.value}
            </Badge>
          ),
        }))}
      />
      <p style={caption}>{current?.text}</p>
    </div>
  );
};

/**
 * Icon-only segments, for a control that must stay narrow. The `label` is
 * the icon, so `title` becomes the accessible name — set it on every option.
 */
export const IconOnly: ToggleButtonGroupStory = () => (
  <ToggleButtonGroup
    aria-label="Waveform"
    size="sm"
    disallowEmptySelection
    defaultSelectedKeys={['sawtooth']}
    options={[
      { value: 'sine', title: 'Sine', label: wave('M1 8 C 4 1, 8 1, 10 8 S 16 15, 19 8 S 24 1, 27 8') },
      { value: 'triangle', title: 'Triangle', label: wave('M1 8 L5 2 L13 14 L21 2 L27 11') },
      { value: 'square', title: 'Square', label: wave('M1 13 L1 3 L8 3 L8 13 L15 13 L15 3 L22 3 L22 13 L27 13') },
      { value: 'sawtooth', title: 'Sawtooth', label: wave('M1 13 L10 3 L10 13 L19 3 L19 13 L27 4') },
    ]}
  />
);
IconOnly.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const group = canvas.getByRole('radiogroup', { name: 'Waveform' });
  const sine = within(group).getByRole('radio', { name: 'Sine' });
  expect(within(group).getByRole('radio', { name: 'Sawtooth' })).toBeChecked();
  await userEvent.click(sine);
  expect(sine).toBeChecked();
};
