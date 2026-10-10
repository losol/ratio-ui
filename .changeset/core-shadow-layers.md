---
'@eventuras/ratio-ui-core': minor
'@eventuras/ratio-ui-native': minor
---

ratio-ui-core: shadows belong to the components, in layers. A `Shadow` is one layer and takes an optional `spread`; a component's shadow is `ShadowLayers` (one or more layers) or `null`, its colours references where the CSS has them. So a theme can say what the standard theme's soft, multi-layer shadows are, not only Bureau's hard one. `ThemeMode` holds colours only: `shadowHard`, `shadowHardLg`, `shadowHardXl` and `ShadowKey` are gone, and Bureau writes its hard shadow straight into its components. `components.button` takes `pressedScale` (the standard button grows on press; Bureau's is 1). `resolveTheme()` gives `components` per mode (`components.light`, `components.dark`), each shadow inked in it. `toCssValue` writes layers, a spread and `null`.

ratio-ui-native: `useTheme()` gives the component tokens of the mode in use, and `shadow(layers)` writes every layer, with its spread. `Button` scales by `pressedScale` while pressed.
