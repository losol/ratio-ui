// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type CSSProperties, type ReactNode } from 'react';

import { Heading } from '../../core/Heading';
import { Container } from '../../layout/Container';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';
import './Hero.css';

export interface HeroProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Marks the hero as a dark surface (applies `surface-dark`): a local dark
   * token context, so text, muted tones, borders and buttons all take the
   * dark theme's values. Useful for heroes with photo backgrounds or
   * strongly colored fills.
   */
  dark?: boolean;
  /**
   * Background image URL — sets the hero's `background-image` to a
   * full-cover image with a soft dark overlay so foreground text stays
   * readable. Pair with `dark` if you want the typography tuned for
   * a dark surface.
   */
  backgroundImageUrl?: string;
  /**
   * Concentric arcs off the top-right corner — one ring per colour, the
   * first colour outermost, blended with `multiply`: the brand mark's
   * circle at hero scale. The occasion slot for flag colours (a pride
   * week); the app owns the list.
   */
  arcs?: readonly string[];
  /**
   * A fixed variant. `memorial`: an ink surface (a dark token context),
   * fine grain and a black band across the top-left corner — the effects
   * come with the variant, not as free tools. Add the years with
   * `Hero.Watermark`. `backgroundImageUrl` is ignored here — the variant
   * owns its surface. Pair with `data-motion="none"` on `<html>` or any
   * ancestor.
   */
  variant?: HeroVariant;
}

export type HeroVariant = 'memorial';

export interface HeroSlotProps {
  children?: ReactNode;
  className?: string;
}

export interface HeroTitleProps extends HeroSlotProps {
  /** Heading level. Defaults to 1 — heroes are usually the page's primary heading. */
  as?: 'h1' | 'h2';
}

export type HeroMotifProps = HeroSlotProps;
export type HeroWatermarkProps = HeroSlotProps;

const ARC_INNER = 118;
const ARC_WIDTH = 30;

/** Rings from the inside out, so the first colour lands outermost. */
function arcGradient(colors: readonly string[]): string {
  const stops = [...colors]
    .reverse()
    .map((color, i) => `${color} ${ARC_INNER + i * ARC_WIDTH}px ${ARC_INNER + (i + 1) * ARC_WIDTH}px`);
  const outer = ARC_INNER + colors.length * ARC_WIDTH;
  return `radial-gradient(circle, transparent 0 ${ARC_INNER}px, ${stops.join(', ')}, transparent ${outer}px)`;
}

/**
 * Editorial hero block — opinionated section for the top of a page.
 *
 * Compose with `Hero.Main` (left column) and optionally `Hero.Side` (right
 * column for stats, asides, secondary CTAs). Each slot is layout-only; the
 * children determine what goes in. When `Hero.Side` is omitted the main
 * content uses the full width.
 *
 * @example
 * ```tsx
 * <Hero>
 *   <Hero.Main>
 *     <Hero.Eyebrow>A knowledge platform</Hero.Eyebrow>
 *     <Hero.Title>
 *       Build something <em className="text-(--primary)">considered</em> —
 *       <em className="text-(--accent)">curated</em>, and worth coming back to.
 *     </Hero.Title>
 *     <Hero.Lead>A place for long-form articles and editorial collections ...</Hero.Lead>
 *     <Hero.Actions>
 *       <Button variant="primary" size="lg">Browse the library</Button>
 *     </Hero.Actions>
 *   </Hero.Main>
 *   <Hero.Side>
 *     {/* stat blocks, image, anything *\/}
 *   </Hero.Side>
 * </Hero>
 * ```
 */
const HeroRoot: React.FC<HeroProps> = ({
  children,
  className,
  style,
  dark,
  backgroundImageUrl,
  arcs,
  variant,
}) => {
  // Unwrap fragments when collecting children — Children.toArray treats
  // <>…</> as a single opaque child (same fix as Navbar and Tabs), which
  // would hide a Hero.Side or a layer grouped conditionally in a fragment.
  const flattenChildren = (nodes: ReactNode): ReturnType<typeof React.Children.toArray> =>
    React.Children.toArray(nodes).flatMap(child =>
      React.isValidElement(child) && child.type === React.Fragment
        ? flattenChildren((child.props as { children?: ReactNode }).children)
        : [child],
    );
  const childArray = flattenChildren(children);
  // Detect whether the consumer included a Hero.Side so we can drop the
  // second grid column when there's nothing to put in it. Without this
  // the main content would float in the left half on lg+ with empty
  // space on the right.
  const hasSide = childArray.some(
    child => React.isValidElement(child) && child.type === HeroSide,
  );
  // Hero.Motif and Hero.Watermark anchor to the section's corners, not the
  // grid — pull them out of the content and render them as layers.
  const layers = childArray.filter(
    child =>
      React.isValidElement(child) && (child.type === HeroMotif || child.type === HeroWatermark),
  );
  const content = layers.length ? childArray.filter(child => !layers.includes(child)) : childArray;
  const memorial = variant === 'memorial';

  // The memorial variant owns its surface (ink + grain); a cover image
  // would paint over the grain, so it is ignored there.
  const combinedStyle = buildCoverImageStyle(memorial ? undefined : backgroundImageUrl, style);

  return (
    <section
      className={cn(
        'ratio-hero py-(--space-2xl) border-b border-border-1 relative overflow-hidden',
        (dark || memorial) && 'surface-dark',
        memorial && 'ratio-hero--memorial bg-primary-950 border-primary-900',
        className,
      )}
      style={combinedStyle}
    >
      {arcs && arcs.length > 0 && (
        <div
          aria-hidden
          className="ratio-hero__arcs pointer-events-none absolute -top-64 -right-40 size-[520px] rounded-full mix-blend-multiply"
          style={{ background: arcGradient(arcs) }}
        />
      )}
      {memorial && <span aria-hidden className="ratio-hero__flor" />}
      {layers}
      <Container className="relative">
        <div
          className={cn(
            'grid gap-12 items-center',
            hasSide ? 'lg:grid-cols-[1.4fr_1fr]' : 'lg:grid-cols-1',
          )}
        >
          {content}
        </div>
      </Container>
    </section>
  );
};

const HeroMain: React.FC<HeroSlotProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const HeroSide: React.FC<HeroSlotProps> = ({ children, className }) => (
  <div
    className={cn(
      'hidden lg:grid lg:border-l lg:border-border-2 lg:pl-10 gap-7',
      className,
    )}
  >
    {children}
  </div>
);

const HeroEyebrow: React.FC<HeroSlotProps> = ({ children, className }) => (
  <Heading.Eyebrow
    tone="accent"
    className={cn('ratio-hero__eyebrow text-xs tracking-[0.16em] mb-5', className)}
  >
    {children}
  </Heading.Eyebrow>
);

const HeroTitle: React.FC<HeroTitleProps> = ({ children, className, as = 'h1' }) => (
  <Heading
    as={as}
    className={cn(
      'ratio-hero__title font-serif font-normal text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance text-(--primary)',
      className,
    )}
  >
    {children}
  </Heading>
);

const HeroLead: React.FC<HeroSlotProps> = ({ children, className }) => (
  <p
    className={cn(
      'ratio-hero__lead text-lg leading-[1.55] text-(--text-muted) max-w-[44ch] mt-6',
      className,
    )}
  >
    {children}
  </p>
);

const HeroActions: React.FC<HeroSlotProps> = ({ children, className }) => (
  <div className={cn('flex gap-3 flex-wrap mt-8', className)}>{children}</div>
);

/**
 * The silhouette slot — one SVG in one colour (`text-*`), anchored to the
 * bottom-right corner and always cropped by the hero's edge. Size it with
 * `className` (`h-40`); the width follows the SVG. Decorative: `aria-hidden`,
 * behind the content, no pointer events.
 */
const HeroMotif: React.FC<HeroMotifProps> = ({ children, className }) => (
  <div
    aria-hidden
    className={cn(
      'ratio-hero__motif pointer-events-none absolute -right-6 -bottom-4 h-28 opacity-50 [&>svg]:h-full [&>svg]:w-auto',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Display text as a background layer — years, a volume number, a date —
 * set huge in outline serif and anchored to the bottom-right corner, cropped
 * by the hero's edge. The stroke is the surface's own ink at 22%, so it
 * reads on a light hero and a memorial alike; override with `className`.
 * Decorative: `aria-hidden`, behind the content, no pointer events.
 */
const HeroWatermark: React.FC<HeroWatermarkProps> = ({ children, className }) => (
  <div aria-hidden className={cn('ratio-hero__watermark', className)}>
    {children}
  </div>
);

export const Hero = Object.assign(HeroRoot, {
  Main: HeroMain,
  Side: HeroSide,
  Eyebrow: HeroEyebrow,
  Title: HeroTitle,
  Motif: HeroMotif,
  Watermark: HeroWatermark,
  Lead: HeroLead,
  Actions: HeroActions,
});
