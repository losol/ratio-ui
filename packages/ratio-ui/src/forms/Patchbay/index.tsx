// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// No 'use client' here, on purpose: `Patchbay.tsx` is a client module, so a
// server component sees its exports as client references, and a static
// attached inside it would read as `undefined` across the boundary. The
// statics go onto a plain function this module owns instead — the same
// shape as `core/Navbar/index.tsx`.

import type { ReactElement } from 'react';

import { PatchbayPort, PatchbayRoot, type PatchbayProps } from './Patchbay';

/** Server-safe carrier for the compound statics; renders the client root. */
function PatchbayShell(props: Readonly<PatchbayProps>): ReactElement {
  return <PatchbayRoot {...props} />;
}
PatchbayShell.displayName = 'Patchbay';

/**
 * Patchbay — connect things with cables. See `PatchbayRoot` for the full
 * description; `Patchbay.Port` is a socket.
 */
export const Patchbay = Object.assign(PatchbayShell, { Port: PatchbayPort });

export type {
  PatchbayProps,
  PatchbayPortProps,
  PatchbayConnection,
  PatchbayChange,
  PatchbayConnector,
  PatchbayDirection,
  PatchbayLabels,
  PatchbayPortInfo,
  PatchbaySag,
} from './Patchbay';
