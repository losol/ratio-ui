# CSS Exports

ratio-ui provides flexible CSS imports to support different use cases:

## 1. Full Page Styling (`ratio-ui.css`)

Import this for complete page control with global styles:

```typescript
import '@eventuras/ratio-ui/ratio-ui.css';
```

**Includes:**
- Design tokens (colors, spacing, typography, borders)
- Global page layout (html, body, main)
- Typography styles (h1-h6, p, blockquote)  
- Component styles
- Utility classes

**Use when:**
- Building a new app from scratch
- You want ratio-ui to control the entire page design
- You're okay with global body and typography styles

## 2. Component-Only Styling (`components.css`)

Import this to use ratio-ui components without global page takeover:

```typescript
import '@eventuras/ratio-ui/components.css';
```

**Includes:**
- Design tokens (colors, spacing, typography, borders)
- Component styles
- Utility classes

**Excludes:**
- Global html/body styling
- Global typography (h1-h6, p, blockquote)

**Use when:**
- Integrating ratio-ui into an existing app with its own design system
- You only want to use specific components
- You want to control your own global styles

## 3. Global Page Styles Only (`global.css`)

Import this if you want only the page-level styles:

```typescript
import '@eventuras/ratio-ui/global.css';
```

**Includes:**
- Global html/body styling (light theme by default)
- Main layout styling
- Opt-in flash guard for JS-resolved themes

**Use when:**
- You want the page structure but will use custom components
- Building a custom design system on top of ratio-ui foundations

## Theming and the flash guard

The light theme is defined on bare `:root`, so **importing the CSS is enough to
get a fully styled, visible page** — the default palette is light and needs no
`data-theme`. Set `data-theme` when you want a different palette (`dark`,
`bureau`, …); it can even be set late without the page ever going blank.

### Avoiding a flash of the default theme

If you resolve the palette in JS (localStorage / system preference) and apply it
*after* first paint, the page paints light first and then flips — a flash. Two
ways to avoid it:

**1. Set the theme before first paint (recommended).** A blocking inline script
in `<head>` makes the very first paint correct, with no flash and no hidden
page. Set both attributes when you use the light/dark axis, otherwise the page
can still paint light and then flip when `data-color-scheme` lands:

```html
<script>
  // Resolve from storage / system preference, then set the attributes before
  // the page paints.
  //   data-theme        = palette (e.g. "light", "dark", "bureau")
  //   data-color-scheme = light | dark (the mode; the standard theme also
  //                       accepts "dark" as a data-theme value)
  const el = document.documentElement;
  el.setAttribute('data-theme', resolvedTheme);
  if (resolvedScheme) el.setAttribute('data-color-scheme', resolvedScheme);
</script>
```

**2. Opt into the flash guard.** If you can't set the theme before paint, add
`data-theme-loading` to `<html>` in your static markup and set the theme once
resolved:

```css
/* shipped in global.css */
html[data-theme-loading]:not([data-theme]):not([data-color-scheme]) { opacity: 0; }
```

The page is hidden only while the flag is present **and** neither theme axis is
set — `data-theme` (palette, and the standard theme's mode) or
`data-color-scheme` (the orthogonal light/dark axis) — so setting either reveals
it even if the flag stays. Apps that never set the flag are never hidden — the
blank-white-page footgun is gone.

**Migration from ≤ 2.x:** the page used to be hidden by default
(`html { opacity: 0 }`) until `data-theme` was set. If you relied on that to
mask a JS-resolved theme, add `data-theme-loading` to keep the same behavior.
If you already set `data-theme` in a blocking `<head>` script, nothing changes.

> **Building your own palette?** See
> [authoring-themes.md](./authoring-themes.md) for the token
> contract and a copy-paste template ([`tokens/theme-template.css`](../src/tokens/theme-template.css)).

## Migration Example

If you're currently using `ratio-ui.css` but want to avoid global styles:

```diff
- import '@eventuras/ratio-ui/ratio-ui.css';
+ import '@eventuras/ratio-ui/components.css';
```

Then add your own global styles as needed in your app.

## Modular Approach

You can also combine imports for maximum control:

```typescript
// Use tokens + your own layout
import '@eventuras/ratio-ui/components.css';

// Or build completely custom by importing individual token files
// (advanced - requires direct file system access to node_modules)
```
