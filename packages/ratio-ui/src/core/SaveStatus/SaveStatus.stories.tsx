// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SaveStatus, type SaveState } from './SaveStatus';
import { TextField } from '../../forms/Input/TextField';

const meta = {
  title: 'Core/SaveStatus',
  component: SaveStatus,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof SaveStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The four states, side by side. */
export const States: Story = {
  args: { status: 'idle' },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <SaveStatus status="idle" />
      <SaveStatus status="saving" />
      <SaveStatus status="saved" savedAt="12:04" />
      <SaveStatus status="error" />
    </div>
  ),
};

/**
 * The surface it belongs to: a form with no Save button, and a line saying
 * why. The pill is what makes that missing button acceptable — so it has to
 * move the moment you type, and land on a time you can check against.
 *
 * The state machine is the app's. Here a timer stands in for the request;
 * a real one flips to `saving` when it leaves and `saved` when it resolves.
 */
export const AutosavingForm: Story = {
  args: { status: 'idle' },
  render: function AutosavingFormStory() {
    const [title, setTitle] = useState('On the Sizes and Distances');
    const [state, setState] = useState<SaveState>('idle');
    const [savedAt, setSavedAt] = useState<string>();
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const edit = (value: string) => {
      setTitle(value);
      setState('saving');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const now = new Date();
        setSavedAt(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        );
        setState('saved');
      }, 700);
    };

    return (
      <div className="flex max-w-[32rem] flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-border-1 bg-card px-4 py-3">
          <span className="text-sm text-(--text-muted)">Changes are saved automatically</span>
          <span className="ml-auto">
            <SaveStatus status={state} savedAt={savedAt} />
          </span>
        </div>
        <TextField name="title" label="Title" value={title} onChange={e => edit(e.target.value)} />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    const pill = canvas.getByRole('status');
    expect(pill).toHaveTextContent('No changes');

    await userEvent.type(canvas.getByLabelText('Title'), '!');
    expect(pill).toHaveTextContent('Saving…');

    // Lands on a time, so the reader can check it against the clock.
    await waitFor(() => expect(pill.textContent).toMatch(/^Saved \d{2}:\d{2}$/), {
      timeout: 3000,
    });
  },
};

/**
 * `labels` replaces the English defaults — the component ships copy, and copy
 * is the part an app in another language has to own.
 */
export const OtherLanguage: Story = {
  args: {
    status: 'saved',
    savedAt: '12:04',
    labels: { idle: 'Ingen endringer', saving: 'Lagrer …', saved: 'Lagret', error: 'Ikke lagret' },
  },
};

/** Two sizes: `sm` for a toolbar, `md` (default) for a bar of its own. */
export const Sizes: Story = {
  args: { status: 'saved' },
  render: () => (
    <div className="flex items-center gap-3">
      <SaveStatus size="sm" status="saved" savedAt="12:04" />
      <SaveStatus size="md" status="saved" savedAt="12:04" />
    </div>
  ),
};
