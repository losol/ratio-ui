import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sandbox } from './Sandbox';
import type { SandboxRuntime } from './buildSandboxDocument';

/**
 * Stories load React from esm.sh so they run without a build step. They need
 * network access, so they are left out of the automated story tests. An app
 * should serve its own runtime instead — see the README.
 */
const runtime: SandboxRuntime = {
  imports: {
    react: 'https://esm.sh/react@19.3.1',
    'react-dom/client': 'https://esm.sh/react-dom@19.3.1/client',
    'react/jsx-runtime': 'https://esm.sh/react@19.3.1/jsx-runtime',
  },
};

const meta: Meta<typeof Sandbox> = {
  title: 'Core/Sandbox',
  component: Sandbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Runs a piece of React code in an isolated frame. The code cannot reach the page ' +
          'around it, its cookies or the network.',
      },
    },
  },
  tags: ['autodocs', '!test'],
  args: { runtime },
};

export default meta;
type Story = StoryObj<typeof Sandbox>;

const counter = `
import { createElement as h, useState } from 'react';

export default function Counter({ label }) {
  const [count, setCount] = useState(0);
  return h(
    'button',
    { onClick: () => setCount(count + 1), style: { font: 'inherit', padding: '8px 12px' } },
    label + ': ' + count,
  );
}
`;

/** The default export is rendered, with `props` passed to it. */
export const Counter: Story = {
  args: { title: 'Counter', code: counter, props: { label: 'Clicked' } },
};

const growing = `
import { createElement as h, useState } from 'react';

export default function Growing() {
  const [rows, setRows] = useState(1);
  return h(
    'div',
    null,
    h('button', { onClick: () => setRows(rows + 1) }, 'Add a row'),
    Array.from({ length: rows }, (_, i) => h('p', { key: i }, 'Row ' + (i + 1))),
  );
}
`;

/** The frame follows the height of its content. */
export const GrowsWithContent: Story = {
  args: { title: 'Growing list', code: growing, minHeight: 40 },
};

const isolated = `
import { createElement as h, useEffect, useState } from 'react';

const attempt = async (name, run) => {
  try {
    await run();
    return name + ': allowed';
  } catch {
    return name + ': blocked';
  }
};

export default function Probe() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    Promise.all([
      attempt('Read the page', () => parent.document.title),
      attempt('Read cookies', () => document.cookie),
      attempt('Use localStorage', () => localStorage.getItem('x')),
      attempt('Call the network', () => fetch('https://esm.sh/')),
    ]).then(setLines);
  }, []);
  return h('ul', null, lines.map((line) => h('li', { key: line }, line)));
}
`;

/** What the code is kept from doing. Every line should read "blocked". */
export const Isolation: Story = {
  args: { title: 'Isolation probe', code: isolated },
};

/** Code that fails is replaced by a short message; details go to `onError`. */
export const FailingCode: Story = {
  args: {
    title: 'Failing example',
    code: `export default function Broken() { throw new Error('Synthetic failure'); }`,
  },
};
