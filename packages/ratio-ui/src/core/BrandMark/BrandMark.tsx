// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './BrandMark.css';

export type BrandMarkLayout = 'row' | 'stacked';
export type BrandMarkSize = 'md' | 'lg';

export interface BrandMarkProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /**
   * Element to render. Defaults to `div`; `a` (or a router link that takes
   * `href`) with `href` makes the mark the link home.
   */
  as?: React.ElementType;
  href?: string;
  /** `row`: the logo beside the text. `stacked`: the logo above it. */
  layout?: BrandMarkLayout;
  /** `md` for a navbar (40px logo), `lg` for a footer or a cover (56px). */
  size?: BrandMarkSize;
  className?: string;
}

export interface BrandMarkLogoProps {
  /** The logo image. Without `src` or `children`, a placeholder shows where it goes. */
  src?: string;
  /** Alt text for `src`. Empty when the name beside it already says who it is. */
  alt?: string;
  /** A logo of your own instead of `src`: an inline SVG, an `<Image>`, a picture. */
  children?: ReactNode;
  /** Text inside the placeholder, e.g. "Logo". Only shown without `src` and `children`. */
  placeholder?: ReactNode;
  /** Outline of the placeholder: a plain box, or a heraldic shield for a coat of arms. */
  shape?: 'box' | 'shield';
  className?: string;
}

export interface BrandMarkTextProps {
  children?: ReactNode;
  className?: string;
}

/**
 * The logo slot. Takes an image by `src`, any logo element as children,
 * or neither — then a dashed placeholder stands in until the file exists.
 */
const BrandMarkLogo = ({ src, alt = '', children, placeholder, shape = 'box', className }: BrandMarkLogoProps) => (
  <span className={cn('ratio-brand-mark__logo', className)}>
    {children ??
      (src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="ratio-brand-mark__placeholder" data-shape={shape} aria-hidden="true">
          {placeholder}
        </span>
      ))}
  </span>
);
BrandMarkLogo.displayName = 'BrandMark.Logo';

/** The name: the organisation, product or site. Display face, bold. */
const BrandMarkName = ({ children, className }: BrandMarkTextProps) => (
  <span className={cn('ratio-brand-mark__name', className)}>{children}</span>
);
BrandMarkName.displayName = 'BrandMark.Name';

/** A second line under the name: who runs it, or what it is. */
const BrandMarkSubtitle = ({ children, className }: BrandMarkTextProps) => (
  <span className={cn('ratio-brand-mark__subtitle', className)}>{children}</span>
);
BrandMarkSubtitle.displayName = 'BrandMark.Subtitle';

/** A slogan, set small in capitals. */
const BrandMarkTagline = ({ children, className }: BrandMarkTextProps) => (
  <span className={cn('ratio-brand-mark__tagline', className)}>{children}</span>
);
BrandMarkTagline.displayName = 'BrandMark.Tagline';

/**
 * A brand mark composed of parts: a logo slot and the text beside it — a
 * name, a subtitle, a tagline, each optional. The text parts are grouped
 * in a column next to the logo (or under it, `layout="stacked"`). Colour is
 * inherited, so the mark works on a navbar, a card or a coloured band.
 *
 * @beta The prop shape and slot contract may change before release.
 *
 * @example
 * ```tsx
 * <BrandMark as="a" href="/">
 *   <BrandMark.Logo src="/logo.svg" />
 *   <BrandMark.Name>Ratio</BrandMark.Name>
 *   <BrandMark.Subtitle>Design system</BrandMark.Subtitle>
 * </BrandMark>
 * ```
 */
const BrandMarkRoot: React.FC<BrandMarkProps> = ({
  as: Component = 'div',
  layout = 'row',
  size = 'md',
  className,
  children,
  ...rest
}) => {
  // The logo stands apart; everything else stacks in the text column.
  const items = React.Children.toArray(children);
  const logo = items.filter(child => React.isValidElement(child) && child.type === BrandMarkLogo);
  const text = items.filter(child => !(React.isValidElement(child) && child.type === BrandMarkLogo));
  return (
    <Component
      className={cn('ratio-brand-mark', className)}
      data-layout={layout}
      data-size={size}
      {...rest}
    >
      {logo}
      {text.length > 0 ? <span className="ratio-brand-mark__text">{text}</span> : null}
    </Component>
  );
};
BrandMarkRoot.displayName = 'BrandMark';

export const BrandMark = Object.assign(BrandMarkRoot, {
  Logo: BrandMarkLogo,
  Name: BrandMarkName,
  Subtitle: BrandMarkSubtitle,
  Tagline: BrandMarkTagline,
});
