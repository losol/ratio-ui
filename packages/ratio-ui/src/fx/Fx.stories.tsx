import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../core/Button';
import { Card } from '../core/Card';
import { snow, rain, winter, nationalDay, newYear, type FxPlayback, confetti, fireworks, lightning, play as playFx, sparkles, useFx, type FxMotion } from './index';

const meta: Meta = {
  title: 'Visuals/Fx (beta)',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Visual effects over the page: `play(effect, options)` or the `useFx()` hook. One canvas, `pointer-events: none` and `aria-hidden`, removed when the effect is over. Under `prefers-reduced-motion` nothing moves (the element gets a ring for a moment), and inside `data-motion="none"` nothing happens. Announce the event itself in text; the effect is decoration.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** The overlay canvas, if an effect is playing. */
const overlay = () => document.querySelector<HTMLCanvasElement>('canvas[data-ratio-fx]');

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Runs `body` as if the reader had asked for reduced motion. */
async function withReducedMotion(body: () => Promise<void>) {
  const original = window.matchMedia;
  window.matchMedia = (query: string) =>
    ({ ...original.call(window, query), matches: query.includes('reduce'), media: query }) as MediaQueryList;
  try {
    await body();
  } finally {
    window.matchMedia = original;
  }
}

/** Confetti from the button, in the theme's colours. */
export const Confetti: Story = {
  render: function ConfettiStory() {
    const fx = useFx();
    return (
      <Button variant="primary" onPress={e => fx(confetti, { origin: e.target })}>
        Course passed
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Course passed' }));
    const canvas = overlay();
    await expect(canvas).not.toBeNull();
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(canvas!).pointerEvents).toBe('none');
    // Gone when the last piece has fallen.
    await waitFor(() => expect(overlay()).toBeNull(), { timeout: 6000 });
  },
};

/** A badge tier's metal: `colors: 'tier:gold'`. */
export const GoldMedal: Story = {
  render: function GoldMedalStory() {
    const fx = useFx();
    return (
      <Button variant="secondary" onPress={e => fx(confetti, { origin: e.target, colors: 'tier:gold', count: 140 })}>
        Gold earned
      </Button>
    );
  },
};

/** Sparkles round the element that earned them — the quiet one, for small wins. */
export const Sparkles: Story = {
  render: function SparklesStory() {
    const fx = useFx();
    const card = useRef<HTMLDivElement>(null);
    return (
      <div className="flex flex-col items-center gap-6">
        <div ref={card}>
          <Card padding="md">Times tables — level 3</Card>
        </div>
        <Button variant="secondary" onPress={() => fx(sparkles, { origin: card.current })}>
          Level up
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Level up' }));
    await expect(overlay()).not.toBeNull();
    await waitFor(() => expect(overlay()).toBeNull(), { timeout: 3000 });
  },
};

/** Fireworks: rockets that rise one after another and burst into a sphere of sparks. */
export const Fireworks: Story = {
  render: function FireworksStory() {
    const fx = useFx();
    return (
      <div className="pt-80">
        <Button variant="primary" onPress={e => fx(fireworks, { origin: e.target, rockets: 4, height: 320 })}>
          Happy New Year
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Happy New Year' }));
    await expect(overlay()).not.toBeNull();
    await waitFor(() => expect(overlay()).toBeNull(), { timeout: 7000 });
  },
};

/**
 * Lightning: a bolt from the top of the page to the card, a flash of the
 * page and a shake of what was struck. The flash goes through the model's
 * cap — at most three a second, never white-out — however often it is
 * pressed.
 */
export const Lightning: Story = {
  render: function LightningStory() {
    const fx = useFx();
    const card = useRef<HTMLDivElement>(null);
    return (
      <div className="flex flex-col items-center gap-6 pt-60">
        <div ref={card} data-testid="target">
          <Card padding="md">Streak: 0 days</Card>
        </div>
        <Button variant="secondary" onPress={() => fx(lightning, { origin: card.current, shake: 8 })}>
          Streak broken
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Streak broken' }));
    await expect(overlay()).not.toBeNull();
    await expect(canvas.getByTestId('target').getAnimations()).toHaveLength(1);
    await waitFor(() => expect(overlay()).toBeNull(), { timeout: 2000 });
  },
};

/**
 * Records the fx canvas frame by frame and counts flash onsets: a lit frame
 * after a dark one, or the first lit frame of a new canvas. Each `clearRect`
 * opens a frame; a fill in the flash's tint lights it. Counting frames rather
 * than the time between paints keeps one flash one onset on a slow runner,
 * where two frames of the same flash can be more than 25 ms apart.
 */
function recordFlashes() {
  const proto = CanvasRenderingContext2D.prototype;
  const { clearRect, fillRect } = proto;
  const frames: { canvas: HTMLCanvasElement; lit: boolean; at: number }[] = [];
  proto.clearRect = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof clearRect>) {
    if (this.canvas.dataset.ratioFx !== undefined) frames.push({ canvas: this.canvas, lit: false, at: performance.now() });
    return clearRect.apply(this, args);
  };
  proto.fillRect = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof fillRect>) {
    const frame = frames.at(-1);
    if (frame?.canvas === this.canvas && String(this.fillStyle).startsWith('rgba(235, 242, 255')) frame.lit = true;
    return fillRect.apply(this, args);
  };
  return {
    onsets: () =>
      frames
        .filter((frame, i) => {
          const before = frames[i - 1];
          return frame.lit && !(before?.lit && before.canvas === frame.canvas);
        })
        .map(frame => frame.at),
    restore: () => {
      proto.clearRect = clearRect;
      proto.fillRect = fillRect;
    },
  };
}

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

/**
 * The flash cap holds even when strikes are stopped as soon as they start:
 * six strikes closer together than a flash lasts, each stopped after two
 * frames, light the page at most three times in a second.
 */
export const FlashCap: Story = {
  render: function FlashCapStory() {
    return (
      <Button variant="secondary" onPress={() => {}}>
        Target
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const target = within(canvasElement).getByRole('button', { name: 'Target' });
    // A second clear of the last test's flashes.
    await wait(1100);
    const flashes = recordFlashes();
    try {
      for (let i = 0; i < 6; i++) {
        const strike = playFx(lightning, { origin: target, restrike: false });
        await nextFrame();
        await nextFrame();
        strike.stop();
        // A dark frame between strikes, so each flash is its own onset;
        // still sooner than a flash lasts.
        await wait(25);
      }
      await wait(200);
      const onsets = flashes.onsets();
      const worst = Math.max(...onsets.map(t => onsets.filter(u => u >= t && u < t + 1000).length));
      await expect(worst).toBeLessThanOrEqual(3);
    } finally {
      flashes.restore();
    }
  },
};

/**
 * Thunder belongs to the strike: `stop()` before it starts silences it, and
 * `finished` waits for the rumble to end, not only the bolt.
 */
export const ThunderLifecycle: Story = {
  render: function ThunderLifecycleStory() {
    return (
      <Button variant="secondary" onPress={() => {}}>
        Target
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const target = within(canvasElement).getByRole('button', { name: 'Target' });
    const Original = window.AudioContext;
    const contexts: AudioContext[] = [];
    window.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        contexts.push(this);
      }
    };
    // As if the reader had pressed something: browsers allow sound after that.
    const hadActivation = Object.getOwnPropertyDescriptor(navigator, 'userActivation');
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: { hasBeenActive: true, isActive: true },
    });
    try {
      const stopped = playFx(lightning, { origin: target, sound: true });
      await expect(contexts).toHaveLength(1);
      stopped.stop();
      await stopped.finished;
      await waitFor(() => expect(contexts[0]!.state).toBe('closed'), { timeout: 1000 });

      const began = performance.now();
      await playFx(lightning, { origin: target, sound: true }).finished;
      // The bolt is gone after 450 ms; the rumble starts at 350 ms and lasts 2.6 s.
      await expect(performance.now() - began).toBeGreaterThan(2500);
    } finally {
      window.AudioContext = Original;
      if (hadActivation) Object.defineProperty(navigator, 'userActivation', hadActivation);
      else delete (navigator as { userActivation?: unknown }).userActivation;
    }
  },
};

/**
 * `sound: true` adds thunder: a low rumble a moment after the bolt. Off by
 * default, played only after the reader has interacted with the page, and
 * only under full motion.
 */
export const Thunder: Story = {
  render: function ThunderStory() {
    const fx = useFx();
    return (
      <div className="pt-60">
        <Button variant="secondary" onPress={e => fx(lightning, { origin: e.target, sound: true })}>
          Reveal
        </Button>
      </div>
    );
  },
};

/**
 * Inside a modal dialog: the canvas is a popover in the top layer, shown
 * after the dialog, so the confetti falls over the dialog that earned it.
 */
export const InDialog: Story = {
  render: function InDialogStory() {
    const fx = useFx();
    const dialog = useRef<HTMLDialogElement>(null);
    return (
      <>
        <Button variant="secondary" onPress={() => dialog.current?.showModal()}>
          Open
        </Button>
        <dialog ref={dialog} className="m-auto rounded-xl border border-border-1 bg-card p-6">
          <p className="mt-0">Badge earned: Times tables master.</p>
          <Button variant="primary" onPress={e => fx(confetti, { origin: e.target })}>
            Claim badge
          </Button>
        </dialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    const dialog = canvasElement.querySelector('dialog')!;
    await userEvent.click(within(dialog).getByRole('button', { name: 'Claim badge' }));
    const canvas = overlay()!;
    await expect(canvas.matches(':popover-open')).toBe(true);
    await expect(canvas.style.width).toBe(`${window.innerWidth}px`);
    await expect(canvas.style.height).toBe(`${window.innerHeight}px`);
    await waitFor(() => expect(overlay()).toBeNull(), { timeout: 6000 });
    dialog.close();
  },
};

/**
 * Under `prefers-reduced-motion` nothing moves: the element gets a ring for
 * a moment. Effects that overlap keep it until the last one ends, and a
 * `stop()` ends only its own.
 */
export const ReducedMotion: Story = {
  render: function ReducedMotionStory() {
    return (
      <Button variant="primary" onPress={() => {}}>
        Course passed
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Course passed' });
    await withReducedMotion(async () => {
      const first = playFx(confetti, { origin: button });
      await expect(first.motion).toBe('reduced');
      await expect(overlay()).toBeNull();
      await expect(button).toHaveAttribute('data-fx-ack');
      await wait(500);
      playFx(confetti, { origin: button });
      // The first ring has run out; the second still shows.
      await wait(550);
      await expect(button).toHaveAttribute('data-fx-ack');
      await waitFor(() => expect(button).not.toHaveAttribute('data-fx-ack'), { timeout: 1000 });

      const older = playFx(confetti, { origin: button });
      const newer = playFx(confetti, { origin: button });
      older.stop();
      older.stop();
      await expect(button).toHaveAttribute('data-fx-ack');
      newer.stop();
      await expect(button).not.toHaveAttribute('data-fx-ack');
    });
  },
};

/**
 * Inside `data-motion="none"` (a mourning period, or stillness by design)
 * nothing plays: no canvas, no ring. `play` says so in `motion`.
 */
export const StillPage: Story = {
  render: function StillPageStory() {
    const fx = useFx();
    const [motion, setMotion] = useState<FxMotion | null>(null);
    return (
      <div data-motion="none" className="flex flex-col items-center gap-3">
        <Button variant="primary" onPress={e => setMotion(fx(confetti, { origin: e.target }).motion)}>
          Course passed
        </Button>
        <p className="m-0 text-sm text-(--text-muted)" data-testid="motion">
          {motion ? `motion: ${motion}` : 'Press the button.'}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Course passed' }));
    await expect(canvas.getByTestId('motion')).toHaveTextContent('motion: none');
    await expect(overlay()).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Course passed' })).not.toHaveAttribute('data-fx-ack');
  },
};

/** Ambient effects stay on until stopped; the hook also stops them on unmount. */
function Weather({ effect }: { effect: typeof snow }) {
  const fx = useFx();
  const playing = useRef<FxPlayback | null>(null);
  const [active, setActive] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-800 p-8 text-white">
      <p>Decorative weather over the page. Stop it whenever you like.</p>
      <Button variant="primary" onPress={() => {
        playing.current?.stop();
        playing.current = fx(effect, { intensity: 0.4, seed: 17 });
        setActive(true);
      }}>Start weather</Button>
      <Button variant="secondary" onPress={() => {
        playing.current?.stop();
        setActive(false);
      }}>Stop weather</Button>
      <p role="status">{active ? 'Weather enabled' : 'Weather stopped'}</p>
    </div>
  );
}

export const Snow: Story = {
  render: () => <Weather effect={snow} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Start weather' }));
    await expect(overlay()).not.toBeNull();
    await expect(overlay()).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(overlay()!).pointerEvents).toBe('none');
    await wait(150);
    await userEvent.click(canvas.getByRole('button', { name: 'Stop weather' }));
    await expect(overlay()).toBeNull();
    await expect(canvas.getByRole('status')).toHaveTextContent('Weather stopped');
  },
};

export const Rain: Story = {
  ...Snow,
  render: () => <Weather effect={rain} />,
};

/** Named presets use the same play(effect, options) API and motion rules. */
export const Occasions: Story = {
  render: function OccasionsStory() {
    const fx = useFx();
    const flurry = useRef<FxPlayback | null>(null);
    return (
      <div className="flex gap-4 pt-80">
        <Button variant="primary" onPress={e => fx(nationalDay, { origin: e.target })}>17 May</Button>
        <Button variant="secondary" onPress={e => fx(newYear, { origin: e.target })}>New Year</Button>
        <Button variant="secondary" onPress={() => { flurry.current?.stop(); flurry.current = fx(winter); }}>Winter</Button>
        <Button variant="secondary" onPress={() => flurry.current?.stop()}>Stop winter</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['17 May', 'New Year']) {
      await userEvent.click(canvas.getByRole('button', { name }));
      await expect(overlay()).not.toBeNull();
      await waitFor(() => expect(overlay()).toBeNull(), { timeout: 6000 });
    }
    await userEvent.click(canvas.getByRole('button', { name: /^Winter$/ }));
    await expect(overlay()).not.toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Stop winter' }));
    await expect(overlay()).toBeNull();
  },
};

/** Exercise ambient visibility and motion policies in a real canvas renderer. */
export const AmbientLifecycle: Story = {
  render: () => <Weather effect={snow} />,
  play: async ({ canvasElement }) => {
    const target = within(canvasElement).getByRole('button', { name: 'Start weather' });
    const proto = CanvasRenderingContext2D.prototype;
    const originalClear = proto.clearRect;
    const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
    let hidden = false;
    let paints = 0;
    let flurry: FxPlayback | null = null;
    proto.clearRect = function (...args) {
      paints++;
      return originalClear.apply(this, args);
    };
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    const setHidden = (value: boolean) => {
      hidden = value;
      document.dispatchEvent(new Event('visibilitychange'));
    };
    try {
      setHidden(true);
      flurry = playFx(snow, { seed: 17 });
      await wait(100);
      await expect(paints).toBe(0);
      setHidden(false);
      await waitFor(() => expect(paints).toBeGreaterThan(0));
      setHidden(true);
      const frozen = paints;
      await wait(100);
      await expect(paints).toBe(frozen);
      setHidden(false);
      await waitFor(() => expect(paints).toBeGreaterThan(frozen));
      flurry.stop();
      await flurry.finished;
      await expect(overlay()).toBeNull();

      await withReducedMotion(async () => {
        const reduced = playFx(winter, { origin: target });
        await expect(reduced.motion).toBe('reduced');
        await expect(overlay()).toBeNull();
        reduced.stop();
      });
      target.dataset.motion = 'none';
      const refused = playFx(rain, { origin: target });
      await expect(refused.motion).toBe('none');
      await expect(overlay()).toBeNull();
      delete target.dataset.motion;
      flurry = playFx(snow, { origin: target });
      await expect(overlay()).not.toBeNull();
      target.dataset.motion = 'none';
      await waitFor(() => expect(overlay()).toBeNull());
      await flurry.finished;
    } finally {
      flurry?.stop();
      delete target.dataset.motion;
      proto.clearRect = originalClear;
      if (originalHidden) Object.defineProperty(document, 'hidden', originalHidden);
      else delete (document as { hidden?: boolean }).hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    }
  },
};
