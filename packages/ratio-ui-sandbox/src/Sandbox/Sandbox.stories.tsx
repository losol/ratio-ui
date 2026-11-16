import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Sandbox } from './Sandbox';

/**
 * Where the stories find a sandbox origin.
 *
 * A sandbox must live on another origin than the page, and Storybook is one
 * origin. Locally the stories use the fact that `localhost` and `127.0.0.1`
 * are two origins for the same dev server, which serves the built runtime at
 * `/sandbox-runtime` (see `.storybook/main.ts`). Anywhere else, set
 * `STORYBOOK_SANDBOX_URL` to a deployed `frame.html`.
 */
const sandboxSrc = (): string | null => {
  const configured = (import.meta as { env?: Record<string, string | undefined> }).env
    ?.STORYBOOK_SANDBOX_URL;
  if (configured) return configured;
  if (typeof window === 'undefined') return null;
  const { protocol, hostname, port } = window.location;
  const twin = { localhost: '127.0.0.1', '127.0.0.1': 'localhost' }[hostname];
  return twin ? `${protocol}//${twin}:${port}/sandbox-runtime/frame.html` : null;
};

const needsSandboxOrigin: Decorator = (Story, context) => {
  if (context.args.src) return <Story />;
  return (
    <p style={{ maxWidth: '40rem' }}>
      These stories need a sandbox origin, and this Storybook has none. Run{' '}
      <code>pnpm build</code> and <code>pnpm storybook</code> locally, or set{' '}
      <code>STORYBOOK_SANDBOX_URL</code> to a deployed <code>frame.html</code>.
    </p>
  );
};

const meta: Meta<typeof Sandbox> = {
  title: 'Sandbox/Sandbox',
  component: Sandbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Runs a piece of React code in a frame on another origin. The code can use Ratio UI, ' +
          'but cannot reach the page around it, its cookies or the network.',
      },
    },
  },
  // Left out of the automated story tests: they depend on a built runtime and
  // a second origin, which the test run does not provide.
  tags: ['autodocs', '!test'],
  decorators: [needsSandboxOrigin],
  args: { src: sandboxSrc() ?? '' },
};

export default meta;
type Story = StoryObj<typeof Sandbox>;

// The code in these stories is what a compiler would produce from JSX: plain
// JavaScript, with `h` for React.createElement.

const counter = `
import { createElement as h, useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';

export default function Counter({ start }) {
  const [count, setCount] = useState(start);
  return h(Button, { onClick: () => setCount(count + 1) }, 'Clicked ' + count + ' times');
}
`;

/** The default export is rendered, with `props` passed to it. */
export const Counter: Story = {
  args: { title: 'Counter', code: counter, props: { start: 0 }, minHeight: 60 },
};

const ratioUi = `
import { createElement as h, useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

const moods = ['Curious', 'Focused', 'Delighted'];

export default function MoodCard() {
  const [index, setIndex] = useState(0);
  return h(
    Card,
    { padding: 'md' },
    h(Heading, { as: 'h3' }, 'Today I am ' + moods[index].toLowerCase()),
    h(
      'div',
      { style: { display: 'flex', gap: 8, marginTop: 12 } },
      moods.map((mood, i) =>
        h(
          Button,
          { key: mood, variant: i === index ? 'primary' : 'outline', onClick: () => setIndex(i) },
          mood,
        ),
      ),
    ),
  );
}
`;

/**
 * The code imports Ratio UI by its usual paths. Styles, fonts and theme come
 * from the runtime, so the example looks like the page around it.
 */
export const RatioUiComponents: Story = {
  args: { title: 'Mood picker built with Ratio UI', code: ratioUi },
};

const rot13 = `
import { createElement as h, useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const rot13 = (text) =>
  Array.from(text, (char) => {
    const at = ALPHABET.indexOf(char.toUpperCase());
    if (at === -1) return char;
    const turned = ALPHABET[(at + 13) % 26];
    return char === char.toUpperCase() ? turned : turned.toLowerCase();
  }).join('');

const cell = (lit) => ({
  width: 32,
  height: 32,
  textAlign: 'center',
  border: '1px solid var(--border-1, currentColor)',
  fontFamily: 'ui-monospace, monospace',
  fontWeight: lit ? 700 : 400,
  background: lit ? 'var(--primary)' : 'transparent',
  color: lit ? 'var(--text-on-primary)' : 'inherit',
});

export default function Rot13({ start }) {
  const [text, setText] = useState(start);
  const [active, setActive] = useState(null);
  const partner = active ? rot13(active) : null;
  const rows = [ALPHABET.slice(0, 13), ALPHABET.slice(13)];

  return h(
    'div',
    { style: { display: 'grid', gap: 16 } },
    h(Heading, { as: 'h3' }, 'ROT13'),
    h(
      'table',
      { style: { borderCollapse: 'collapse' }, onMouseLeave: () => setActive(null) },
      h(
        'tbody',
        null,
        rows.map((row) =>
          h(
            'tr',
            { key: row },
            Array.from(row, (letter) =>
              h(
                'td',
                {
                  key: letter,
                  style: cell(letter === active || letter === partner),
                  onMouseEnter: () => setActive(letter),
                },
                letter,
              ),
            ),
          ),
        ),
      ),
    ),
    h('textarea', {
      'aria-label': 'Message',
      rows: 2,
      value: text,
      onChange: (event) => setText(event.target.value),
      style: { font: 'inherit', padding: 8, background: 'transparent', color: 'inherit' },
    }),
    h('output', { style: { fontFamily: 'ui-monospace, monospace' } }, rot13(text)),
    h('div', null, h(Button, { onClick: () => setText(rot13(text)) }, 'Encode once more')),
  );
}
`;

/**
 * A complete small example: the ROT13 cipher, with the letter pairs lit up on
 * hover. Encoding twice gives the original text back.
 */
export const Rot13Encoder: Story = {
  args: { title: 'ROT13 encoder', code: rot13, props: { start: 'Hello, you made it!' } },
};

const growing = `
import { createElement as h, useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';

export default function Growing() {
  const [rows, setRows] = useState(1);
  return h(
    'div',
    null,
    h(Button, { onClick: () => setRows(rows + 1) }, 'Add a row'),
    Array.from({ length: rows }, (_, i) => h('p', { key: i }, 'Row ' + (i + 1))),
  );
}
`;

/** The frame follows the height of its content, between `minHeight` and `maxHeight`. */
export const GrowsWithContent: Story = {
  args: { title: 'Growing list', code: growing, minHeight: 40, maxHeight: 400 },
};

const themed = `
import { createElement as h, useEffect, useState } from 'react';
import { Card } from '@eventuras/ratio-ui/core/Card';

export default function Themed() {
  const read = () => {
    const { theme, colorScheme } = document.documentElement.dataset;
    return [theme, colorScheme].filter(Boolean).join(' / ') || 'none';
  };
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  return h(Card, { padding: 'md' }, 'Theme in the frame: ' + theme);
}
`;

/**
 * The frame mirrors the page's `data-theme` and `data-color-scheme`. Switch
 * theme in the toolbar: the example follows without reloading.
 */
export const FollowsTheme: Story = {
  args: { title: 'Theme mirror', code: themed, minHeight: 60 },
};

/** `theme` and `colorScheme` pin the frame to one theme whatever the page uses. */
export const PinnedTheme: Story = {
  args: { ...FollowsTheme.args, title: 'Pinned theme', theme: 'dark' },
};

const isolation = `
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
      attempt("Read the page's storage", () => parent.localStorage.length),
      attempt('Call the network', () => fetch('./manifest.json')),
      attempt('Import from elsewhere', () => import('https://esm.sh/left-pad')),
      attempt('Navigate the page', () => { top.location.href = 'https://example.org/'; }),
      attempt('Open a window', () => { if (!window.open('about:blank')) throw new Error(); }),
    ]).then(setLines);
  }, []);
  return h('ul', { style: { margin: 0 } }, lines.map((line) => h('li', { key: line }, line)));
}
`;

/** What the code is kept from doing. Every line should read "blocked". */
export const Isolation: Story = {
  args: { title: 'Isolation probe', code: isolation },
};

/** Code that fails is replaced by a short message; the details go to `onError`. */
export const FailingCode: Story = {
  args: {
    title: 'Failing example',
    code: `export default function Broken() { throw new Error('Synthetic failure'); }`,
    labels: { error: 'This example could not be shown.' },
  },
};

/**
 * A frame on the page's own origin would give the code the page itself, so
 * the component refuses it and never loads the frame.
 */
export const RefusesOwnOrigin: Story = {
  args: { title: 'Refused', code: counter },
  render: (args) => (
    <Sandbox
      {...args}
      src={`${globalThis.location?.origin ?? ''}/sandbox-runtime/frame.html`}
    />
  ),
};
