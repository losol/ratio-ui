import type { ReactNode } from 'react';
import { Meta, StoryFn } from '@storybook/react-vite';
import { DataTree, type DataNode } from './DataTree';

const meta: Meta<typeof DataTree> = {
  title: 'Core/DataTree',
  component: DataTree,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

// --- caller-side leaf renderers (live in the app, not the component) ---
const Mono = ({ children }: { children: ReactNode }) => (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em', overflowWrap: 'anywhere' }}>
    {children}
  </span>
);
const Badge = ({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'info' | 'success' | 'warning' | 'error';
}) => (
  <span
    style={{
      display: 'inline-flex',
      whiteSpace: 'nowrap',
      padding: '2px 10px',
      borderRadius: 8,
      fontSize: '0.78rem',
      fontWeight: 600,
      background: `var(--${tone}-bg)`,
      color: `var(--${tone}-text)`,
      border: `1px solid var(--${tone}-border)`,
    }}
  >
    {children}
  </span>
);
const A = ({ children }: { children: ReactNode }) => (
  <a
    href="#"
    style={{ color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 2 }}
  >
    {children}
  </a>
);

// Faint array index marker — the caller supplies it as the item's term
// where order matters (0-based, matches the data path).
const IndexChip = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      borderRadius: 999,
      background: 'var(--overlay-press)',
      color: 'var(--text-subtle)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

const Template: StoryFn<typeof DataTree> = (args) => (
  <div style={{ maxWidth: 640 }}>
    <DataTree {...args} />
  </div>
);

const basic: DataNode[] = [
  { term: 'subject', value: 'The common octopus' },
  { term: 'hearts', value: 'three (one pauses while swimming)' },
  { term: 'favouriteColour', value: '' }, // empty → em dash — they're colour-blind
  {
    term: 'abilities',
    children: [
      { term: 'camouflage', value: 'instant, full-body' },
      { term: 'escape', value: 'unscrews the jar lid from the inside' },
    ],
  },
];

export const Default = Template.bind({});
Default.args = { nodes: basic };

export const Collapsible = Template.bind({});
Collapsible.args = { nodes: basic, collapsible: true, defaultOpenDepth: 1 };

export const NeutralRule = Template.bind({});
NeutralRule.args = { nodes: basic, accentRule: false };

export const NoDividers = Template.bind({});
NoDividers.args = { nodes: basic, rowDividers: false };

// A fictional, FHIR-shaped `LearningActivity` resource — values pre-rendered
// by the caller. Shows nested groups, an array with index chips, several
// badge tones, mono/links, an em dash, and a self-referential joke that
// fits a recursive renderer.
const learning: DataNode[] = [
  { term: 'resourceType', value: <Badge tone="info">LearningActivity</Badge> },
  { term: 'id', value: <Mono>rec-101-ada</Mono> },
  { term: 'status', value: <Badge tone="success">completed</Badge> },
  {
    term: 'meta',
    children: [
      { term: 'versionId', value: <Mono>3</Mono> }, // took three tries…
      { term: 'lastUpdated', value: '29 Feb 2024, 02:00' },
      { term: 'source', value: <A>course-catalog/recursion</A> },
    ],
  },
  {
    term: 'learner',
    children: [
      { term: 'reference', value: <A>Practitioner/ada-l</A> },
      { term: 'display', value: 'Ada L., junior dev' },
    ],
  },
  {
    term: 'topic',
    children: [
      {
        term: 'coding',
        children: [
          { term: 'system', value: <A>courses.io/topics</A> },
          { term: 'code', value: <Mono>REC-101</Mono> },
          { term: 'display', value: 'Understanding recursion' },
        ],
      },
      { term: 'text', value: 'Understanding recursion' },
    ],
  },
  {
    term: 'prerequisite',
    children: [
      // the joke: to understand recursion, first understand recursion
      { term: 'reference', value: <A>LearningActivity/rec-101-ada</A> },
      { term: 'display', value: 'See “Understanding recursion” (you are here)' },
    ],
  },
  {
    term: 'attempt', // an array — caller marks order with an index chip
    children: [
      {
        term: <IndexChip>0</IndexChip>,
        children: [
          { term: 'verdict', value: <Badge tone="error">stack overflow</Badge> },
          { term: 'note', value: 'Forgot the base case.' },
        ],
      },
      {
        term: <IndexChip>1</IndexChip>,
        children: [
          { term: 'verdict', value: <Badge tone="warning">timeout</Badge> },
          { term: 'note', value: 'Too deep, too fast.' },
        ],
      },
      {
        term: <IndexChip>2</IndexChip>,
        children: [
          { term: 'verdict', value: <Badge tone="success">passed</Badge> },
          { term: 'note', value: 'Base case: n === 0. It clicked.' },
        ],
      },
    ],
  },
  {
    term: 'assessment',
    children: [
      { term: 'score', value: '98 / 100' },
      { term: 'feedback', value: 'Finally — found the base case on the third try.' },
    ],
  },
  {
    term: 'instructor',
    children: [
      { term: 'reference', value: <A>Practitioner/turing-a</A> },
      { term: 'display', value: 'A. Turing (substitute)' },
    ],
  },
  { term: 'coffeeConsumed', value: <Mono>∞ cups</Mono> },
  { term: 'signature', value: '' }, // empty → em dash
];

export const LearningActivity = Template.bind({});
LearningActivity.args = { nodes: learning, collapsible: true, defaultOpenDepth: 2 };
