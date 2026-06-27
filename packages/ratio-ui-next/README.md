# @eventuras/ratio-ui-next

Next.js-specific wrappers for Ratio UI. Use this package alongside
`@eventuras/ratio-ui` when an app needs components that integrate with Next.js
routing or image optimization.

## Installation

```bash
pnpm add @eventuras/ratio-ui @eventuras/ratio-ui-next
```

Install the peer dependencies expected by the package:

```bash
pnpm add next react react-dom
```

## Usage

Import Ratio UI styles from the core package in your app root:

```tsx
import '@eventuras/ratio-ui/ratio-ui.css';
```

Then import the Next.js wrappers by subpath:

```tsx
import { Image } from '@eventuras/ratio-ui-next/Image';
import { Link } from '@eventuras/ratio-ui-next/Link';

export function Example() {
  return (
    <>
      <Image src="/photo.jpg" alt="Description" width={800} height={600} />
      <Link href="/about">About us</Link>
    </>
  );
}
```

The package also exports both components from its root entry:

```tsx
import { Image, Link } from '@eventuras/ratio-ui-next';
```

## Local Development

From the repository root:

```bash
pnpm --filter @eventuras/ratio-ui-next build
pnpm --filter @eventuras/ratio-ui-next lint
```

The package build is handled by the shared `@ratio-ui/vite-config` library
preset.
