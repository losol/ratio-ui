// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type CSSProperties, type ReactNode } from 'react';

import { Heading } from '../../core/Heading';
import { Container } from '../../layout/Container';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';

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
}

export interface HeroSlotProps {
  children?: ReactNode;
  className?: string;
}

export interface HeroTitleProps extends HeroSlotProps {
  /** Heading level. Defaults to 1 — heroes are usually the page's primary heading. */
  as?: 'h1' | 'h2';
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
}) => {
  // Detect whether the consumer included a Hero.Side so we can drop the
  // second grid column when there's nothing to put in it. Without this
  // the main content would float in the left half on lg+ with empty
  // space on the right.
  const hasSide = React.Children.toArray(children).some(
    child => React.isValidElement(child) && child.type === HeroSide,
  );

  const combinedStyle = buildCoverImageStyle(backgroundImageUrl, style);

  return (
    <section
      className={cn(
        'py-(--space-2xl) border-b border-border-1 relative overflow-hidden',
        dark && 'surface-dark',
        className,
      )}
      style={combinedStyle}
    >
      <Container>
        <div
          className={cn(
            'grid gap-12 items-center',
            hasSide ? 'lg:grid-cols-[1.4fr_1fr]' : 'lg:grid-cols-1',
          )}
        >
          {children}
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
    className={cn('text-xs tracking-[0.16em] mb-5', className)}
  >
    {children}
  </Heading.Eyebrow>
);

const HeroTitle: React.FC<HeroTitleProps> = ({ children, className, as = 'h1' }) => (
  <Heading
    as={as}
    className={cn(
      'font-serif font-normal text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance text-(--primary)',
      className,
    )}
  >
    {children}
  </Heading>
);

const HeroLead: React.FC<HeroSlotProps> = ({ children, className }) => (
  <p
    className={cn(
      'text-lg leading-[1.55] text-(--text-muted) max-w-[44ch] mt-6',
      className,
    )}
  >
    {children}
  </p>
);

const HeroActions: React.FC<HeroSlotProps> = ({ children, className }) => (
  <div className={cn('flex gap-3 flex-wrap mt-8', className)}>{children}</div>
);

export const Hero = Object.assign(HeroRoot, {
  Main: HeroMain,
  Side: HeroSide,
  Eyebrow: HeroEyebrow,
  Title: HeroTitle,
  Lead: HeroLead,
  Actions: HeroActions,
});
