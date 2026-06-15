import storybook from 'eslint-plugin-storybook';
import { config as reactLibraryConfig } from '@ratio-ui/eslint-config/react-library';

/** @type {import("eslint").Linter.Config[]} */
export default [...reactLibraryConfig, ...storybook.configs['flat/recommended']];
