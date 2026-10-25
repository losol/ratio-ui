import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

// One entry per public subpath: `.` and `./badges`.
export default defineReactLibConfig({
  entry: {
    index: 'src/index.ts',
    'badges/index': 'src/badges/index.ts',
  },
  // React Native and react-native-svg are the app's, like React; core is a
  // dependency, not bundled.
  external: ['react-native', /^react-native\//, 'react-native-svg', /^@eventuras\/ratio-ui-core/],
  preserveUseClientDirectives: false,
});
