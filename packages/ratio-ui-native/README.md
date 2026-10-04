# @eventuras/ratio-ui-native

Ratio UI for React Native and Expo: the design system's components, drawn
from the theme data in [`@eventuras/ratio-ui-core`](../ratio-ui-core). An app
looks like its web sibling — Bureau's paper and navy, the hard shadows, the
pixel display face — without installing the web renderer.

**Beta.** Built for Expo SDK 57 (React Native 0.86, React 19.2). The
components are `Text`, `Heading`, `Button`, `Card` and `ChatLog`; more
follow as apps need them. Every component and prop may still change.

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

## Fonts

The theme names its families; the app loads the files. For Bureau:

```tsx
import { useFonts } from 'expo-font';

const [loaded] = useFonts({
  'Pixelify Sans': require('./assets/fonts/PixelifySans-Regular.ttf'),
  Archivo: require('./assets/fonts/Archivo-Regular.ttf'),
  'Space Mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
});
```

The keys must match `theme.font` — `'Pixelify Sans'`, `'Archivo'` and
`'Space Mono'`. All three are on Google Fonts under the SIL OFL.

## Shadows

The hard offset shadow is a `boxShadow` style, which React Native has had
since 0.76 on the New Architecture (Expo's default). It renders the same on
iOS, Android and the web.

## Development

The components are shown through react-native-web in the repo's
Storybook, under **Native**. That covers layout, colour, type and press
behaviour; fonts and shadows should still be checked on a device.

Like `ratio-ui-core`, the package has a rule in eslint and in the build:
it imports React Native and `@eventuras/ratio-ui-core`, never `react-dom`,
`react-native-web` or a web package of the family.
