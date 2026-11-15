# Sandbox

Runs a piece of React code in an isolated frame. Use it to let content authors embed small interactive examples in an article without the code reaching the page around it.

```tsx
import { Sandbox } from '@eventuras/ratio-ui/core/Sandbox';

<Sandbox title="ROT13 encoder" code={compiledCode} runtime={runtime} props={{ start: 'Hei!' }} />
```

`code` is an ES module, already compiled to plain JavaScript. Its default export is rendered as a React component with `props`.

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

## The runtime

`runtime` is an import map plus stylesheets. It decides what `import` resolves to inside the frame:

```ts
const runtime: SandboxRuntime = {
  imports: {
    react: 'https://example.org/sandbox-runtime/v1/react.js',
    'react-dom/client': 'https://example.org/sandbox-runtime/v1/react-dom-client.js',
    'react/jsx-runtime': 'https://example.org/sandbox-runtime/v1/jsx-runtime.js',
    '@eventuras/ratio-ui/core/Button': 'https://example.org/sandbox-runtime/v1/ratio-ui/core/Button.js',
  },
  stylesheets: ['https://example.org/sandbox-runtime/v1/ratio-ui.css'],
};
```

Requirements:

- `react` and `react-dom/client` must be present. Add `react/jsx-runtime` when the code is compiled JSX.
- Every URL must be absolute. A frame without an origin cannot resolve relative ones.
- Script URLs must be ES modules served with `Access-Control-Allow-Origin: *`.
- All modules must share one copy of React. Build libraries with React as an external.
- Put a version in the path. Content saved against `v1` keeps working when `v2` ships.

Ratio UI does not ship a ready-made runtime yet. The published `dist` leaves `react-aria-components`, `lucide-react` and others as bare imports, so it has to be bundled for the browser first.

## Theme

The frame follows the host page: it mirrors `data-theme` and `data-color-scheme` from the host's `<html>` and updates when they change, without reloading the example. Pass `theme` or `colorScheme` to pin a value instead. The runtime's stylesheets must contain the theme for this to have a visible effect.

## Height

The frame reports its content height and the component follows it, between `minHeight` (default 120) and `maxHeight` (default 4000).

## Errors

When the code fails to load or render, the frame is replaced by `labels.error` and `onError` receives the message. The message is not shown to readers.

## Host page Content-Security-Policy

A `srcdoc` frame also inherits the host page's CSP. If the host sets one, it must allow inline scripts, `blob:` scripts and the runtime origins for frames, or the example will not start.

## Accessibility

`title` is required and is the frame's accessible name. Describe what the example does ("ROT13 encoder"), not what it is ("Sandbox").
