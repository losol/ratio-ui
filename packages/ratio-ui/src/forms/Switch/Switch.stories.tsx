// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default: track first, label after. A switch takes effect the moment it
 * moves — no Save button follows it. Label it with the state that is on
 * ("Show copies"), not with an instruction.
 */
export const Default: Story = {
  args: { children: 'Show copies', defaultSelected: false },
};

/**
 * The toolbar switch above a long list — the one control that decides how
 * much of each row you see. It reads as a setting, not as a button in a row
 * of buttons; that distinction is why this isn't a `ToggleButton`.
 */
export const ListDensity: Story = {
  args: { children: 'Show copies' },
  render: function ListDensityStory() {
    const [showCopies, setShowCopies] = useState(false);
    const works = [
      { title: 'Almagest — Ptolemy', copies: ['Museum, north hall', 'Serapeum annex'] },
      { title: 'Elements — Euclid', copies: ['Museum, north hall', 'Pergamon exchange'] },
      { title: 'Geographia — Eratosthenes', copies: ['Museum, west hall'] },
    ];
    return (
      <div className="flex max-w-[36rem] flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg font-semibold">Manuscripts</span>
          <Switch isSelected={showCopies} onChange={setShowCopies}>
            Show copies
          </Switch>
        </div>
        <ul className="flex flex-col gap-3 border-t border-border-1 pt-3">
          {works.map(work => (
            <li key={work.title} className="flex flex-col gap-1">
              <span className="text-(--text)">{work.title}</span>
              {showCopies &&
                work.copies.map(copy => (
                  <span key={copy} className="pl-4 text-sm text-(--text-muted)">
                    {copy}
                  </span>
                ))}
            </li>
          ))}
        </ul>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Show copies' });

    expect(control).not.toBeChecked();
    expect(canvas.queryByText('Pergamon exchange')).toBeNull();

    // Keyboard operates it: the control takes focus (a plain <span> track
    // could not) and Space toggles. Focused directly rather than by tabbing —
    // the Storybook theme button sits ahead of it in the story's tab order.
    control.focus();
    expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(control).toBeChecked();
    expect(canvas.getByText('Pergamon exchange')).toBeVisible();
  },
};

/**
 * `labelPosition="start"` with `justify-between` is the settings-row form:
 * the label carries the meaning, the description carries the consequence, and
 * the track sits at the edge where the eye can scan a column of them.
 */
export const SettingsRows: Story = {
  args: { children: null },
  render: () => (
    <div className="flex max-w-[32rem] flex-col divide-y divide-border-1">
      {[
        {
          label: 'Weekly summary',
          description: 'A digest of what was catalogued, every Monday',
          on: true,
        },
        {
          label: 'Loan reminders',
          description: 'Notify a reader three days before a scroll is due',
          on: true,
        },
        { label: 'Acquisition alerts', description: 'When a ship docks with unlisted works' },
      ].map(row => (
        <Switch
          key={row.label}
          labelPosition="start"
          className="w-full justify-between py-3"
          defaultSelected={row.on}
          description={row.description}
        >
          {row.label}
        </Switch>
      ))}
    </div>
  ),
};

/** The three sizes, on the same scale as `Button`. */
export const Sizes: Story = {
  args: { children: null },
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch size="sm" defaultSelected>
        Small
      </Switch>
      <Switch size="md" defaultSelected>
        Medium (default)
      </Switch>
      <Switch size="lg" defaultSelected>
        Large
      </Switch>
    </div>
  ),
};

/**
 * `isDisabled` and `isReadOnly` are React Aria's, and they differ: a disabled
 * switch is out of play, a read-only one shows a real value you may not
 * change here.
 */
export const DisabledAndReadOnly: Story = {
  args: { children: null },
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch isDisabled>Disabled, off</Switch>
      <Switch isDisabled defaultSelected>
        Disabled, on
      </Switch>
      <Switch isReadOnly defaultSelected description="Set by the archive's policy">
        Read-only
      </Switch>
    </div>
  ),
};
