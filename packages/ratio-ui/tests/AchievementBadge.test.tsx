import React, { StrictMode } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineAchievement, defineCredential } from '@eventuras/ratio-ui-core/badges';
import { confetti } from '@eventuras/ratio-ui-core/fx';
import { AchievementBadge, type AchievementBadgeProps } from '../src/badges/AchievementBadge';

const { play, stop } = vi.hoisted(() => ({ play: vi.fn(), stop: vi.fn() }));
vi.mock('../src/fx/play', () => ({
  play: (...args: unknown[]) => {
    play(...args);
    return { stop, finished: new Promise<void>(() => {}), motion: 'full' };
  },
}));
const achievement = defineAchievement({ id: 'urn:achievement', name: 'Reader', description: 'Read ten books', criteria: { narrative: 'Ten books' } });
const credential = defineCredential({ id: 'urn:award', issuer: { id: 'https://school.example' }, achievement, subject: { id: 'urn:learner' }, validFrom: '2026-11-05T00:00:00Z' });
const props: AchievementBadgeProps = { achievement, state: 'earned', display: { tier: 'gold' } };
const flush = () => act(async () => { await Promise.resolve(); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('AchievementBadge celebration', () => {
  it('requires explicit opt-in and an earned state', async () => {
    const view = render(<AchievementBadge {...props} />);
    await flush();
    expect(play).not.toHaveBeenCalled();
    view.rerender(<AchievementBadge {...props} celebrate state="locked" />);
    await flush();
    view.rerender(<AchievementBadge {...props} celebrate state="in-progress" />);
    await flush();
    expect(play).not.toHaveBeenCalled();
    view.rerender(<AchievementBadge {...props} celebrate />);
    await flush();
    expect(play).toHaveBeenCalledExactlyOnceWith(confetti, { origin: view.container.querySelector('svg'), colors: 'tier:gold' });
    expect(view.container.querySelector('[celebrate]')).toBeNull();
  });

  it('does not replay or stop on presentation or layout rerenders', async () => {
    const view = render(<AchievementBadge {...props} celebrate />);
    await flush();
    view.rerender(<AchievementBadge {...props} achievement={{ ...achievement }} display={{ tier: 'silver' }} celebrate layout="art" />);
    await flush();
    expect(play).toHaveBeenCalledTimes(1);
    expect(stop).not.toHaveBeenCalled();
    view.rerender(<AchievementBadge {...props} celebrate={false} layout="art" />);
    expect(stop).toHaveBeenCalledTimes(1);
    view.rerender(<AchievementBadge {...props} display={{ tier: 'bronze' }} celebrate layout="art" />);
    await flush();
    expect(play).toHaveBeenLastCalledWith(confetti, { origin: view.container.querySelector('svg'), colors: 'tier:bronze' });
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('stops on losing earned state and rearms on becoming earned', async () => {
    const view = render(<AchievementBadge {...props} display={{}} celebrate />);
    await flush();
    expect(play).toHaveBeenLastCalledWith(confetti, { origin: view.container.querySelector('svg'), colors: undefined });
    view.rerender(<AchievementBadge {...props} celebrate state="locked" />);
    expect(stop).toHaveBeenCalled();
    view.rerender(<AchievementBadge {...props} celebrate />);
    await flush();
    expect(play).toHaveBeenCalledTimes(2);
    stop.mockClear();
    view.unmount();
    expect(stop).toHaveBeenCalled();
  });

  it.each(['bronze', 'silver', 'gold'] as const)('uses the %s tier on initial earned mount', async tier => {
    const view = render(<AchievementBadge {...props} display={{ tier }} celebrate />);
    await flush();
    expect(play).toHaveBeenCalledExactlyOnceWith(confetti, { origin: view.container.querySelector('svg'), colors: `tier:${tier}` });
  });

  it('celebrates a new credential once, without replaying cloned credential objects', async () => {
    const view = render(<AchievementBadge achievement={achievement} celebrate />);
    await flush();
    expect(play).not.toHaveBeenCalled();
    view.rerender(<AchievementBadge achievement={achievement} credential={credential} celebrate />);
    await flush();
    expect(play).toHaveBeenCalledTimes(1);
    view.rerender(<AchievementBadge achievement={{ ...achievement }} credential={{ ...credential }} celebrate />);
    await flush();
    expect(play).toHaveBeenCalledTimes(1);
    expect(stop).not.toHaveBeenCalled();
  });

  it('cancels a queued burst when disabled before it starts', async () => {
    const view = render(<AchievementBadge {...props} celebrate />);
    view.rerender(<AchievementBadge {...props} celebrate={false} />);
    await flush();
    expect(play).not.toHaveBeenCalled();
  });

  it('plays once under Strict Mode and cancels discarded setups', async () => {
    const view = render(<StrictMode><AchievementBadge {...props} celebrate /></StrictMode>);
    await flush();
    expect(play).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(stop).toHaveBeenCalled();
    play.mockClear();
    const removed = render(<AchievementBadge {...props} celebrate />);
    removed.unmount();
    await flush();
    expect(play).not.toHaveBeenCalled();
  });
});
