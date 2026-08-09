// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// No 'use client' here, and that is the point. `Navbar.tsx` is a client
// module, so a server component importing it receives client *references* for
// its exports. Attaching the compound statics inside that module (the shape
// this had until 2.17) meant `Navbar.Brand` was a property lookup on a
// reference — which yields `undefined`, and React then throws
// "Element type is invalid: … got: undefined" at request time. Attaching them
// here instead, onto a plain local function, keeps every static a valid
// element type on both sides of the boundary.
//
// The statics must NOT be assigned onto `NavbarRoot` itself: when a bundler
// represents a client module as a whole-module proxy rather than per-export
// references, React rejects the write outright with "Cannot assign to a client
// module from a server module."

import type { ReactElement } from 'react';

import {
  NavbarActions,
  NavbarBrand,
  NavbarCollapse,
  NavbarContent,
  NavbarLink,
  NavbarLinks,
  NavbarRoot,
  NavbarRow,
  NavbarSearch,
  NavbarSpacer,
  NavbarToggle,
  type NavbarProps,
} from './Navbar';

/**
 * Server-safe carrier for the compound statics — a plain function this module
 * owns, so `Object.assign` below never touches a client reference. It renders
 * the real (client) root and forwards everything untouched.
 */
function NavbarShell(props: Readonly<NavbarProps>): ReactElement {
  return <NavbarRoot {...props} />;
}
NavbarShell.displayName = 'Navbar';

/**
 * Navbar — the app/site header, composed from parts:
 *
 * ```tsx
 * <Navbar sticky elevated fluid>
 *   <Navbar.Brand>…logo…</Navbar.Brand>
 *   <Navbar.Search><SearchField size="sm" … /></Navbar.Search>
 *   <Navbar.Links>
 *     <Navbar.Link href="/" isCurrent>Dashboard</Navbar.Link>
 *     <Navbar.Link href="/resources">Resources</Navbar.Link>
 *   </Navbar.Links>
 *   <Navbar.Spacer />
 *   <Navbar.Actions>…bell, user menu…</Navbar.Actions>
 * </Navbar>
 * ```
 *
 * Every part stays a client component, exactly as before. `Navbar.Row` and
 * `Navbar.Collapse` are detected by identity inside the root
 * (`c.type === NavbarRow`), which only holds while they live on the same side
 * of the RSC boundary as the root — so moving the presentational parts to
 * server modules would silently break row layout and collapse placement.
 */
export const Navbar = Object.assign(NavbarShell, {
  Row: NavbarRow,
  Toggle: NavbarToggle,
  Collapse: NavbarCollapse,
  Brand: NavbarBrand,
  Content: NavbarContent,
  Search: NavbarSearch,
  Links: NavbarLinks,
  Link: NavbarLink,
  Actions: NavbarActions,
  Spacer: NavbarSpacer,
});

export type {
  NavbarProps,
  NavbarBrandProps,
  NavbarContentProps,
  NavbarRowProps,
  NavbarRowVariant,
  NavbarSearchProps,
  NavbarLinksProps,
  NavbarLinkProps,
  NavbarActionsProps,
  NavbarToggleProps,
  NavbarCollapseProps,
} from './Navbar';

/**
 * The parts are exported individually as well, for consumers who prefer plain
 * imports over dotted access — `Navbar.Brand` and `NavbarBrand` are the same
 * component.
 */
export {
  NavbarActions,
  NavbarBrand,
  NavbarCollapse,
  NavbarContent,
  NavbarLink,
  NavbarLinks,
  NavbarRow,
  NavbarSearch,
  NavbarSpacer,
  NavbarToggle,
} from './Navbar';
