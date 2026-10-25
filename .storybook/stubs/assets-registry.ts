// Stands in for `@react-native/assets-registry/registry`, which react-native-web
// does not ship: react-native-svg's web build asks it for bundled image assets,
// and the stories bundle none.
export const getAssetByID = (): undefined => undefined;
