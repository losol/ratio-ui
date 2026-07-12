// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Meta, StoryFn } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import type { Key } from 'react-aria-components';
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
