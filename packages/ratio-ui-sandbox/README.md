# @eventuras/ratio-ui-sandbox

> ⚠️ **Alpha.** Experimental and unstable — the API may change or be removed
> without notice, and it is published under the `alpha` npm dist-tag. Pin an
> exact version if you depend on it.

Runs a piece of React code in an isolated frame, so content authors can embed small interactive examples in an article without the code reaching the page around it. The package has two parts that are versioned together:

- **`Sandbox`** — the React component that hosts the frame.
- **The runtime** — React and Ratio UI built as ES modules a browser can import directly, so the code in the frame can use Ratio UI components.

## Installation

```bash
pnpm add @eventuras/ratio-ui-sandbox
```

React 19 is a peer dependency. The component has no other dependencies and needs no stylesheet.

## Usage

```tsx
'use client';

import { Sandbox, resolveRuntime } from '@eventuras/ratio-ui-sandbox';
import manifest from '@eventuras/ratio-ui-sandbox/runtime/manifest.json';

const runtime = resolveRuntime(manifest, 'https://example.org/sandbox-runtime/0.1.0/', {
  specifiers: ['@eventuras/ratio-ui/core/Button'],
});

<Sandbox title="Counter" code={compiledCode} runtime={runtime} props={{ start: 0 }} />;
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

Compile JSX and TypeScript where the content is saved, not in the browser.

## What the code can and cannot do

The frame is `sandbox="allow-scripts"` and nothing else, so it has no origin. A Content-Security-Policy inside the frame adds a second limit.

Can:

- Run JavaScript and render React.
- Import what the `runtime` lists.
- Load images, fonts and styles from the runtime's own origins.

Cannot:

- Read or change the host page, its cookies, `localStorage` or session.
- Navigate the host page, open windows or submit forms.
- Call the network: `fetch`, `XMLHttpRequest` and WebSockets are blocked.
- Import anything the `runtime` does not list.

The sandbox keeps the code away from the page. It does not make the code good: an example can still be slow or wrong, so decide who may author them.

## Serving the runtime

The build writes the runtime to `dist/runtime`:

| Path | What |
| --- | --- |
| `manifest.json` | Versions, and the file behind each import specifier |
| `react.js`, `react-dom.js`, `react-dom-client.js`, `react-jsx-runtime.js` | React |
| `ratio-ui/**` | One module per Ratio UI export, such as `ratio-ui/core/Button.js` |
| `chunks/**` | Code the modules share |
| `ratio-ui.css`, `fonts.css`, `fonts/**` | Tokens, themes, component styles and the brand fonts |

Copy the folder to wherever the app serves static files, and tell `resolveRuntime` the URL. Requirements:

- The base URL must be absolute. A frame without an origin cannot resolve relative ones.
- The files must be served with `Access-Control-Allow-Origin: *`. They are public code.
- Put the package version in the path, and keep old versions online. Content saved against one version keeps working when the next ships.
- The files never change within a version, so they can be cached for a long time.

`resolveRuntime` takes the specifiers the code imports and builds an import map with only those. It throws when one is missing from the runtime, which is the place to tell an author that an import is not available.

Every module shares one copy of React. An example that imports a single component typically fetches a few dozen files, because Ratio UI's components share code with each other.

The runtime does not include the Next.js wrappers in `@eventuras/ratio-ui-next`.

## Theme

The frame follows the host page: it mirrors `data-theme` and `data-color-scheme` from the host's `<html>` and updates when they change, without reloading the example. Pass `theme` or `colorScheme` to pin a value instead.

## Height

The frame reports its content height and the component follows it, between `minHeight` (default 120) and `maxHeight` (default 4000).

## Errors

When the code fails to load or render, the frame is replaced by `labels.error` and `onError` receives the message. The message is not shown to readers.

## Host page Content-Security-Policy

A `srcdoc` frame also inherits the host page's CSP. If the host sets one, it must allow inline scripts, `blob:` scripts and the runtime origin for frames, or the example will not start.

## Accessibility

`title` is required and is the frame's accessible name. Describe what the example does ("ROT13 encoder"), not what it is ("Sandbox").
