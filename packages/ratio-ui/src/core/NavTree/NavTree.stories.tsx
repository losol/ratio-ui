// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BookOpen,
  Database,
  FlaskConical,
  LayoutGrid,
  ScrollText,
  ShieldCheck,
  Telescope,
  Upload,
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
    currentPath: '/manuscripts',
    groups: [
      {
        label: 'Collections',
        items: [
          { title: 'Dashboard', href: '/', icon: <LayoutGrid size={ICON} /> },
          {
            title: 'Manuscripts',
            href: '/manuscripts',
            icon: <ScrollText size={ICON} />,
            trailing: <Chip>400k</Chip>,
          },
          { title: 'Instruments', href: '/instruments', icon: <Telescope size={ICON} /> },
        ],
      },
      {
        label: 'Administration',
        items: [
          { title: 'Catalogue', href: '/catalogue', icon: <Database size={ICON} /> },
          {
            title: 'Imports',
            href: '/imports',
            icon: <Upload size={ICON} />,
            trailing: (
              <Chip>
                <Chip.Dot pulse /> live
              </Chip>
            ),
          },
          { title: 'Audit log', href: '/audit', icon: <ShieldCheck size={ICON} /> },
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
 * auto-expands and her row is tinted.
 */
export const FieldsOfKnowledge: Story = {
  args: {
    'aria-label': 'Fields of knowledge',
    currentPath: '/mathematics/noether',
    groups: [
      {
        label: 'Sciences',
        items: [
          {
            title: 'Physics',
            icon: <FlaskConical size={ICON} />,
            children: [
              { title: 'Isaac Newton', href: '/physics/newton' },
              { title: 'James Clerk Maxwell', href: '/physics/maxwell' },
              { title: 'Marie Curie', href: '/physics/curie' },
            ],
          },
          {
            title: 'Mathematics',
            icon: <BookOpen size={ICON} />,
            children: [
              { title: 'Leonhard Euler', href: '/mathematics/euler' },
              { title: 'Carl Friedrich Gauss', href: '/mathematics/gauss' },
              { title: 'Emmy Noether', href: '/mathematics/noether' },
            ],
          },
          {
            title: 'Astronomy',
            icon: <Telescope size={ICON} />,
            children: [
              { title: 'Hypatia', href: '/astronomy/hypatia' },
              { title: 'Johannes Kepler', href: '/astronomy/kepler' },
              { title: 'Galileo Galilei', href: '/astronomy/galileo' },
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
    currentPath: '/kepler/harmonices-mundi',
    items: [
      {
        title: 'Johannes Kepler',
        href: '/kepler',
        icon: <Telescope size={ICON} />,
        children: [
          { title: 'Mysterium Cosmographicum (1596)', href: '/kepler/mysterium' },
          { title: 'Astronomia Nova (1609)', href: '/kepler/astronomia-nova' },
          { title: 'Harmonices Mundi (1619)', href: '/kepler/harmonices-mundi' },
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
