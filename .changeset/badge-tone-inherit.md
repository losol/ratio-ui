---
"@eventuras/ratio-ui": minor
---

`Badge` takes `tone="inherit"` (beta): the host's text colour on a
translucent tint of it. Compose a count inside a button, tab or link and it
matches its host in every variant and theme. In a `Button`, wrap the text in
`Button.Label` so the badge is spaced like the icon:

```tsx
<Button icon={<ShoppingCart />}>
  <Button.Label>Checkout</Button.Label>
  <Badge variant="count" tone="inherit">3</Badge>
</Button>
```
