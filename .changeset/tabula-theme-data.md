---
'@eventuras/ratio-ui-core': minor
---

`@eventuras/ratio-ui-core/themes/tabula`: Tabula as theme data, beside Bureau. The printed sheet for a renderer without CSS: white sheets in petrol frames on a sand page, every radius 0, no shadow on cards and the soft one on buttons only (none when pressed, no press offset or growth), the 10px primary frame of a featured card, Fira Sans Condensed for display and Fira Sans for body, the petrol primary scale, and the standard theme's accent, status families and chat colours written out as the CSS cascades them. `themes/tabula.test.ts` holds the data to `ratio-ui/src/themes/tabula.css`. Pass it to `RatioProvider` in `@eventuras/ratio-ui-native` as `theme={tabula}`.
