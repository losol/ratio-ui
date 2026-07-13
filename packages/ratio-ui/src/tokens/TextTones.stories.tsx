// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Tokens/Text tones',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/**
 * One catalogue entry rendered three times — title in `--text`, description
 * in `--text-muted`, provenance hints in `--text-subtle` — so the tones can
 * be judged where they're actually used.
 */
const Entry = () => (
  <div>
    <p className="m-0 font-serif text-lg font-semibold text-(--text)">Almagest</p>
    <p className="m-0 mt-1 max-w-[48ch] text-sm text-(--text-muted)">
      Claudius Ptolemy&apos;s mathematical treatise on the motions of the stars
      and planets — the authority on astronomy for fourteen centuries.
    </p>
    <p className="m-0 mt-1.5 text-xs text-(--text-subtle)">
      Shelf μ-13 · 13 books · copied Alexandria, 2nd century CE
    </p>
  </div>
);

const label = 'mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-subtle)';

/**
 * The three text tones on both backgrounds they meet in practice: the page
 * surface and a card. Every tone meets WCAG AA on both, in light, dark, and
 * bureau themes — flip the theme toolbar to verify. `--text` carries body
 * copy, `--text-muted` secondary text, `--text-subtle` hints, placeholders
 * and timestamps.
 */
export const OnSurfaceAndCard: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <section>
        <div className={label}>On the surface</div>
        <Entry />
      </section>
      <section>
        <div className={label}>On a card</div>
        <div className="rounded-xl border border-border-1 bg-card p-5">
          <Entry />
        </div>
      </section>
      <section>
        <div className={label}>Hierarchy at a glance</div>
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">--text — body copy (Ptolemy wrote it)</span>
          <span className="text-(--text-muted)">--text-muted — secondary text (what the treatise covers)</span>
          <span className="text-(--text-subtle)">--text-subtle — hints &amp; metadata (where the scroll lives)</span>
        </div>
      </section>
    </div>
  ),
};
