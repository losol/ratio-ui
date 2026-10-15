---
"@eventuras/ratio-ui": minor
---

`Patchbay` cables can be moved by their plug, as on a rack. Drag from an input that has a cable and the plug comes out: drop it on another port and the cable runs there, drop it in the air and it is pulled out, drop it back and nothing changes. A drag from an output still starts a new cable; hold Alt for the other one (Alt-drag an output to lift its last cable, an occupied input to start a new one). Escape puts a lifted plug back. A move is one change, `type: 'move'`, with the cable as it is now in `connection` and as it was in `previous`, so an app rewires in one step; `canConnect` is asked about the new pair without the old cable, and a refused drop leaves the cable where it was. The new `moved` label is what a screen reader hears.

Two layout choices:

- `sag` on `Patchbay`: `down` (default) hangs a `cable` below its ports, `up` arches it over them, off labels under the sockets or for ports at a panel's lower edge.
- `labelPosition` on `Patchbay.Port`: `below` (default) or `above` the socket.

`PatchbayChange['type']` gains `'move'`; code that switches over it exhaustively needs the new case.
