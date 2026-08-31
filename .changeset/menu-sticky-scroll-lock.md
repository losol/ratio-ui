---
"@eventuras/ratio-ui": patch
---

`Menu` no longer drags the sticky header out of the viewport. Its popover was
modal, and React Aria locks scrolling for modal overlays by setting
`overflow: hidden` on the root element — which propagates to the viewport, so
`position: sticky` has no scrollport left to stick within. Opening an account
menu on a scrolled page therefore dropped the navbar and any sticky section
nav to their static position at the top of the document, taking the open menu
with them: measured at 1280×800 scrolled 700px, the navbar went from `top: 0`
to `top: -700`.

The popover is now non-modal, so nothing touches the root element and a menu
no longer freezes the page it sits on. React Aria ties outside-press dismissal
to the same switch (`isDismissable: !isNonModal`), so `Menu` handles that
itself, including the press that closes it from its own trigger. Escape,
blur, choosing an item and scrolling away all still close it, and the public
API is unchanged.

`Core/Navbar → Sticky Glass` shows a menu in a pinned bar, the case this
fixes. It is verified by hand rather than by a play test: driving the popover
from Storybook's test runner races with its own rendering, so the check lives
in the pull request instead.
