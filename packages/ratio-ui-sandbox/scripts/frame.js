// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Runs inside the sandbox frame. Shipped as-is next to frame.html: it may use
// only what a browser provides, plus the modules in the frame's import map.
// The message shapes are described in src/Sandbox/protocol.ts.

const FRAME = 'ratio-ui-sandbox';
const HOST = 'ratio-ui-sandbox-host';

const root = document.documentElement;

// The frame does not know which page embeds it, so it cannot name a target
// origin. Nothing it posts is secret: a height, a status, an error message.
const post = (message) => parent.postMessage({ source: FRAME, ...message }, '*');
const fail = (error) =>
  post({ type: 'error', message: String((error && error.message) || error || 'Unknown error') });

addEventListener('error', (event) => fail(event.error || event.message));
addEventListener('unhandledrejection', (event) => fail(event.reason));

new ResizeObserver(() => {
  post({ type: 'resize', height: Math.ceil(root.getBoundingClientRect().height) });
}).observe(root);

const applyTheme = ({ theme, colorScheme }) => {
  for (const [name, value] of [
    ['data-theme', theme],
    ['data-color-scheme', colorScheme],
  ]) {
    if (typeof value === 'string' && value) root.setAttribute(name, value);
    else root.removeAttribute(name);
  }
};

const run = async ({ code, props }) => {
  const url = URL.createObjectURL(new Blob([String(code)], { type: 'text/javascript' }));
  const [module, React, ReactDOM] = await Promise.all([
    import(url),
    import('react'),
    import('react-dom/client'),
  ]);
  if (typeof module.default !== 'function') {
    throw new Error('The sandbox code must have a default export that is a React component.');
  }
  class Boundary extends React.Component {
    constructor(boundaryProps) {
      super(boundaryProps);
      this.state = { failed: false };
    }
    static getDerivedStateFromError() {
      return { failed: true };
    }
    componentDidCatch(error) {
      fail(error);
    }
    render() {
      return this.state.failed ? null : this.props.children;
    }
  }
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(Boundary, null, React.createElement(module.default, props ?? {})),
  );
  post({ type: 'ready' });
};

let started = false;
addEventListener('message', (event) => {
  const data = event.data;
  if (event.source !== parent || !data || data.source !== HOST) return;
  if (data.type === 'theme') applyTheme(data);
  if (data.type === 'run' && !started) {
    // One run per load: the host loads a fresh frame for new code.
    started = true;
    applyTheme(data);
    if (typeof data.lang === 'string' && data.lang) root.lang = data.lang;
    run(data).catch(fail);
  }
});

// Opened directly, there is no host to answer.
if (parent !== window) post({ type: 'hello' });
