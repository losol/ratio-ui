# Celebrating an earned badge

`AchievementBadge` accepts `celebrate?: boolean` (default `false`). Opt in
when the app presents a newly earned badge:

```tsx
import { AchievementBadge } from '@eventuras/ratio-ui/badges';

<AchievementBadge
  achievement={achievement}
  credential={newAward}
  display={{ shape: 'rosette', tier: 'gold', symbol: '×' }}
  celebrate={showNewAward}
/>
```

An earned badge plays one confetti burst from the medallion when `celebrate`
becomes true, including on mount. A locked or in-progress badge waits until it
becomes earned. The colours use `display.tier` (`bronze`, `silver`, `gold`),
or the theme at the medallion when there is no tier. This works with `tile`,
`row` and `art` layouts.

Ordinary rerenders, updated presentation and recreated achievement or credential
objects do not replay the burst. The trigger belongs to the mounted component,
not a credential ID. Set `celebrate` false to stop and rearm it; leaving the
earned state also stops and rearms it. Remounting is a new opt-in. Keep the app's
new-award state across navigation, or clear it after presenting the award, so a
historical credential does not celebrate every visit.

Playback uses the existing `useFx`/`play` lifecycle. Disabling celebration,
leaving earned state or unmounting stops playback; otherwise the burst ends
itself. Reduced motion allows only a brief still ring, with no particles,
flash or shake. An ancestor with `data-motion="none"` suppresses all decoration.
The overlay is hidden from assistive technology and ignores pointer input.
The app should announce the earned event in its own live region; the badge's
effect adds no announcement.

`AchievementBadgeArt` remains a server-compatible, static SVG for baking or
exporting credentials; it has no celebration API. See the **Celebrate** story
under **Badges / AchievementBadge** for an interactive earned/reset example.
