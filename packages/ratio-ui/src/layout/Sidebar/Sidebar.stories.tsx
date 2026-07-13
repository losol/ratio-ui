// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './Sidebar';
import { Drawer } from '../Drawer';
import { ActionButton } from '../../core/ActionButton';
import { LiveIndicator } from '../../core/LiveIndicator';
import { NavTree } from '../../core/NavTree';
import {
  ChevronsLeft,
  ChevronsRight,
  Database,
  FlaskConical,
  LayoutGrid,
  MenuIcon,
  ScrollText,
  ShieldCheck,
  Telescope,
  Upload,
} from '../../icons';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const ICON = 18;

// One nav, used by both the desktop sidebar and the mobile drawer — the
// console of the Library of Alexandria, plus the fields its scholars shaped.
const archiveNav = (iconOnly = false) => (
  <NavTree
    aria-label="Archive console"
    currentPath="/manuscripts"
    iconOnly={iconOnly}
    groups={[
      {
        label: 'Collections',
        items: [
          { title: 'Dashboard', href: '/', icon: <LayoutGrid size={ICON} /> },
          { title: 'Manuscripts', href: '/manuscripts', icon: <ScrollText size={ICON} /> },
          { title: 'Instruments', href: '/instruments', icon: <Telescope size={ICON} /> },
        ],
      },
      {
        label: 'Fields of study',
        items: [
          {
            title: 'Astronomy',
            icon: <Telescope size={ICON} />,
            children: [
              { title: 'Hypatia', href: '/astronomy/hypatia' },
              { title: 'Aristarchus', href: '/astronomy/aristarchus' },
              { title: 'Eratosthenes', href: '/astronomy/eratosthenes' },
            ],
          },
          {
            title: 'Mathematics',
            icon: <FlaskConical size={ICON} />,
            children: [
              { title: 'Euclid', href: '/mathematics/euclid' },
              { title: 'Diophantus', href: '/mathematics/diophantus' },
            ],
          },
        ],
      },
      {
        label: 'Administration',
        items: [
          { title: 'Catalogue', href: '/catalogue', icon: <Database size={ICON} /> },
          { title: 'Imports', href: '/imports', icon: <Upload size={ICON} /> },
          { title: 'Audit log', href: '/audit', icon: <ShieldCheck size={ICON} /> },
        ],
      },
    ]}
  />
);

const mark = (
  <span
    aria-hidden
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--primary) font-serif text-base font-bold text-(--text-on-primary)"
  >
    A
  </span>
);

const wordmark = (collapsed = false) => (
  <div className={collapsed ? 'flex justify-center' : 'flex items-center gap-2.5 px-3'}>
    {mark}
    {!collapsed && <span className="font-serif text-lg font-bold tracking-tight">Alexandria</span>}
  </div>
);

/**
 * The full shell chrome: pinned `Sidebar.Header` (wordmark), scrolling
 * `Sidebar.Body` (a NavTree — expand "Fields of study" to make it scroll),
 * and a pinned `Sidebar.Footer` behind a hairline. The footer button
 * collapses the sidebar to an icon rail: `collapsed` on the Sidebar +
 * `iconOnly` on the NavTree, one state — hover the rail icons for their
 * names. Capped at 480px so the pinned parts are visible immediately.
 */
export const AdminSidebar: Story = {
  args: { children: null },
  render: function AdminSidebarStory() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div className="flex h-[480px] items-start overflow-hidden">
        <Sidebar aria-label="Archive console" top={0} collapsed={collapsed} className="h-full!">
          <Sidebar.Header>{wordmark(collapsed)}</Sidebar.Header>
          <Sidebar.Body className={collapsed ? 'px-2' : undefined}>
            {archiveNav(collapsed)}
          </Sidebar.Body>
          <Sidebar.Footer>
            <div
              className={
                collapsed ? 'flex justify-center' : 'flex items-center justify-between px-3 py-1'
              }
            >
              {!collapsed && <LiveIndicator status="live">Catalogue in sync</LiveIndicator>}
              <ActionButton
                ariaLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
              </ActionButton>
            </div>
          </Sidebar.Footer>
        </Sidebar>
        <main className="flex-1 p-8 text-sm text-(--text-muted)">
          The sidebar keeps its header and footer pinned while the navigation
          scrolls between them. Collapse it to get the icon rail.
        </main>
      </div>
    );
  },
};

/**
 * The Ignis-style console shell: a sticky app topbar whose burger toggles
 * the sidebar between wide and icon rail — one `collapsed` state drives
 * `Sidebar` and the NavTree's `iconOnly` together. (In a real app with a
 * page-level sticky header, pass `top={headerHeight}` instead of the demo's
 * flex shell.)
 */
export const ConsoleShell: Story = {
  args: { children: null },
  render: function ConsoleShellStory() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div className="flex h-[520px] flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-1 px-3">
          <ActionButton
            ariaLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            <MenuIcon size={18} />
          </ActionButton>
          {wordmark()}
          <div className="flex-1" />
          <LiveIndicator status="live">Catalogue in sync</LiveIndicator>
        </header>
        <div className="flex min-h-0 flex-1 items-start">
          <Sidebar aria-label="Archive console" collapsed={collapsed} className="h-full!">
            <Sidebar.Body className={collapsed ? 'px-2' : undefined}>
              {archiveNav(collapsed)}
            </Sidebar.Body>
          </Sidebar>
          <main className="h-full flex-1 overflow-y-auto p-8">
            <h1 className="font-serif text-2xl font-bold">Archive dashboard</h1>
            <p className="mt-2 max-w-[52ch] text-sm text-(--text-muted)">
              Toggle the burger in the topbar: the sidebar animates between the
              wide navigation and a 64px icon rail — the same NavTree, with
              icon tooltips carrying the labels. The Library of Alexandria
              would have approved of saving space; the Pinakes squeezed the
              whole collection into 120 scroll-cases.
            </p>
          </main>
        </div>
      </div>
    );
  },
};

/**
 * The small-screen pairing: hide the sidebar (`hidden lg:flex`) and reuse
 * the exact same nav inside a `Drawer`, opened from a burger button. The
 * drawer is plain composition — no extra API needed.
 */
export const MobileDrawer: Story = {
  args: { children: null },
  render: function MobileDrawerStory() {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-6">
        <ActionButton ariaLabel="Open menu" onClick={() => setOpen(true)}>
          <MenuIcon size={18} />
        </ActionButton>
        <Drawer isOpen={open} onClose={() => setOpen(false)}>
          <Drawer.Header as="h2">Alexandria</Drawer.Header>
          <Drawer.Body>{archiveNav()}</Drawer.Body>
        </Drawer>
      </div>
    );
  },
};
