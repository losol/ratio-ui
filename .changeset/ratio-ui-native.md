---
'@eventuras/ratio-ui-native': minor
---

New package: Ratio UI for React Native and Expo (SDK 57, React Native 0.86). The first components draw from `@eventuras/ratio-ui-core`'s theme data:

- `RatioProvider` and `useTheme()`: Bureau by default, in the device's light or dark mode unless `colorScheme` says otherwise. A component works without a provider too.
- `Text` (size, tone, weight, font role) and `Heading` (display font, announced with its level).
- `Button` in five variants (primary, secondary, outline, text, danger) and three sizes, with the theme's radius, resting shadow and press. Bureau moves a pressed button into its hard shadow.
- `Card` with the theme's border, corner and shadow per elevation tier. With `onPress` it becomes one pressable target that lifts while pressed.

The hard shadow is a `boxShadow` style. An eslint rule and a build guard keep the package off `react-dom`, `react-native-web` and the web packages.
