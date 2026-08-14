// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * Upgrade-notes view — a composition exercise, not a component. Everything
 * here is existing ratio-ui: Timeline for the version rail (`layout="inline"`
 * so the version leads, `marker="ring"` because a release is a point, not an
 * outcome), Card `accent` to colour-code each change, Chip for the category,
 * confidence and touched files, and Checkbox to tick off what you have read.
 *
 * The problem it solves: an operator upgrading a self-hosted service needs to
 * know what changed between their version and the next — and which of it needs
 * a hand. Releases with nothing to act on stay a single line.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../../core/Card';
import { Chip } from '../../core/Chip';
import { Heading } from '../../core/Heading';
import { Timeline } from '../../core/Timeline';
import { Checkbox } from '../../forms/Input/Checkbox';
import { AlertTriangle, Database, Settings, ShieldCheck } from '../../icons';

const meta: Meta = {
  title: 'Pages/Release Changelog',
};

export default meta;
type Story = StoryObj;

const ICON = 13;

/** Category → accent stripe, chip tone and icon. One row per kind of change. */
const CATEGORY = {
  migration: { label: 'Migration', tone: 'warning', icon: <Database size={ICON} /> },
  config: { label: 'Config', tone: 'info', icon: <Settings size={ICON} /> },
  breaking: { label: 'Breaking', tone: 'error', icon: <AlertTriangle size={ICON} /> },
  security: { label: 'Security', tone: 'success', icon: <ShieldCheck size={ICON} /> },
} as const;

type Category = keyof typeof CATEGORY;

interface Change {
  id: string;
  category: Category;
  confidence: 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  action: string;
  files: string[];
}

interface Release {
  version: string;
  date: string;
  changes: Change[];
}

const releases: Release[] = [
  { version: 'v2.5.1', date: '7 Aug 2026', changes: [] },
  { version: 'v2.5.0', date: '29 Jul 2026', changes: [] },
  {
    version: 'v2.4.0',
    date: '27 Jul 2026',
    changes: [
      {
        id: 'deps-rework',
        category: 'migration',
        confidence: 'high',
        title: 'Account dependency storage rebuilt',
        summary:
          'Dependency records move to their own table and gain discovery run counters. The service applies the schema change on startup.',
        action: 'No manual step — the migration runs during startup.',
        files: ['backend/src/db/migrations/20260720_account-dependencies.ts'],
      },
      {
        id: 'update-check',
        category: 'config',
        confidence: 'high',
        title: 'Update check can be switched off',
        summary:
          'A new DISABLE_UPDATE_CHECK setting stops the startup and weekly version pings, which matters in air-gapped installs.',
        action: 'Set DISABLE_UPDATE_CHECK=true if outbound network access is not allowed.',
        files: ['backend/src/lib/config/env.ts', 'docs/self-hosting/configuration.mdx'],
      },
      {
        id: 'v1-export',
        category: 'breaking',
        confidence: 'medium',
        title: 'The v1 export endpoint is gone',
        summary:
          '/api/v1/export was deprecated in 2.2 and is removed here. Integrations calling it get a 404 after the upgrade.',
        action: 'Point integrations at /api/v2/export before you upgrade.',
        files: ['backend/src/routes/export.ts'],
      },
    ],
  },
  {
    version: 'v2.3.0',
    date: '12 Jul 2026',
    changes: [
      {
        id: 'session-rotation',
        category: 'security',
        confidence: 'high',
        title: 'Session tokens rotate on privilege change',
        summary:
          'Granting or revoking an admin role now issues a fresh token, so an open session cannot keep its old permissions.',
        action: 'Nothing to do — existing sessions are re-issued on next request.',
        files: ['backend/src/services/session.ts'],
      },
    ],
  },
];

/** Category chip — tinted by overriding the `--chip-*` tokens for this scope. */
const CategoryChip = ({ category }: { category: Category }) => {
  const { label, tone, icon } = CATEGORY[category];
  return (
    <Chip
      style={
        {
          '--chip-bg': `var(--${tone}-bg)`,
          '--chip-fg': `var(--${tone}-text)`,
          '--chip-border': `var(--${tone}-border)`,
          '--chip-radius': '6px',
        } as React.CSSProperties
      }
    >
      {icon}
      {label}
    </Chip>
  );
};

const ChangeCard = ({
  change,
  reviewed,
  onToggle,
}: {
  change: Change;
  reviewed: boolean;
  onToggle: () => void;
}) => (
  <Card
    accent={CATEGORY[change.category].tone}
    padding="md"
    radius="lg"
    shadow="none"
    className={`flex gap-3 ${reviewed ? 'opacity-60' : ''}`}
  >
    <Checkbox
      id={`reviewed-${change.id}`}
      containerClassName="m-0 pt-0.5"
      checked={reviewed}
      onChange={onToggle}
      aria-label={`Mark "${change.title}" as reviewed`}
    />
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryChip category={change.category} />
        <Chip
          variant="outline"
          className="font-mono"
          style={{ '--chip-radius': '6px' } as React.CSSProperties}
        >
          {change.confidence} confidence
        </Chip>
      </div>
      <Heading as="h3" className="text-base font-medium">
        {change.title}
      </Heading>
      <p className="m-0 text-sm text-(--text-muted)">{change.summary}</p>
      <p className="m-0 text-sm text-(--text-muted)">
        <strong className="font-semibold text-(--text)">Action:</strong> {change.action}
      </p>
      <div className="flex flex-wrap gap-2">
        {change.files.map((file) => (
          <Chip key={file} split style={{ '--chip-radius': '6px' } as React.CSSProperties}>
            <Chip.Key>file</Chip.Key>
            <Chip.Value className="font-mono text-xs font-normal">{file}</Chip.Value>
          </Chip>
        ))}
      </div>
    </div>
  </Card>
);

const Changelog = () => {
  const [reviewed, setReviewed] = React.useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <Heading as="h1" className="text-2xl">Upgrade notes</Heading>
        <p className="m-0 text-sm text-(--text-muted)">
          Everything between your version and the latest release. Tick a change off once you have
          handled it.
        </p>
      </div>

      <Timeline>
        {releases.map((release) => (
          <Timeline.Item
            key={release.version}
            layout="inline"
            marker="ring"
            status={release.changes.length ? 'warning' : 'neutral'}
            title={<span className="font-mono text-base">{release.version}</span>}
            timestamp={release.date}
            actor={
              release.changes.length
                ? `${release.changes.length} change${release.changes.length === 1 ? '' : 's'}`
                : 'no changes'
            }
          >
            {release.changes.length > 0 && (
              <div className="flex flex-col gap-3">
                {release.changes.map((change) => (
                  <ChangeCard
                    key={change.id}
                    change={change}
                    reviewed={!!reviewed[change.id]}
                    onToggle={() =>
                      setReviewed((prev) => ({ ...prev, [change.id]: !prev[change.id] }))
                    }
                  />
                ))}
              </div>
            )}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export const Default: Story = {
  render: () => <Changelog />,
};
