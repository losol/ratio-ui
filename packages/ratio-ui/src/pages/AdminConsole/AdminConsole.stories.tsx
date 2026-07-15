// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * Full-page admin-console demo — a composition exercise, not a component.
 * Everything on the page is existing ratio-ui: NavTree (sidebar), ValueTile
 * (stats), Badge (status), Console (operations log). The subject is the
 * Library of Alexandria: the numbers and names below are the real history —
 * Zenodotus (first librarian), Eratosthenes (measured the Earth while chief
 * librarian), and scroll counts from ancient estimates.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../core/Badge';
import { Heading } from '../../core/Heading';
import { ValueTile } from '../../core/ValueTile';
import { NavTree } from '../../core/NavTree';
import { Console } from '../../console';
import {
  Database,
  LayoutGrid,
  ScrollText,
  ShieldCheck,
  Telescope,
  Upload,
} from '../../icons';

const meta: Meta = {
  title: 'Pages/Admin Console',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

const ICON = 18;

const nav = (
  <NavTree
    aria-label="Archive console"
    currentPath="#/"
    groups={[
      {
        label: 'Collections',
        items: [
          { title: 'Dashboard', href: '#/', icon: <LayoutGrid size={ICON} /> },
          { title: 'Manuscripts', href: '#/manuscripts', icon: <ScrollText size={ICON} /> },
          { title: 'Instruments', href: '#/instruments', icon: <Telescope size={ICON} /> },
        ],
      },
      {
        label: 'Administration',
        items: [
          { title: 'Catalogue', href: '#/catalogue', icon: <Database size={ICON} /> },
          { title: 'Imports', href: '#/imports', icon: <Upload size={ICON} /> },
          { title: 'Audit log', href: '#/audit', icon: <ShieldCheck size={ICON} /> },
        ],
      },
    ]}
  />
);

const opsLog = (
  <Console aria-label="Operations log">
    <Console.TitleBar>
      <Console.Title>Operations log</Console.Title>
      <Console.LiveIndicator status="live">Live</Console.LiveIndicator>
      <Console.Counter>6 events</Console.Counter>
    </Console.TitleBar>
    <Console.Body>
      <Console.Entry
        timestamp={<Console.Time hhmmss="09:12:04" />}
        level="info"
        source="acquisitions"
        message={
          <>
            Ship docked — scrolls seized for copying under the{' '}
            <code>books-of-the-ships</code> decree
          </>
        }
        meta="Zenodotus"
      />
      <Console.Entry
        timestamp={<Console.Time hhmmss="09:14:31" />}
        level="success"
        source="catalogue"
        message={
          <>
            Registered <b>Elements</b>, Euclid — 13 volumes
          </>
        }
        meta="Zenodotus"
      />
      <Console.Entry
        timestamp={<Console.Time hhmmss="10:02:17" />}
        level="success"
        source="catalogue"
        message={
          <>
            Registered <b>Measurement of the Earth</b> — circumference ≈ 252,000
            stadia
          </>
        }
        meta="Eratosthenes"
      />
      <Console.Entry
        timestamp={<Console.Time hhmmss="10:40:59" />}
        level="warning"
        source="imports"
        message={
          <>
            Duplicate of Aristotle&apos;s <b>Physics</b> skipped — copy already in
            the Serapeum annex
          </>
        }
        meta="system"
      />
      <Console.Entry
        timestamp={<Console.Time hhmmss="11:05:44" />}
        level="info"
        source="lectures"
        message={
          <>
            Lecture hall booked: <b>On the sizes and distances of the Sun and
            Moon</b>
          </>
        }
        meta="Aristarchus"
      />
      <Console.Entry
        timestamp={<Console.Time hhmmss="11:31:08" />}
        level="success"
        source="catalogue"
        message={<>Index rebuilt — 120 scroll-cases of the <b>Pinakes</b> in sync</>}
        meta="Callimachus"
      />
    </Console.Body>
  </Console>
);

/**
 * The whole shell: sticky sidebar, stats, live operations log. Useful while
 * developing admin surfaces — every part is an existing component.
 */
export const AlexandriaArchive: Story = {
  render: () => (
    <div className="flex min-h-screen items-start">
      <aside className="sticky top-0 h-screen w-59 shrink-0 overflow-y-auto border-r border-border-1 px-3 py-5">
        <div className="mb-6 flex items-center gap-2.5 px-3">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-(--primary) font-serif text-lg font-bold text-(--text-on-primary)"
          >
            A
          </span>
          <span className="font-serif text-xl font-bold tracking-tight">
            Alexandria
          </span>
        </div>
        {nav}
      </aside>

      <main className="mx-auto max-w-275 flex-1 px-10 pb-20 pt-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-(--text-subtle)">The Great Library · est. c. 285 BCE</p>
            <Heading as="h1" className="mt-1">
              Archive dashboard
            </Heading>
          </div>
          <Badge status="success" variant="subtle">
            Catalogue in sync
          </Badge>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <ValueTile number="~400,000" label="Scrolls at the library's height" />
          <ValueTile number={13} label="Volumes in Euclid's Elements" />
          <ValueTile number="120" label="Scroll-cases in the Pinakes catalogue" />
          <ValueTile number="252,000" label="Earth's circumference, in stadia" />
        </div>

        <div className="mt-10">{opsLog}</div>
      </main>
    </div>
  ),
};
