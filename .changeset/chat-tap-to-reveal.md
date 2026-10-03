---
'@eventuras/ratio-ui': minor
---

`Chat.Log`: a tap can open a message's bar, so touch reaches it at all.

The bar over a message shows on hover and on keyboard focus. A phone has neither, so its
quick reactions, the picker and "Copy link" were unreachable there — verified on an
emulated iPhone, where tapping a message changed nothing.

- New `activeId`: the message whose bar is open.
- New `onActivate`: called with the message a tap landed on, or `undefined` when the tap
  closed it or missed. Both are controlled, as `highlightedId` is — the log keeps no state
  of its own, so the caller decides what is open.
- Without `onActivate` the log does not listen for taps at all, so nothing changes for
  callers that don't want it.
- Taps that land on a link or a button pass through untouched, so the text's own URLs and
  the time's permalink still work, and the bar's own buttons stay pressable. A gesture
  that drifts more than 10px is a scroll, not a tap. Driven by `pointerType`, not a media
  query, so a touch on a hybrid laptop behaves like one on a phone.
- The open row carries `data-active`.
