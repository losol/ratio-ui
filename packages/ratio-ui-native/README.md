# @eventuras/ratio-ui-native

Ratio UI for React Native and Expo: the design system's components, drawn
from the theme data in [`@eventuras/ratio-ui-core`](../ratio-ui-core). An app
looks like its web sibling — Bureau's paper and navy, the hard shadows, the
pixel display face — without installing the web renderer.

**Beta.** Built for Expo SDK 57 (React Native 0.86, React 19.2). The
components are `Text`, `Heading`, `Button`, `Card`, `ChatLog` and, on its
own subpath, `AchievementBadge`; more follow as apps need them. Every component and prop may still change.

## Installation

```bash
npx expo install @eventuras/ratio-ui-native
```

`react` and `react-native` are peer dependencies. `@eventuras/ratio-ui-core`
comes with the package.

## Usage

```tsx
import { RatioProvider, Heading, Text, Button, Card } from '@eventuras/ratio-ui-native';

export default function App() {
  return (
    <RatioProvider>
      <Card>
        <Heading level={3}>Knowledge-sharing summit</Heading>
        <Text tone="muted">Three days of talks and workshops.</Text>
        <Button onPress={register}>Register</Button>
      </Card>
    </RatioProvider>
  );
}
```

`RatioProvider` takes a `theme` (Bureau by default) and a `colorScheme`
(the device's light or dark setting by default). Without a provider the
components use Bureau in the device's mode. `useTheme()` gives a component
of your own the same values: `colors`, `radius`, `space`, `fontSize`,
`font`, `components`, and `shadow(key)` as a `boxShadow` string.

## Chat

`ChatLog` takes the same `ChatLogMessage[]` as the web's `Chat.Log`, and
reads links and mentions with the same rules from
`@eventuras/ratio-ui-core/chat`, so a message looks alike in the app and on
the web:

```tsx
<ChatLog
  messages={messages}
  me="tor"
  onToggleReaction={(id, emoji) => toggle(id, emoji)}
  onOpenLink={url => router.push(url)} // default: Linking.openURL
/>
```

Each row puts the nick and time above the text, as a narrow web log does,
with a mention band, link previews and reactions. It is a `FlatList` and
does not scroll itself; the ref is the list, so the app decides when to
follow new messages. Not yet in native: the reaction picker, a highlighted
message and message links.

## Badges

`@eventuras/ratio-ui-native/badges` draws an Open Badges achievement as a
medallion — the web's `AchievementBadge`, from the same data and the same
outline geometry in `@eventuras/ratio-ui-core/badges`, so a rosette in the
app is the rosette on the site. It needs `react-native-svg`, which is why
it is its own subpath: an app without badges installs nothing for them.

```bash
npx expo install react-native-svg
```

```tsx
import { AchievementBadge, defineAchievement } from '@eventuras/ratio-ui-native/badges';

const timesTables = defineAchievement({
  id: 'https://school.example/achievements/times-tables',
  name: 'Times Tables Master',
  description: 'Knows the times tables from 1 to 10.',
  criteria: { narrative: 'Every product from 1 × 1 to 10 × 10 right, twice in a row.' },
});

<AchievementBadge
  achievement={timesTables}
  display={{ shape: 'rosette', tier: 'gold', symbol: '×' }}
  credential={award}            // the OpenBadgeCredential; without it the badge is locked
  layout="row"                  // or 'tile' (default), 'art'
  formatDate={iso => new Date(iso).toLocaleDateString()}
/>
```

The ink is the theme's primary and the paper its card; the metals are the
same in every theme. An `emblem` is a 24-unit glyph as react-native-svg
elements, as `lucide-react-native` gives. `AchievementBadgeArt` is the
medallion alone.

## Fonts

The theme names its families; the app loads the files. For Bureau:

```tsx
import { useFonts } from 'expo-font';

const [loaded] = useFonts({
  'Fira Sans': require('./assets/fonts/FiraSans-Regular.ttf'),
  'Space Mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
});
```

The keys must match `theme.font` — `'Fira Sans'` (display and body) and
`'Space Mono'`. Both are on Google Fonts under the SIL OFL.

## Shadows

A component's shadow is a `boxShadow` style — every layer of it, with its
spread — which React Native has had since 0.76 on the New Architecture
(Expo's default). It renders the same on iOS, Android and the web.
`useTheme().shadow(layers)` writes one from the theme's component tokens.

## Development

The components are shown through react-native-web in the repo's
Storybook, under **Native**. That covers layout, colour, type and press
behaviour; fonts and shadows should still be checked on a device.

Like `ratio-ui-core`, the package has a rule in eslint and in the build:
it imports React Native and `@eventuras/ratio-ui-core`, never `react-dom`,
`react-native-web` or a web package of the family.
