---
"@eventuras/ratio-ui": minor
---

Add `DataTree` — a generic, recursive term/value renderer for nested data (config objects, API payloads, FHIR resources, …). It owns layout, indentation, dividers and optional collapsing; the caller pre-renders every leaf value, so the component stays domain-agnostic. Collapsing uses native `<details>`, so it renders as a server component with no client state. Supports three node shapes (leaf / group / empty em-dash), an `accentRule` ochre rule, `rowDividers`, and container-query stacking. Imported from `@eventuras/ratio-ui/core/DataTree`.
