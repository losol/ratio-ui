// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ElementType, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Teaser.css';

/**
 * `md` is a card in a grid, `lg` the lead story, `row` a line in a compact
 * list. `feature` is the one story on a raised card, its title very large
 * and its lead set as a pull line beside it. `numbered` is a line in a
 * numbered list, behind a large italic numeral: put each in an `<li>` of an
 * `<ol>`, which is where the number comes from.
 */
export type TeaserVariant = 'md' | 'lg' | 'row' | 'feature' | 'numbered';

export interface TeaserProps {
  href: string;
  title: ReactNode;
  /** A kicker above the title: the topic and the date, say. */
  eyebrow?: ReactNode;
  /**
   * The lead; left out in the `row` and `numbered` variants, which have no
   * room for it. In `feature` it is the large pull line beside the title.
   */
  lead?: ReactNode;
  /**
   * The picture, an `<img>` or a framework image. It is fitted to the
   * teaser's frame (3:2, 16:9 for `lg`, 4:3 for `row`), whatever its own size.
   */
  image?: ReactNode;
  variant?: TeaserVariant;
  /** Heading level of the title. Defaults to `h3`: a teaser sits under a section heading. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Routing link component (e.g. Next.js Link). Defaults to `<a>`. */
  LinkComponent?: ElementType;
  className?: string;
}

/**
 * One story as a link — picture, eyebrow, title and lead, in the magazine
 * look. The whole teaser is the link; the title turns primary on hover.
 *
 * @example
 * ```tsx
 * <Teaser
 *   href="/articles/what-a-good-explanation-does"
 *   eyebrow="Teaching · 21 Oct 2026"
 *   title="What a good explanation does, and how to write one"
 *   lead="The best explanations answer the question the reader has not asked yet."
 *   image={<img src="/classroom.jpg" alt="" />}
 *   variant="lg"
 *   LinkComponent={Link}
 * />
 * ```
 */
export const Teaser: React.FC<TeaserProps> = ({
  href,
  title,
  eyebrow,
  lead,
  image,
  variant = 'md',
  titleAs: TitleTag = 'h3',
  LinkComponent = 'a',
  className,
}) => {
  const leadLine = lead && variant !== 'row' && variant !== 'numbered' && (
    <p className="ratio-teaser__lead">{lead}</p>
  );
  return (
    <LinkComponent
      href={href}
      className={cn('ratio-teaser', variant !== 'md' && `ratio-teaser--${variant}`, className)}
    >
      {image && variant !== 'numbered' && <div className="ratio-teaser__frame">{image}</div>}
      <div className="ratio-teaser__body">
        {eyebrow && <p className="ratio-teaser__eyebrow">{eyebrow}</p>}
        <TitleTag className="ratio-teaser__title">{title}</TitleTag>
        {variant !== 'feature' && leadLine}
      </div>
      {/* Beside the body, not in it: the pull line is the card's second column. */}
      {variant === 'feature' && leadLine && <div className="ratio-teaser__aside">{leadLine}</div>}
    </LinkComponent>
  );
};
