// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Directive-free on purpose — see the note in `core/Navbar/index.tsx`. The
// statics are attached here, onto a plain local function, so `Tabs.Item`
// resolves to a real element type when a server component reaches for it.

import type { ReactElement } from 'react';

import { TabItem, TabsRoot, type TabsComponent, type TabsProps } from './Tabs';

function TabsShell(props: Readonly<TabsProps>): ReactElement {
  return <TabsRoot {...props} />;
}
TabsShell.displayName = 'Tabs';

export const Tabs: TabsComponent = Object.assign(TabsShell, { Item: TabItem });

export type { TabsProps, TabItemProps, TabsComponent } from './Tabs';

/** Same component as `Tabs.Item`, for consumers who prefer a plain import. */
export { TabItem } from './Tabs';
