// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { createContext, useContext, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SearchField } from '../../forms/SearchField';
import { Heading } from '../Heading';
import { Link } from '../Link';
import {
  BookOpen,
  Database,
  FlaskConical,
  LayoutGrid,
  ScrollText,
  ShieldCheck,
  Telescope,
  Upload,
  Users,
} from '../../icons';
import { Chip } from '../Chip';
import { NavTree } from './NavTree';

const meta = {
  title: 'Core/NavTree',
  component: NavTree,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof NavTree>;

export default meta;
type Story = StoryObj<typeof meta>;

const ICON = 18;

/**
 * The admin-sidebar form: groups with uppercase eyebrow labels, per-item
 * icons, and composable `trailing` adornments (a count chip, a pulsing live
 * dot) — here the console of the Library of Alexandria, the ancient world's
 * great attempt to collect all knowledge in one place.
 */
export const AdminSidebar: Story = {
  args: {
    'aria-label': 'Alexandria console',
    currentPath: '#/manuscripts',
    groups: [
      {
        label: 'Collections',
        items: [
          { title: 'Dashboard', href: '#/', icon: <LayoutGrid size={ICON} /> },
          {
            title: 'Manuscripts',
            href: '#/manuscripts',
            icon: <ScrollText size={ICON} />,
            trailing: <Chip>400k</Chip>,
          },
          { title: 'Instruments', href: '#/instruments', icon: <Telescope size={ICON} /> },
        ],
      },
      {
        label: 'Administration',
        items: [
          { title: 'Catalogue', href: '#/catalogue', icon: <Database size={ICON} /> },
          {
            title: 'Imports',
            href: '#/imports',
            icon: <Upload size={ICON} />,
            trailing: (
              <Chip>
                <Chip.Dot pulse /> live
              </Chip>
            ),
          },
          { title: 'Audit log', href: '#/audit', icon: <ShieldCheck size={ICON} /> },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 236 }}>
      <NavTree {...args} />
    </div>
  ),
};

/**
 * Nested branches with active-path highlighting: fields of knowledge and the
 * heroes who shaped them. `currentPath` points at Emmy Noether, so her branch
 * auto-expands and her row is tinted. `defaultExpandedDepth={1}` opens all
 * top-level branches for the overview; a single branch can do the same with
 * its own `defaultOpen` (Physics carries it here, belt-and-braces).
 */
export const FieldsOfKnowledge: Story = {
  args: {
    'aria-label': 'Fields of knowledge',
    currentPath: '#/mathematics/noether',
    defaultExpandedDepth: 1,
    groups: [
      {
        label: 'Sciences',
        items: [
          {
            title: 'Physics',
            icon: <FlaskConical size={ICON} />,
            defaultOpen: true,
            children: [
              { title: 'Isaac Newton', href: '#/physics/newton' },
              { title: 'James Clerk Maxwell', href: '#/physics/maxwell' },
              { title: 'Marie Curie', href: '#/physics/curie' },
            ],
          },
          {
            title: 'Mathematics',
            icon: <BookOpen size={ICON} />,
            children: [
              { title: 'Leonhard Euler', href: '#/mathematics/euler' },
              { title: 'Carl Friedrich Gauss', href: '#/mathematics/gauss' },
              { title: 'Emmy Noether', href: '#/mathematics/noether' },
            ],
          },
          {
            title: 'Astronomy',
            icon: <Telescope size={ICON} />,
            children: [
              { title: 'Hypatia', href: '#/astronomy/hypatia' },
              { title: 'Johannes Kepler', href: '#/astronomy/kepler' },
              { title: 'Galileo Galilei', href: '#/astronomy/galileo' },
            ],
          },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 260 }}>
      <NavTree {...args} />
    </div>
  ),
};

/**
 * A branch with its own `href` renders a split row: the label navigates to the
 * overview page while the chevron toggles the children — here Kepler's works,
 * each teaching one step toward the laws of planetary motion.
 */
export const BranchWithOverview: Story = {
  args: {
    'aria-label': "Kepler's works",
    currentPath: '#/kepler/harmonices-mundi',
    items: [
      {
        title: 'Johannes Kepler',
        href: '#/kepler',
        icon: <Telescope size={ICON} />,
        children: [
          { title: 'Mysterium Cosmographicum (1596)', href: '#/kepler/mysterium' },
          { title: 'Astronomia Nova (1609)', href: '#/kepler/astronomia-nova' },
          { title: 'Harmonices Mundi (1619)', href: '#/kepler/harmonices-mundi' },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <NavTree {...args} />
    </div>
  ),
};

/**
 * Rows without an `href` have nothing to navigate to, so they are not links:
 * a branch is a collapse toggle, and a leaf is plain text — a grouping that
 * only holds its children, a section heading, an empty state. Documentation
 * trees produce these on their own, wherever a folder groups pages without
 * being a page itself.
 */
export const RowsWithoutDestination: Story = {
  args: {
    'aria-label': 'Alexandria catalogue',
    currentPath: '#/catalogue',
    items: [
      { title: 'Catalogue', href: '#/catalogue', icon: <Database size={ICON} /> },
      {
        // No href: the row toggles rather than navigating.
        title: 'Scrolls',
        icon: <ScrollText size={ICON} />,
        children: [
          { title: 'Almagest', href: '#/scrolls/almagest' },
          { title: 'Elements', href: '#/scrolls/elements' },
        ],
      },
      { id: 'lost', title: 'Lost works — nothing catalogued yet' },
    ],
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <NavTree {...args} />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Neither row is a link: no `href="#"` to click into, and the toggle keeps
    // its own affordance.
    const links = canvas.getAllByRole('link');
    expect(links.every((link) => link.getAttribute('href') !== '#')).toBe(true);
    expect(canvas.queryByRole('link', { name: /Lost works/ })).toBeNull();

    const toggle = canvas.getByRole('button', { name: /Scrolls/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(canvas.getByRole('link', { name: 'Almagest' })).toBeVisible();
  },
};

/**
 * `orientation="horizontal"` lays the top-level items out as a tab row with
 * an accent underline on the active item — the navbar nav-row form. Groups
 * flatten, nesting isn't rendered. The ages of knowledge, with how much of
 * antiquity's writing survived each of them (spoiler: not much).
 */
export const Horizontal: Story = {
  args: {
    'aria-label': 'Ages of knowledge',
    orientation: 'horizontal',
    currentPath: '#/renaissance',
    items: [
      { title: 'Antiquity', href: '#/antiquity' },
      { title: 'Middle Ages', href: '#/middle-ages', trailing: <Chip>scriptoria</Chip> },
      { title: 'Renaissance', href: '#/renaissance', trailing: <Chip>print</Chip> },
      { title: 'Enlightenment', href: '#/enlightenment' },
    ],
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <NavTree {...args} />
    </div>
  ),
};

/**
 * The `content` slot puts arbitrary JSX inside a group — here the Ignis
 * sidebar pattern: a compact `SearchField` living inside the expanded
 * Manuscripts branch, live-filtering its siblings. Composition from the
 * call site; NavTree itself never imports `forms/`.
 *
 * Note `defaultOpen: true` on the branch: open-state is derived from the
 * active path, so a branch whose children can be filtered away must declare
 * it — otherwise zero matches would remove the active child and collapse
 * the branch, filter field and all.
 */
export const GroupFilter: Story = {
  args: { items: [] },
  render: function GroupFilterStory() {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();
    const works = [
      { title: 'Almagest — Ptolemy', href: '#/works/almagest' },
      { title: 'Elements — Euclid', href: '#/works/elements' },
      { title: 'Conics — Apollonius', href: '#/works/conics' },
      { title: 'On Floating Bodies — Archimedes', href: '#/works/floating-bodies' },
      { title: 'Geographia — Eratosthenes', href: '#/works/geographia' },
    ].filter((w) => !q || w.title.toLowerCase().includes(q));

    return (
      <div style={{ width: 300 }}>
        <NavTree
          aria-label="Collections"
          currentPath="#/works/almagest"
          groups={[
            {
              label: 'Collections',
              items: [
                {
                  title: 'Manuscripts',
                  href: '#/works',
                  defaultOpen: true,
                  children: [
                    { title: 'All manuscripts', href: '#/works' },
                    {
                      id: 'filter',
                      content: (
                        <SearchField
                          size="sm"
                          value={query}
                          onChange={setQuery}
                          debounce={150}
                          placeholder="Filter works…"
                          aria-label="Filter manuscripts"
                        />
                      ),
                    },
                    ...(works.length
                      ? works
                      : [{ id: 'empty', title: 'No works match.' }]),
                  ],
                },
              ],
            },
          ]}
        />
      </div>
    );
  },
};

const RouteContext = createContext<(path: string) => void>(() => {});

function RouterLink({
  href,
  children,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'aria-current'?: 'page';
}) {
  const navigate = useContext(RouteContext);
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

const MANUSCRIPTS = [
  { slug: 'almagest', title: 'Almagest — Ptolemy', readers: 14 },
  { slug: 'elements', title: 'Elements — Euclid', readers: 31 },
  { slug: 'conics', title: 'Conics — Apollonius', readers: 6 },
];

const SECTIONS = ['Overview', 'Readers', 'Loans', 'Annotations', 'Edit'];

/**
 * The expanding rail: a record's sections unfold under the list's branch,
 * headed by a `context` row naming it. Three rules keep it honest, and the
 * API carries them — expansion follows the route (`expandedKeys` derived
 * from the path, so deep links land open), one record unfolded at a time,
 * and the record's name lives in the rail so the H1 is the section.
 * Collapsing the branch (`onExpandedChange`) means the same as the close
 * button: leave the record.
 */
export const ExpandingRail: Story = {
  args: { items: [] },
  render: function ExpandingRailStory() {
    const [path, setPath] = useState('#/manuscripts');
    const slug = /^#\/manuscripts\/([^/]+)/.exec(path)?.[1];
    const record = MANUSCRIPTS.find((m) => m.slug === slug);
    const base = `#/manuscripts/${slug}`;
    const section =
      SECTIONS.find((name) => path === `${base}/${name.toLowerCase()}`) ??
      (record ? 'Overview' : undefined);

    return (
      <RouteContext.Provider value={setPath}>
        <div className="flex h-[420px] items-start gap-8">
          <div className="w-[236px] shrink-0">
            <NavTree
              aria-label="Alexandria console"
              currentPath={path}
              LinkComponent={RouterLink}
              expandedKeys={record ? ['#/manuscripts'] : []}
              onExpandedChange={(keys) => {
                if (!keys.has('#/manuscripts')) setPath('#/manuscripts');
              }}
              groups={[
                {
                  label: 'Library',
                  items: [
                    { title: 'Dashboard', href: '#/', icon: <LayoutGrid size={ICON} /> },
                    {
                      title: 'Manuscripts',
                      href: '#/manuscripts',
                      icon: <ScrollText size={ICON} />,
                      children: record && [
                        {
                          id: 'record',
                          context: record.title,
                          onClose: () => setPath('#/manuscripts'),
                          closeLabel: 'Close manuscript',
                        },
                        { title: 'Overview', href: base },
                        {
                          title: 'Readers',
                          href: `${base}/readers`,
                          trailing: <Chip>{record.readers}</Chip>,
                        },
                        { title: 'Loans', href: `${base}/loans` },
                        { title: 'Annotations', href: `${base}/annotations` },
                        { title: 'Edit', href: `${base}/edit` },
                      ],
                    },
                    { title: 'Readers', href: '#/readers', icon: <Users size={ICON} /> },
                    { title: 'Instruments', href: '#/instruments', icon: <Telescope size={ICON} /> },
                  ],
                },
              ]}
            />
          </div>
          <main className="min-w-0 flex-1">
            {record ? (
              <Heading.Group>
                <Heading.Eyebrow>{record.title}</Heading.Eyebrow>
                <Heading as="h1">{section}</Heading>
              </Heading.Group>
            ) : (
              <>
                <Heading as="h1">Manuscripts</Heading>
                <ul className="mt-4 space-y-2">
                  {MANUSCRIPTS.map((m) => (
                    <li key={m.slug}>
                      <Link href={`#/manuscripts/${m.slug}`} component={RouterLink}>
                        {m.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </main>
        </div>
      </RouteContext.Provider>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const nav = within(canvas.getByRole('navigation', { name: 'Alexandria console' }));

    // On the list: nothing is unfolded.
    expect(nav.queryByText('Almagest — Ptolemy')).toBeNull();
    expect(nav.queryByRole('link', { name: /Readers/ })).toHaveAttribute('href', '#/readers');

    // Open a record from the page: the rail unfolds under Manuscripts with
    // the record named above its sections.
    await userEvent.click(canvas.getByRole('link', { name: 'Almagest — Ptolemy' }));
    expect(nav.getByText('Almagest — Ptolemy')).toBeVisible();
    expect(nav.getByRole('link', { name: 'Loans' })).toHaveAttribute(
      'href',
      '#/manuscripts/almagest/loans',
    );
    expect(nav.getByRole('button', { name: 'Collapse Manuscripts' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    // Deep-navigating inside the record keeps it open; the H1 is the section.
    await userEvent.click(nav.getByRole('link', { name: 'Loans' }));
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Loans');
    expect(nav.getByText('Almagest — Ptolemy')).toBeVisible();

    // Close it: back to the list, branch folded.
    await userEvent.click(nav.getByRole('button', { name: 'Close manuscript' }));
    expect(nav.queryByText('Almagest — Ptolemy')).toBeNull();
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Manuscripts');
  },
};
