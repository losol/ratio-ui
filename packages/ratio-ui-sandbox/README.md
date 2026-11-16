# @eventuras/ratio-ui-sandbox

> ⚠️ **Alpha.** Experimental and unstable — the API may change or be removed
> without notice, and it is published under the `alpha` npm dist-tag. Pin an
> exact version if you depend on it.

Runs a piece of React code in a frame on a separate origin, so content authors can embed small interactive examples in an article without the code reaching the page around it. The package has two parts that are versioned together:

- **`Sandbox`** — the React component that hosts the frame.
- **The runtime** — what the sandbox origin serves: `frame.html`, and React and Ratio UI built as ES modules a browser can import directly.

## Installation

```bash
pnpm add @eventuras/ratio-ui-sandbox
```

React 19 is a peer dependency. The component has no other dependencies and needs no stylesheet.

## Usage

```tsx
import { Sandbox } from '@eventuras/ratio-ui-sandbox';

<Sandbox
  src="https://sandbox.example/0.1.0/frame.html"
  title="Counter"
  code={compiledCode}
  props={{ start: 0 }}
/>;
```

`code` is an ES module, already compiled to plain JavaScript. Its default export is rendered as a React component with `props`:

```js
import { useState } from 'react';
import { jsx } from 'react/jsx-runtime';
import { Button } from '@eventuras/ratio-ui/core/Button';

export default function Counter({ start }) {
  const [count, setCount] = useState(start);
  return jsx(Button, { onClick: () => setCount(count + 1), children: `Clicked ${count}` });
}
```

Compile JSX and TypeScript where the content is saved, not in the browser. `runtime/manifest.json` lists every specifier the code may import, so a save step can reject an import the runtime does not have:

```ts
import manifest from '@eventuras/ratio-ui-sandbox/runtime/manifest.json';

const available = (specifier: string) => specifier in manifest.imports;
```

## The sandbox origin

The frame must be served from another origin than the pages that embed it. `Sandbox` refuses to start when `src` has the page's own origin.

**Use a separate registrable domain, not a subdomain.** `sandbox.example.org` is the same _site_ as `www.example.org`: cookies set for `example.org` are visible to it, and requests from it carry `SameSite` cookies. A domain of its own (as GitHub does with `githubusercontent.com`) gives the browser a hard line to enforce.

On that origin:

- Serve `dist/runtime` as static files, under a path with the package version in it. Content saved against one version keeps working when the next ships.
- Send `Access-Control-Allow-Origin: *`. The files are public code.
- Cache them for a long time. Nothing changes within a version.
- Keep everything else off it: no logins, no cookies, no API. Any page can embed the frame and run its own code on that origin, so nothing there may be worth reaching.
- Optionally send `Content-Security-Policy: frame-ancestors …` on `frame.html` to name the sites that may embed it.

### What is served

| Path | What |
| --- | --- |
| `frame.html`, `frame.js` | The document every sandbox frame loads, and the script that runs the code |
| `manifest.json` | Versions, and the file behind each import specifier |
| `react.js`, `react-dom.js`, `react-dom-client.js`, `react-jsx-runtime.js` | React |
| `ratio-ui/**` | One module per Ratio UI export, such as `ratio-ui/core/Button.js` |
| `chunks/**` | Code the modules share |
| `ratio-ui.css`, `fonts.css`, `fonts/**` | Tokens, themes, component styles and the brand fonts |

Every module shares one copy of React. An example that imports a couple of components fetches a few dozen files the first time, because Ratio UI's components share code with each other; after that the browser has them cached. Import single components (`core/Button`) rather than whole groups (`forms`) to keep the first load small.

The runtime does not include the Next.js wrappers in `@eventuras/ratio-ui-next`.

## What the code can and cannot do

Can:

- Run JavaScript and render React.
- Import React and every Ratio UI export.
- Use the sandbox origin's own storage. It is shared by every example on that origin, so treat it as public.

Cannot:

- Read or change the host page, its cookies, `localStorage` or session — the same-origin policy.
- Navigate the host page, open windows or submit forms — the frame's `sandbox` attribute.
- Call the network or import from other origins — the Content-Security-Policy in `frame.html`.

The sandbox keeps the code away from the page. It does not make the code good: an example can still be slow or wrong, so decide who may author them.

### Why a separate origin

A frame without an origin (`sandbox="allow-scripts"` alone) is just as isolated, but browsers give it no HTTP cache: every view downloads React, Ratio UI and the fonts again. A real origin caches normally. That is why the frame is given `allow-same-origin` — and why that origin must never be the page's own, since a frame that is same-origin with its page and can run scripts can remove its own sandbox.

## Theme

The frame follows the host page: it mirrors `data-theme` and `data-color-scheme` from the host's `<html>` and updates when they change, without reloading the example. Pass `theme` or `colorScheme` to pin a value instead.

## Height

The frame reports its content height and the component follows it, between `minHeight` (default 120) and `maxHeight` (default 4000).

## Errors

When the code fails to load or render, or a loaded frame does not start the code within `timeout` (default 15 seconds), the frame is replaced by `labels.error` and `onError` receives the message. The message is not shown to readers.

## Host page Content-Security-Policy

If the host page sets a CSP, its `frame-src` must allow the sandbox origin.

## Accessibility

`title` is required and is the frame's accessible name. Describe what the example does ("ROT13 encoder"), not what it is ("Sandbox").

## Developing

`pnpm build` builds the component and the runtime. The stories need both, and a second origin: locally they load the frame from `127.0.0.1` when Storybook is opened on `localhost`, and the other way round. Set `STORYBOOK_SANDBOX_URL` to a deployed `frame.html` to run them elsewhere.
