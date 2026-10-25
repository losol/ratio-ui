// Stands in for react-native-svg's `fabric/NativeSvg*Module` files, each a
// `TurboModuleRegistry.getEnforcing(...)` that react-native-web cannot
// provide. Its web build only reaches them through lazy `require()`s on
// paths no story takes (touch sound, native bounding boxes), so an empty
// module keeps the bundler happy and nothing calls it.
export default {};
