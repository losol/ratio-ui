# @eventuras/ratio-ui

Ratio UI is the core Eventuras React component library. It provides design
tokens, global CSS, layout primitives, forms, and reusable UI components built
for product interfaces.

## Installation

```bash
pnpm add @eventuras/ratio-ui
```

Install the React peer dependencies in your app:

```bash
pnpm add react react-dom
```

Other runtime dependencies used by the package are declared as package
dependencies and are installed transitively.

## Styling

Import Ratio UI CSS once from your application entry point or root layout:

```tsx
import '@eventuras/ratio-ui/ratio-ui.css';
```

This includes the design tokens, Tailwind-generated component utilities, and
global page styles. See [`docs/css-exports.md`](docs/css-exports.md) for the
available CSS entry points and theme initialization requirements.

Brand fonts are opt-in:

```tsx
import '@eventuras/ratio-ui/fonts.css';
```

## Component Imports

Ratio UI favors direct subpath imports for components instead of a large root
barrel:

```tsx
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { TextField } from '@eventuras/ratio-ui/forms/Input';
```

## Local Development

From the repository root:

```bash
pnpm install
pnpm --filter @eventuras/ratio-ui storybook
```

Storybook runs on <http://localhost:6006>.

Other package scripts:

```bash
pnpm --filter @eventuras/ratio-ui build
pnpm --filter @eventuras/ratio-ui lint
pnpm --filter @eventuras/ratio-ui test
pnpm --filter @eventuras/ratio-ui test:watch
```

## Source Layout

```text
src/core/       General UI primitives
src/forms/      Form controls and field helpers
src/layout/     Layout primitives and overlays
src/blocks/     Larger composed sections and states
src/pages/      Page-level components
src/tokens/     CSS and TypeScript design tokens
src/visuals/    Visual and progress components
src/commerce/   Commerce-specific UI components
src/console/    Console layout components
src/toast/      Toast queue, renderer, and hook
```

Component examples live in `*.stories.tsx` files next to the component source.
Longer package-level notes live in [`docs`](docs).

## Theme Notes

Ratio UI themes are CSS custom properties. Custom theme authoring is documented
in [`docs/authoring-themes.md`](docs/authoring-themes.md), with the built-in
Bureau theme documented in [`docs/bureau-theme-spec.md`](docs/bureau-theme-spec.md).

If you import `ratio-ui.css` or `global.css`, set `data-theme` on `<html>`
before first paint. The CSS export guide includes a small initialization
example.
