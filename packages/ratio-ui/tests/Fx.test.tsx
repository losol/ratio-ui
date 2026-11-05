import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { confetti, nationalDay, rain, snow, winter } from '@eventuras/ratio-ui-core/fx';
import { play, type FxPlayback } from '../src/fx/play';
import { useFx } from '../src/fx/useFx';

const overlay = () => document.querySelector('canvas[data-ratio-fx]');
let frames: Map<number, FrameRequestCallback>;
let nextId: number;
let clock: number;
let reduced: boolean;
let hidden: boolean;
let draws: number[][];
let handles: FxPlayback[];
let clear: ReturnType<typeof vi.fn>;

function advance(ms = 16) {
  clock += ms;
  const pending = [...frames.values()];
  frames.clear();
  for (const callback of pending) callback(clock);
}

function visibility(value: boolean) {
  hidden = value;
  document.dispatchEvent(new Event('visibilitychange'));
}

function start(...args: Parameters<typeof play>) {
  const playback = play(...args);
  handles.push(playback);
  return playback;
}

beforeEach(() => {
  frames = new Map();
  nextId = 0;
  clock = 0;
  reduced = false;
  hidden = false;
  draws = [];
  handles = [];
  clear = vi.fn();
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextId, callback);
    return nextId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }));
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    setTransform() {}, clearRect: clear, save() {}, restore() {}, rotate() {}, scale() {},
    translate: (x: number, y: number) => draws.push([x, y]),
    beginPath() {}, arc() {}, fill() {}, fillRect() {}, lineTo() {}, closePath() {},
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  for (const handle of handles) handle.stop();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('ambient playback lifecycle', () => {
  it('preserves preset palettes ahead of theme colors and accepts explicit overrides', () => {
    const spawn = vi.spyOn({ ...nationalDay }, 'spawn');
    const effect = { ...nationalDay, spawn };
    document.body.style.setProperty('--primary', '#abcdef');
    start(effect, { seed: 17 });
    expect(spawn.mock.calls[0]![1].colors).toEqual(nationalDay.colors);
    start(effect, { colors: ['#123456'] });
    expect(spawn.mock.calls[1]![1].colors).toEqual(['#123456']);
    document.body.style.removeProperty('--primary');
  });

  it('shares one decorative canvas and survives beyond a burst until explicitly stopped', async () => {
    const snowing = start(snow, { seed: 1 });
    const raining = start(rain, { seed: 2 });
    const burst = start(confetti, { seed: 3 });
    expect(document.querySelectorAll('canvas')).toHaveLength(1);
    expect(overlay()?.getAttribute('aria-hidden')).toBe('true');
    const finished = vi.fn();
    void snowing.finished.then(finished);
    for (let i = 0; i < 500; i++) advance();
    await burst.finished;
    expect(finished).not.toHaveBeenCalled();
    snowing.stop();
    snowing.stop();
    await snowing.finished;
    expect(overlay()).not.toBeNull();
    raining.stop();
    await raining.finished;
    expect(overlay()).toBeNull();
    expect(frames.size).toBe(0);
  });

  it('freezes particles when hidden and resumes without a catch-up step', () => {
    start(snow, { seed: 1, intensity: 0.01 });
    advance();
    expect(draws).toHaveLength(1);
    const first = draws[0]!;
    visibility(true);
    expect(frames.size).toBe(0);
    advance(60_000);
    expect(draws).toHaveLength(1);
    visibility(false);
    advance();
    expect(draws).toHaveLength(2);
    expect(draws[1]![1]! - first[1]!).toBeLessThan(2);
    expect(draws[1]![1]!).toBeGreaterThan(first[1]!);
  });

  it('starts hidden without scheduling frames and releases listeners when stopped hidden', async () => {
    visibility(true);
    const remove = vi.spyOn(document, 'removeEventListener');
    const handle = start(rain);
    expect(frames.size).toBe(0);
    expect(draws).toHaveLength(0);
    handle.stop();
    await handle.finished;
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    visibility(false);
    expect(frames.size).toBe(0);
    expect(overlay()).toBeNull();
  });

  it('settles zero intensity and missing canvas without leaving a loop', async () => {
    await start(snow, { intensity: 0 }).finished;
    expect(overlay()).toBeNull();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    await start(rain).finished;
    expect(overlay()).toBeNull();
    expect(frames.size).toBe(0);
  });

  it('keeps a fixed budget across frames and resizes the shared bitmap', () => {
    start(rain, { intensity: 10 });
    advance();
    expect(draws).toHaveLength(rain.budget);
    draws = [];
    vi.stubGlobal('innerWidth', 320);
    window.dispatchEvent(new Event('resize'));
    expect((overlay() as HTMLCanvasElement).width).toBe(Math.round(320 * window.devicePixelRatio));
    advance();
    expect(draws).toHaveLength(rain.budget);
  });

  it('refuses ambient and preset motion, sound and particles under reduced motion and mourning', async () => {
    const target = document.createElement('button');
    document.body.append(target);
    reduced = true;
    const fallback = start(winter, { origin: target, sound: true });
    expect(fallback.motion).toBe('reduced');
    expect(target.hasAttribute('data-fx-ack')).toBe(true);
    expect(overlay()).toBeNull();
    fallback.stop();
    await fallback.finished;
    target.dataset.motion = 'none';
    for (const effect of [snow, rain, winter, nationalDay]) {
      const handle = start(effect, { origin: target });
      expect(handle.motion).toBe('none');
      await handle.finished;
    }
    expect(target.hasAttribute('data-fx-ack')).toBe(false);
    expect(overlay()).toBeNull();
  });

  it.each(['reduced', 'none'])('stops a running field when motion becomes %s', async setting => {
    const handle = start(snow);
    advance();
    if (setting === 'reduced') reduced = true;
    else document.body.dataset.motion = 'none';
    advance();
    await handle.finished;
    expect(overlay()).toBeNull();
    expect(frames.size).toBe(0);
    delete document.body.dataset.motion;
  });

  it('cleans up the useFx-owned ambient run on unmount', async () => {
    const { result, unmount } = renderHook(() => useFx());
    let handle!: FxPlayback;
    act(() => { handle = result.current(snow); });
    expect(overlay()).not.toBeNull();
    unmount();
    await handle.finished;
    expect(overlay()).toBeNull();
    expect(frames.size).toBe(0);
  });
});
