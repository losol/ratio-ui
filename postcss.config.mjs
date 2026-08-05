// Storybook (React-Vite) processes the design system's `@import "tailwindcss"`
// via PostCSS. The library build itself uses @tailwindcss/vite (see
// @eventuras/vite-config), so this config exists only for the root Storybook.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
