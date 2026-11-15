// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** `source` tag on messages the frame posts to the host. */
export const SANDBOX_FRAME_SOURCE = 'ratio-ui-sandbox';
/** `source` tag on messages the host posts into the frame. */
export const SANDBOX_HOST_SOURCE = 'ratio-ui-sandbox-host';

/**
 * What the code in the frame may import, and the styles it gets.
 *
 * The frame has no origin, so every URL must be absolute, and the script URLs
 * must be served with `Access-Control-Allow-Origin: *`.
 */
export interface SandboxRuntime {
  /**
   * Import map: bare specifier → absolute URL of an ES module. Must contain
   * `react` and `react-dom/client`; add `react/jsx-runtime` for compiled JSX
   * and one entry per library path the code may import.
   */
  imports: Record<string, string>;
  /** Absolute URLs of stylesheets loaded before the code runs. */
  stylesheets?: string[];
}

export interface SandboxDocumentOptions {
  /** Unique per frame. Echoed in every message so the host can match it. */
  id: string;
  /** ES module source whose default export is a React component. */
  code: string;
  runtime: SandboxRuntime;
  /** JSON-serialisable props for the default export. */
  props?: Record<string, unknown>;
  /** Document language. @default 'en' */
  lang?: string;
  /** Initial `data-theme` on the frame's `<html>`. */
  theme?: string;
  /** Initial `data-color-scheme` on the frame's `<html>`. */
  colorScheme?: string;
}

const escapeAttribute = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

/**
 * JSON that is safe inside a `<script>` element: no `<` survives, so the data
 * can neither close the element nor open a comment, whatever the code holds.
 */
const scriptJson = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll(String.fromCodePoint(0x2028), '\\u2028')
    .replaceAll(String.fromCodePoint(0x2029), '\\u2029');

const httpOrigin = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.origin : null;
  } catch {
    return null;
  }
};

/**
 * Origins the runtime is served from, in first-seen order. Throws on a URL
 * that is not absolute http(s): a relative URL cannot resolve in a frame
 * without an origin, and would otherwise fail there with an opaque error.
 */
export function runtimeOrigins(runtime: SandboxRuntime): string[] {
  const origins = new Set<string>();
  for (const url of [...Object.values(runtime.imports), ...(runtime.stylesheets ?? [])]) {
    const origin = httpOrigin(url);
    if (!origin) {
      throw new Error(`Sandbox runtime URLs must be absolute http(s) URLs. Got "${url}".`);
    }
    origins.add(origin);
  }
  return [...origins];
}

/**
 * Runs inside the frame. Kept as plain text because it is injected into the
 * document, not bundled: it may only use what a browser provides.
 */
const BOOTSTRAP = String.raw`
const config = JSON.parse(document.getElementById('sandbox-config').textContent);
const post = (message) =>
  parent.postMessage({ source: '${SANDBOX_FRAME_SOURCE}', id: config.id, ...message }, '*');
const fail = (error) =>
  post({ type: 'error', message: String((error && error.message) || error || 'Unknown error') });

addEventListener('error', (event) => fail(event.error || event.message));
addEventListener('unhandledrejection', (event) => fail(event.reason));

const root = document.documentElement;
new ResizeObserver(() => {
  post({ type: 'resize', height: Math.ceil(root.getBoundingClientRect().height) });
}).observe(root);

addEventListener('message', (event) => {
  const data = event.data;
  if (event.source !== parent || !data || data.source !== '${SANDBOX_HOST_SOURCE}') return;
  if (data.type !== 'theme') return;
  for (const [name, value] of [['data-theme', data.theme], ['data-color-scheme', data.colorScheme]]) {
    if (typeof value === 'string' && value) root.setAttribute(name, value);
    else root.removeAttribute(name);
  }
});

try {
  const url = URL.createObjectURL(new Blob([config.code], { type: 'text/javascript' }));
  const [module, React, ReactDOM] = await Promise.all([
    import(url),
    import('react'),
    import('react-dom/client'),
  ]);
  if (typeof module.default !== 'function') {
    throw new Error('The sandbox code must have a default export that is a React component.');
  }
  class Boundary extends React.Component {
    constructor(props) {
      super(props);
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
    React.createElement(Boundary, null, React.createElement(module.default, config.props)),
  );
  post({ type: 'ready' });
} catch (error) {
  fail(error);
}
`;

/**
 * Builds the HTML document shown in the sandbox frame.
 *
 * The code and its props travel as inert JSON and are imported from a blob
 * URL, so nothing in them is ever parsed as markup. A Content-Security-Policy
 * limits the frame to the runtime's own origins: the code cannot `fetch`,
 * open sockets, post forms or load scripts from anywhere else.
 */
export function buildSandboxDocument(options: SandboxDocumentOptions): string {
  const { id, code, runtime, props = {}, lang = 'en', theme, colorScheme } = options;
  const origins = runtimeOrigins(runtime).join(' ');

  const csp = [
    "default-src 'none'",
    `script-src 'unsafe-inline' blob: ${origins}`,
    `style-src 'unsafe-inline' ${origins}`,
    `img-src data: blob: ${origins}`,
    `font-src data: ${origins}`,
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
  ]
    .map((directive) => directive.trim())
    .join('; ');

  const rootAttributes = [
    `lang="${escapeAttribute(lang)}"`,
    theme ? `data-theme="${escapeAttribute(theme)}"` : '',
    colorScheme ? `data-color-scheme="${escapeAttribute(colorScheme)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const stylesheets = (runtime.stylesheets ?? [])
    .map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}">`)
    .join('\n');

  return `<!doctype html>
<html ${rootAttributes}>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(csp)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="importmap">${scriptJson({ imports: runtime.imports })}</script>
${stylesheets}
<style>html,body{margin:0;background:transparent}body{overflow:hidden}</style>
</head>
<body>
<div id="root"></div>
<script type="application/json" id="sandbox-config">${scriptJson({ id, code, props })}</script>
<script type="module">${BOOTSTRAP}</script>
</body>
</html>`;
}
