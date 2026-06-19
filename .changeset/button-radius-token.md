---
"@eventuras/ratio-ui": minor
---

Make Button corner radius themeable via a `--button-radius` token (default `9999px`, the existing pill shape — no visual change to the standard theme). Mirrors the existing `--chip-radius` knob, so named themes can reshape buttons through tokens instead of overriding hardcoded utilities. The bureau theme uses it to square its buttons.
