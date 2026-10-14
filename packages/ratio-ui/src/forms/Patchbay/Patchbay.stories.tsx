// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../../core/Button';
import { Card } from '../../core/Card';
import { Heading } from '../../core/Heading';
import { ToggleButtonGroup } from '../../core/ToggleButtonGroup';
import { Knob } from '../Knob';
import { Patchbay } from './index';
import type { PatchbayConnection } from './Patchbay';

const meta: Meta<typeof Patchbay> = {
  title: 'Forms/Patchbay',
  component: Patchbay,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- A modular synth: the rack the component was made for. -----------------

const AUDIO = 'var(--color-primary-300)';
const CONTROL = 'var(--color-accent-400)';

type Module = {
  id: string;
  name: string;
  knobs: { label: string; value: number; fmt: (v: number) => string }[];
  ins: { id: string; label: string; kind: 'audio' | 'control' }[];
  outs: { id: string; label: string; kind: 'audio' | 'control' }[];
};

const MODULES: Module[] = [
  { id: 'osc1', name: 'Oscillator 1', knobs: [{ label: 'Fine', value: 50, fmt: (v) => `${Math.round(v - 50)} c` }], ins: [{ id: 'mod', label: 'Mod', kind: 'control' }], outs: [{ id: 'out', label: 'Out', kind: 'audio' }] },
  { id: 'osc2', name: 'Oscillator 2', knobs: [{ label: 'Fine', value: 57, fmt: (v) => `${Math.round(v - 50)} c` }], ins: [{ id: 'mod', label: 'Mod', kind: 'control' }], outs: [{ id: 'out', label: 'Out', kind: 'audio' }] },
  { id: 'lfo', name: 'LFO', knobs: [{ label: 'Rate', value: 30, fmt: (v) => `${(v / 10).toFixed(1)} Hz` }], ins: [], outs: [{ id: 'out', label: 'Out', kind: 'control' }] },
  { id: 'mix', name: 'Mixer', knobs: [{ label: 'In 1', value: 80, fmt: (v) => `${Math.round(v)} %` }, { label: 'In 2', value: 60, fmt: (v) => `${Math.round(v)} %` }], ins: [{ id: 'in1', label: '1', kind: 'audio' }, { id: 'in2', label: '2', kind: 'audio' }, { id: 'in3', label: '3', kind: 'audio' }], outs: [{ id: 'out', label: 'Out', kind: 'audio' }] },
  { id: 'filter', name: 'Filter', knobs: [{ label: 'Cutoff', value: 45, fmt: (v) => `${(v * 0.2).toFixed(1)} kHz` }], ins: [{ id: 'in', label: 'In', kind: 'audio' }, { id: 'mod', label: 'Mod', kind: 'control' }], outs: [{ id: 'out', label: 'Out', kind: 'audio' }] },
  { id: 'out', name: 'Output', knobs: [{ label: 'Volume', value: 70, fmt: (v) => `${Math.round(v)} %` }], ins: [{ id: 'in', label: 'In', kind: 'audio' }], outs: [] },
];

const PATCHES: Record<'standard' | 'split' | 'empty', PatchbayConnection[]> = {
  standard: [
    { from: 'osc1.out', to: 'mix.in1' },
    { from: 'osc2.out', to: 'mix.in2' },
    { from: 'mix.out', to: 'filter.in' },
    { from: 'lfo.out', to: 'filter.mod' },
    { from: 'filter.out', to: 'out.in' },
  ],
  // One output feeding two inputs, and the LFO reaching both oscillators.
  split: [
    { from: 'osc1.out', to: 'mix.in1' },
    { from: 'osc1.out', to: 'filter.in' },
    { from: 'lfo.out', to: 'osc1.mod' },
    { from: 'lfo.out', to: 'osc2.mod' },
    { from: 'mix.out', to: 'out.in' },
  ],
  empty: [],
};

function Rack({ connections, onChange }: { connections: PatchbayConnection[]; onChange: (c: PatchbayConnection[]) => void }) {
  return (
    <Patchbay
      aria-label="Rack"
      connections={connections}
      onConnectionsChange={onChange}
      // Audio into audio, control into control.
      canConnect={(from, to) => from.kind === to.kind}
      className="surface-dark rounded-2xl bg-primary-950 p-4 text-(--text)"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Card key={m.id} className="bg-primary-900">
            <Card.Header>
              <Heading as="h3" size="sm">{m.name}</Heading>
            </Card.Header>
            <Card.Body>
              <div className="flex flex-wrap justify-around gap-2">
                {m.knobs.map((k) => (
                  <Knob key={k.label} size="sm" label={k.label} defaultValue={k.value} formatValue={k.fmt} />
                ))}
              </div>
            </Card.Body>
            <Card.Footer>
              <span className="flex gap-1">
                {m.ins.map((p) => (
                  <Patchbay.Port key={p.id} id={`${m.id}.${p.id}`} direction="in" kind={p.kind} label={p.label} name={`${m.name} ${p.label} in`} color={p.kind === 'control' ? CONTROL : AUDIO} />
                ))}
              </span>
              <span className="flex gap-1">
                {m.outs.map((p) => (
                  <Patchbay.Port key={p.id} id={`${m.id}.${p.id}`} direction="out" kind={p.kind} label={p.label} name={`${m.name} ${p.label}`} color={p.kind === 'control' ? CONTROL : AUDIO} />
                ))}
              </span>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </Patchbay>
  );
}

/**
 * The rack: six modules in cards, sockets in each footer, cables between
 * them. Drag from a socket to another, or press one and then the other.
 * Blue cables carry audio, yellow ones control, and `canConnect` keeps them
 * apart. The "Split" patch runs one output into two inputs and one LFO into
 * both oscillators.
 */
export const SynthRack: Story = {
  render: function SynthRackStory() {
    const [patch, setPatch] = useState<keyof typeof PATCHES | ''>('standard');
    const [connections, setConnections] = useState(PATCHES.standard);
    return (
      <div className="flex flex-col gap-3">
        <ToggleButtonGroup
          aria-label="Patch"
          variant="chips"
          selectedKeys={patch ? [patch] : []}
          onSelectionChange={(keys) => {
            const next = String([...keys][0] ?? '');
            if (next === 'standard' || next === 'split' || next === 'empty') {
              setPatch(next);
              setConnections(PATCHES[next]);
            }
          }}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'split', label: 'Split' },
            { value: 'empty', label: 'Empty' },
          ]}
        />
        <Rack
          connections={connections}
          onChange={(next) => {
            setConnections(next);
            setPatch('');
          }}
        />
      </div>
    );
  },
};

// --- A quiz: match each question to its answer. ----------------------------

// Each row shows one question and one answer; the answers are shuffled, so
// the right one is usually on another row.
const ROWS = [
  { question: { id: 'q1', text: 'Who put the Sun at the centre?', answer: 'a2' }, answer: { id: 'a1', text: 'Hipparchus' } },
  { question: { id: 'q2', text: 'Who measured the Earth around?', answer: 'a4' }, answer: { id: 'a2', text: 'Copernicus' } },
  { question: { id: 'q3', text: 'Who ranked the stars by brightness?', answer: 'a1' }, answer: { id: 'a3', text: 'Euclid' } },
  { question: { id: 'q4', text: 'Who wrote the Elements?', answer: 'a3' }, answer: { id: 'a4', text: 'Eratosthenes' } },
];
const QUESTIONS = ROWS.map((r) => r.question);

/**
 * Not only music: match questions to answers. Questions are outputs on the
 * left, answers inputs on the right, and `canConnect` allows one cable per
 * question and per answer. The count updates as cables land.
 */
export const QuizMatching: Story = {
  render: function QuizMatchingStory() {
    const [connections, setConnections] = useState<PatchbayConnection[]>([]);
    const correct = connections.filter((c) => QUESTIONS.find((q) => q.id === c.from)?.answer === c.to).length;
    return (
      <div className="flex max-w-[44rem] flex-col gap-3">
        <Patchbay
          aria-label="Match the question to its answer"
          connections={connections}
          onConnectionsChange={setConnections}
          canConnect={(from, to, all) => !all.some((c) => c.from === from.id || c.to === to.id)}
          className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-x-3 gap-y-2"
        >
          {ROWS.map(({ question, answer }, i) => (
            <div key={question.id} className="contents">
              <span className="text-(--text)">{question.text}</span>
              <Patchbay.Port id={question.id} direction="out" name={`Question ${i + 1}: ${question.text}`} />
              <Patchbay.Port id={answer.id} direction="in" name={`Answer: ${answer.text}`} />
              <span className="text-(--text)">{answer.text}</span>
            </div>
          ))}
        </Patchbay>
        <p className="m-0 text-sm text-(--text-muted)" data-testid="score">
          {connections.length} of {QUESTIONS.length} matched, {correct} correct.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const q1 = canvas.getByRole('button', { name: /^Question 1:/ });
    const copernicus = canvas.getByRole('button', { name: 'Answer: Copernicus' });
    const euclid = canvas.getByRole('button', { name: 'Answer: Euclid' });

    // Keyboard: pick up a question, connect it to an answer.
    q1.focus();
    await userEvent.keyboard('{Enter}');
    expect(q1).toHaveAttribute('aria-pressed', 'true');
    copernicus.focus();
    await userEvent.keyboard('{Enter}');
    expect(canvas.getByTestId('score')).toHaveTextContent('1 of 4 matched, 1 correct');
    expect(canvas.getByRole('button', { name: /^Cable from Question 1/ })).toBeInTheDocument();

    // One cable per question: a second answer for the same question is refused,
    // and the press starts a new cable from that answer instead.
    q1.focus();
    await userEvent.keyboard('{Enter}');
    euclid.focus();
    await userEvent.keyboard('{Enter}');
    expect(canvas.getByTestId('score')).toHaveTextContent('1 of 4 matched');
    await userEvent.keyboard('{Escape}');

    // The same pair again removes the cable.
    q1.focus();
    await userEvent.keyboard('{Enter}');
    copernicus.focus();
    await userEvent.keyboard('{Enter}');
    expect(canvas.getByTestId('score')).toHaveTextContent('0 of 4 matched');
  },
};

// --- A lamp and a battery: close the circuit. ------------------------------

/**
 * The lamp lights when the circuit is closed. `flow` sends dashes along the
 * cable from the battery to the lamp; for reduced motion they stand still.
 */
export const Circuit: Story = {
  render: function CircuitStory() {
    const [connections, setConnections] = useState<PatchbayConnection[]>([]);
    const lit = connections.some((c) => c.to === 'lamp.in');
    return (
      <Patchbay
        aria-label="Circuit"
        connections={connections}
        onConnectionsChange={setConnections}
        flow
        className="flex flex-wrap items-end justify-around gap-8 py-8"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-12 flex-col items-center justify-center rounded-lg border-2 border-border-2 bg-card">
            <span className="text-xl font-bold text-(--text)">+</span>
            <span className="text-xl font-bold text-(--text-muted)">−</span>
          </div>
          <Patchbay.Port id="battery.out" direction="out" label="Power" name="Battery, power out" color="var(--accent)" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <span
            aria-hidden
            className="block h-16 w-16 rounded-full border-2 border-border-2 transition-all duration-300"
            style={{
              background: lit ? 'var(--accent)' : 'var(--card)',
              boxShadow: lit ? '0 0 32px 8px color-mix(in oklch, var(--accent) 50%, transparent)' : 'none',
            }}
          />
          <span className="text-sm text-(--text-muted)" role="status">
            {lit ? 'The lamp is on' : 'The lamp is off'}
          </span>
          <Patchbay.Port id="lamp.in" direction="in" label="Lamp" name="Lamp, power in" color="var(--accent)" />
        </div>
      </Patchbay>
    );
  },
};

/** `readOnly`: the cables as a diagram, nothing to press. */
export const Diagram: Story = {
  render: () => (
    <Patchbay
      aria-label="Signal path"
      readOnly
      defaultConnections={[
        { from: 'a.out', to: 'b.in' },
        { from: 'a.out', to: 'c.in' },
      ]}
      className="flex flex-wrap items-start justify-around gap-8 py-6"
    >
      {[
        { id: 'a', name: 'Source', ins: false, outs: true },
        { id: 'b', name: 'Left', ins: true, outs: false },
        { id: 'c', name: 'Right', ins: true, outs: false },
      ].map((n) => (
        <Card key={n.id} className="w-40">
          <Card.Header>
            <Heading as="h3" size="sm">{n.name}</Heading>
          </Card.Header>
          <Card.Footer>
            <span>{n.ins && <Patchbay.Port id={`${n.id}.in`} direction="in" label="In" name={`${n.name} in`} />}</span>
            <span>{n.outs && <Patchbay.Port id={`${n.id}.out`} direction="out" label="Out" name={`${n.name} out`} />}</span>
          </Card.Footer>
        </Card>
      ))}
    </Patchbay>
  ),
};

/**
 * `connector="straight"`: one line from port to port. A quiz reads better
 * this way — each match is seen at a glance, where hanging cables cross and
 * bunch at the bottom.
 */
export const StraightLines: Story = {
  render: () => (
    <Patchbay
      aria-label="Match the question to its answer"
      connector="straight"
      defaultConnections={[
        { from: 'q1', to: 'a2' },
        { from: 'q2', to: 'a4' },
        { from: 'q4', to: 'a3' },
      ]}
      canConnect={(from, to, all) => !all.some((c) => c.from === from.id || c.to === to.id)}
      className="grid max-w-[44rem] grid-cols-[1fr_auto_auto_1fr] items-center gap-x-3 gap-y-2"
    >
      {ROWS.map(({ question, answer }, i) => (
        <div key={question.id} className="contents">
          <span className="text-(--text)">{question.text}</span>
          <Patchbay.Port id={question.id} direction="out" name={`Question ${i + 1}: ${question.text}`} />
          <Patchbay.Port id={answer.id} direction="in" name={`Answer: ${answer.text}`} />
          <span className="text-(--text)">{answer.text}</span>
        </div>
      ))}
    </Patchbay>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('.patchbay-cable-line').length).toBe(3));
    const d = canvasElement.querySelector('.patchbay-cable-line')?.getAttribute('d') ?? '';
    await expect(d).toMatch(/^M[-\d. ]+L[-\d. ]+$/);
  },
};

/**
 * `connector="elbow"`: right angles, for a diagram. Two lines leaving one
 * port run together until they part. `anchor` ports draw no socket: the
 * line ends on the point, here the edge of a card — what `Flowchart` builds on.
 */
export const Elbows: Story = {
  render: () => (
    <Patchbay
      aria-label="One source feeds two sinks"
      readOnly
      connector="elbow"
      defaultConnections={[
        { from: 'a.out', to: 'b.in' },
        { from: 'a.out', to: 'c.in' },
      ]}
      className="grid max-w-md grid-cols-2 gap-x-10 gap-y-12"
    >
      <Card featured padding="sm" className="relative col-span-2 text-center font-bold">
        Source
        <Patchbay.Port anchor id="a.out" direction="out" name="Source out" className="bottom-[-2px] left-1/2" />
      </Card>
      {['b', 'c'].map((id, i) => (
        <Card key={id} featured padding="sm" className="relative text-center font-bold">
          <Patchbay.Port anchor id={`${id}.in`} direction="in" name={`Sink ${i + 1} in`} className="top-[-2px] left-1/2" />
          Sink {i + 1}
        </Card>
      ))}
    </Patchbay>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('.patchbay-cable-line').length).toBe(2));
    await expect(canvasElement.querySelector('.patchbay-cable-line')?.getAttribute('d')).toMatch(/V.*H.*V/);
    // Anchors: no plug drawn at either end.
    await expect(canvasElement.querySelectorAll('.patchbay-cable-end').length).toBe(0);
  },
};

/** Removing with the pointer: click a cable, then its remove button. */
export const RemoveByPointer: Story = {
  render: function RemoveStory() {
    const [connections, setConnections] = useState<PatchbayConnection[]>([{ from: 'a.out', to: 'b.in' }]);
    return (
      <div className="flex flex-col gap-3">
        <Patchbay
          aria-label="Two boxes"
          connections={connections}
          onConnectionsChange={setConnections}
          className="flex items-start justify-between gap-8 py-6"
        >
          <Patchbay.Port id="a.out" direction="out" label="Out" name="A out" />
          <Patchbay.Port id="b.in" direction="in" label="In" name="B in" />
        </Patchbay>
        <p className="m-0 text-sm text-(--text-muted)" data-testid="count">{connections.length} cable(s)</p>
        <div>
          <Button size="sm" variant="outline" onPress={() => setConnections([{ from: 'a.out', to: 'b.in' }])}>
            Reset
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const cable = canvas.getByRole('button', { name: 'Cable from A out to B in' });
    await userEvent.click(cable);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove cable' }));
    expect(canvas.getByTestId('count')).toHaveTextContent('0 cable(s)');
  },
};
