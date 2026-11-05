import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../core/Button';
import { Card } from '../core/Card';
import { confetti, fireworks, lightning, sparkles, useFx, type FxMotion } from './index';

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
