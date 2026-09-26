---
"@eventuras/ratio-ui": minor
---

Built-in text moves out of the components. Each component that ships text
takes an optional `labels` object (with an exported `…Labels` type) whose
entries fall back to English; a component's own accessible name is the native
`aria-label`.

- `labels`: `Loading` (with a new `showLabel`), `TableOfContents` (its
  visible title, which now names the `<nav>` via `aria-labelledby`), `Lookup`,
  `ToastRenderer`, `PhoneInput` (including the length error, as a function),
  `Tree`, `ThreeColumnLayout`, `CartLineItem` and `OrderSummary`.
- `aria-label` with an English default: `Stepper`, `Schedule`, `Pagination`.
  `Pagination`'s `labels.navigation` is deprecated in favour of `aria-label`.

**Visible change:** `CartLineItem` and `OrderSummary` shipped Norwegian text
("Fjern", "Antall", "inkl. mva", "Ordresammendrag", "Subtotal (eks. mva)",
"MVA"). They now default to English. To keep Norwegian:

```tsx
<CartLineItem
  labels={{
    vatAmount: (vat) => `inkl. mva ${vat}`,
    totalIncludesVat: 'inkl. mva',
    quantity: 'Antall',
    decreaseQuantity: 'Reduser antall',
    increaseQuantity: 'Øk antall',
    remove: 'Fjern',
  }}
/>
<OrderSummary
  title="Ordresammendrag"
  labels={{ subtotalExVat: 'Subtotal (eks. mva)', vat: 'MVA', total: 'Total' }}
/>
```
