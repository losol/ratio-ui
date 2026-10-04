import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  // React Native is the app's, like React; core is a dependency, not bundled.
  external: ['react-native', /^react-native\//, /^@eventuras\/ratio-ui-core/],
  preserveUseClientDirectives: false,
});
