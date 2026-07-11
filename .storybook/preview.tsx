import type { Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';
import { ModeDecorator } from './modeDecorator';

// The design system's full stylesheet (tokens + Tailwind utilities). Tailwind's
// `@source` globs in global.css are relative to that file, so each package's
// own CSS scans its own `src`. Add a package's CSS entry here if it ships one.
import '../packages/ratio-ui/src/ratio-ui.css';

const preview: Preview = {
  parameters: {
    docs: {
      theme: themes.dark,
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    layout: 'fullscreen', // Use fullscreen layout to show body background
  },
  decorators: [ModeDecorator],
};

export default preview;
