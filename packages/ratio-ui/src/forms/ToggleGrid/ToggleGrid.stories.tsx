// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../../core/Button';
import { Card } from '../../core/Card';
import { Pause, Play } from '../../icons';
import { ToggleGrid, toggleGridKey } from './ToggleGrid';

const meta = {
  title: 'Forms/ToggleGrid',
  component: ToggleGrid,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof ToggleGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const HUES = [25, 62, 95, 145, 195, 250, 305];
const noteColor = (i: number) => `oklch(0.82 0.1 ${HUES[i % HUES.length]})`;

const NOTES = ["C'", 'H', 'A', 'G', 'F', 'E', 'D', 'C'];
const noteRows = NOTES.map((n, i) => ({
  id: n,
  label: n,
  name: n === "C'" ? 'High C' : n,
  color: noteColor((NOTES.length - 1 - i) % 7),
}));

const steps = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i),
    name: `beat ${i + 1}`,
    label: i % 4 === 0 ? String(i / 4 + 1) : '·',
    emphasized: i % 4 === 0,
  }));

/** From a string of notes, one per step, `-` for a rest. */
const melody = (notes: string) =>
  new Set(
    notes
      .split(' ')
      .map((n, i) => (n === '-' ? null : toggleGridKey(n, String(i))))
      .filter((k): k is string => k !== null),
  );

/**
 * Uncontrolled: eight notes down the side, sixteen steps across, a
 * tune to start with. Every fourth column is emphasized to mark the beat,
 * and the footer counts the beats.
 */
export const Default: Story = {
  args: {
    'aria-label': 'Melody',
    rows: noteRows,
    columns: steps(16),
    defaultSelectedKeys: melody('G E E - F D D - C D E F G G G -'),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const cell = canvas.getByRole('button', { name: 'C, beat 1' });
    expect(cell).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(cell);
    expect(cell).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByRole('button', { name: 'G, beat 1' })).toHaveAttribute('aria-pressed', 'true');
  },
};

/**
 * Controlled, with a playhead: `activeColumn` frames the step that is
 * playing, and `onRowPress` makes each row header a button for hearing the
 * note on its own. The parent owns the clock; the grid only shows it.
 */
export const StepSequencer: Story = {
  args: { 'aria-label': 'Melody', rows: noteRows, columns: steps(16) },
  render: function StepSequencerStory(args) {
    const [cells, setCells] = useState(() => melody('C D E C C D E C E F G - E F G -'));
    const [playing, setPlaying] = useState(false);
    const [step, setStep] = useState(-1);
    const [lastNote, setLastNote] = useState<string | null>(null);

    useEffect(() => {
      if (!playing) return;
      const timer = setInterval(() => setStep((s) => (s + 1) % 16), 60000 / 110 / 2);
      return () => clearInterval(timer);
    }, [playing]);

    return (
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            icon={playing ? <Pause size={18} /> : <Play size={18} />}
            aria-pressed={playing}
            onPress={() => {
              setPlaying((p) => !p);
              setStep(-1);
            }}
          >
            {playing ? 'Stop' : 'Play'}
          </Button>
          <Button variant="outline" onPress={() => setCells(new Set())}>
            Clear
          </Button>
          <span className="text-sm text-(--text-muted)">
            {lastNote ? `Last note: ${lastNote}` : 'Press a note name to hear it'}
          </span>
        </div>
        <ToggleGrid
          {...args}
          selectedKeys={cells}
          onSelectionChange={setCells}
          activeColumn={playing ? String(step) : null}
          onRowPress={setLastNote}
        />
      </Card>
    );
  },
};

/**
 * Not only music: who is free when. Rows without `color` fill with the
 * primary colour, and columns without `label` drop the footer.
 */
export const Availability: Story = {
  args: {
    'aria-label': 'Availability',
    size: 'sm',
    rows: [
      { id: 'ada', label: 'Ada' },
      { id: 'grace', label: 'Grace' },
      { id: 'linus', label: 'Linus' },
    ],
    columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => ({ id: d.toLowerCase(), label: d })),
    defaultSelectedKeys: ['ada:mon', 'ada:tue', 'grace:tue', 'grace:wed', 'linus:fri'],
    activeColumn: 'wed',
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Melody',
    rows: noteRows.slice(4),
    columns: steps(8),
    defaultSelectedKeys: melody('C D E C C D E C'),
    isDisabled: true,
  },
};

/**
 * Held notes: `cellData` carries a `span` per on cell, a length in columns,
 * and the cell draws as one bar. Press a note to pick it up, then a later
 * step in the same row to set how long it lasts; press it again to shorten
 * a long one to one step, or to remove a short one. Shift+arrow adjusts by
 * one from the keyboard. The map is plain JSON — store it with the melody.
 * Other fields on a cell, like the `velocity` here, are the app's and ride
 * along untouched.
 */
export const HeldNotes: Story = {
  args: { 'aria-label': 'Melody', rows: noteRows, columns: steps(16) },
  render: function HeldNotesStory(args) {
    const [cells, setCells] = useState(() => melody('G E E - F D D - C D E F G - - -'));
    const [notes, setNotes] = useState<Record<string, { span?: number; velocity?: number }>>({
      'E:2': { span: 2 },
      'D:6': { span: 2 },
      'G:12': { span: 4, velocity: 0.6 },
    });
    return (
      <div className="flex flex-col gap-3">
        <ToggleGrid {...args} selectedKeys={cells} onSelectionChange={setCells} cellData={notes} onCellDataChange={setNotes} />
        <pre className="m-0 text-xs text-(--text-muted)" data-testid="spans">{JSON.stringify(notes)}</pre>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // A long note is one button, named by its first and last step.
    const heldG = canvas.getByRole('button', { name: 'G, beat 13 to beat 16' });
    expect(heldG).toHaveAttribute('aria-pressed', 'true');

    // Pick up the C on beat 9, then press beat 12 in the same row: four steps.
    await userEvent.click(canvas.getByRole('button', { name: 'C, beat 9' }));
    await userEvent.click(canvas.getByRole('button', { name: 'C, beat 12' }));
    expect(canvas.getByRole('button', { name: 'C, beat 9 to beat 12' })).toBeInTheDocument();
    expect(canvas.getByTestId('spans')).toHaveTextContent('"C:8":{"span":4}');

    // The same long note again, twice: back to one step, then gone.
    const longC = canvas.getByRole('button', { name: 'C, beat 9 to beat 12' });
    await userEvent.click(longC);
    await userEvent.click(longC);
    const shortC = canvas.getByRole('button', { name: 'C, beat 9' });
    expect(shortC).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(shortC);
    await userEvent.click(shortC);
    expect(canvas.getByRole('button', { name: 'C, beat 9' })).toHaveAttribute('aria-pressed', 'false');

    // Shift+ArrowRight lengthens from the keyboard.
    const g1 = canvas.getByRole('button', { name: 'G, beat 1' });
    g1.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(canvas.getByRole('button', { name: 'G, beat 1 to beat 2' })).toBeInTheDocument();

    // Shortening the long G keeps the app's own field on it.
    const longG = canvas.getByRole('button', { name: 'G, beat 13 to beat 16' });
    longG.focus();
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(canvas.getByTestId('spans')).toHaveTextContent('"G:12":{"velocity":0.6,"span":3}');
  },
};

/**
 * `readOnly`: the grid as plain markup, with nothing to press and no
 * JavaScript needed. A server component can render a saved melody with it,
 * `cellData` and all, straight from the stored JSON.
 */
export const ReadOnly: Story = {
  args: {
    'aria-label': 'Saved melody',
    rows: noteRows,
    columns: steps(16),
    readOnly: true,
    selectedKeys: [...melody('G E E - F D D - C D E F G - - -')],
    cellData: { 'E:2': { span: 2 }, 'D:6': { span: 2 }, 'G:12': { span: 4 } },
    activeColumn: '5',
  },
};
