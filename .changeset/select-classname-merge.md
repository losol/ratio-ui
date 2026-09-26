---
"@eventuras/ratio-ui": patch
---

`Select`'s `className` is now merged on top of the default wrapper classes
instead of replacing them, so adding e.g. a width no longer drops the
label-above-trigger layout. A conflicting class still wins (`w-48` over the
default `w-full`).
