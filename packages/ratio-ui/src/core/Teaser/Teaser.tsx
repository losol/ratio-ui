// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ElementType, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Teaser.css';

/** `md` is a card in a grid, `lg` the lead story, `row` a line in a compact list. */
export type TeaserVariant = 'md' | 'lg' | 'row';

export interface TeaserProps {
  href: string;
  title: ReactNode;
  /** A kicker above the title: the topic and the date, say. */
  eyebrow?: ReactNode;
  /** The lead; left out in the `row` variant, which has no room for it. */
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
 *   href="/no/c/artikler/ny-giv--abc1234"
 *   eyebrow="Nyheter · 21. okt. 2026"
 *   title="Ny giv for allmennlegetjenesten i nord"
 *   lead="Helsetjenesten er i endring."
 *   image={<img src="/kontor.jpg" alt="" />}
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
}) => (
  <LinkComponent
    href={href}
    className={cn('ratio-teaser', variant !== 'md' && `ratio-teaser--${variant}`, className)}
  >
    {image && <div className="ratio-teaser__frame">{image}</div>}
    <div className="ratio-teaser__body">
      {eyebrow && <p className="ratio-teaser__eyebrow">{eyebrow}</p>}
      <TitleTag className="ratio-teaser__title">{title}</TitleTag>
      {lead && variant !== 'row' && <p className="ratio-teaser__lead">{lead}</p>}
    </div>
  </LinkComponent>
);
