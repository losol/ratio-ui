import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { defineAchievement } from '@eventuras/ratio-ui-core/badges';
import { AchievementBadge, AchievementBadgeArt } from '../src/badges/AchievementBadge';

const achievement = defineAchievement({ id: 'urn:reader', name: 'Reader', description: 'Read ten books', criteria: { narrative: 'Ten books' } });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('uses the real renderer still acknowledgement for reduced motion and cleans it up', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  const view = render(<AchievementBadge achievement={achievement} state="earned" celebrate layout="art" />);
  await act(async () => { await Promise.resolve(); });
  expect(view.container.querySelector('svg')?.hasAttribute('data-fx-ack')).toBe(true);
  expect(document.querySelector('canvas')).toBeNull();
  expect(view.getByRole('img', { name: 'Reader' })).toBeTruthy();
  view.rerender(<AchievementBadge achievement={achievement} state="earned" celebrate={false} layout="art" />);
  expect(view.container.querySelector('[data-fx-ack]')).toBeNull();
});

it.each([false, true])('suppresses all decoration under data-motion=none (reduced=%s)', async reduced => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduced })));
  const view = render(<div data-motion="none"><AchievementBadge achievement={achievement} state="earned" celebrate /></div>);
  await act(async () => { await Promise.resolve(); });
  expect(view.container.querySelector('[data-fx-ack]')).toBeNull();
  expect(document.querySelector('canvas')).toBeNull();
});

it('keeps standalone SVG export server-renderable without celebration markup', () => {
  const svg = renderToStaticMarkup(<AchievementBadgeArt title="Reader" display={{ tier: 'gold' }} />);
  expect(svg).toContain('<svg');
  expect(svg).toContain('<title>Reader</title>');
  expect(svg).not.toContain('data-fx');
});
