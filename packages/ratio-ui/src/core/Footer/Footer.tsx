// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { Container } from '../../layout/Container';
import { cn } from '../../utils/cn';
import { ObfuscatedEmail } from '../ObfuscatedEmail';
import './Footer.css';

export interface Publisher {
  name: string;
  address: string;
  phone: string;
  email: string;
  organizationNumber?: string;
}

export interface FooterProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Render the footer as a dark surface — a deep `--color-primary-950`
   * background, and a local dark token scope so every block's semantic tokens
   * (`--text`, `--text-muted`, `--text-subtle`, `--border-*`) resolve to the
   * light-on-dark values from the dark theme. Use to anchor the bottom of the
   * page with a deep block regardless of the page theme.
   */
  dark?: boolean;
}

export interface FooterClassicProps extends FooterProps {
  siteTitle?: string;
  publisher?: Publisher;
}

// ── Brand ──────────────────────────────────────────────────────────────────

export interface FooterBrandProps {
  /** Logo mark rendered before the wordmark (an SVG, `<img>`, …). */
  logo?: React.ReactNode;
  /** The wordmark / site name. */
  name: React.ReactNode;
  /** A short mission line, set in the display serif italic. */
  mission?: React.ReactNode;
  className?: string;
  /** Extra content below the mission — e.g. a `<Footer.Social>` row. */
  children?: React.ReactNode;
}

const FooterBrand: React.FC<FooterBrandProps> = ({ logo, name, mission, className, children }) => (
  <div className={className}>
    <div className="ratio-footer__brand-row">
      {logo}
      <span className="ratio-footer__wordmark">{name}</span>
    </div>
    {mission ? <p className="ratio-footer__mission">{mission}</p> : null}
    {children ? <div className="mt-5">{children}</div> : null}
  </div>
);

// ── LinkColumn + Link ────────────────────────────────────────────────────────

export interface FooterLinkColumnProps {
  /** Column heading, shown as a small uppercased eyebrow. */
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({ title, children, className }) => (
  <div className={cn('ratio-footer__col', className)}>
    <h4 className="ratio-footer__col-title">{title}</h4>
    {children}
  </div>
);

export interface FooterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** A small badge after the label, e.g. "New" or "Beta". */
  tag?: React.ReactNode;
  /** Mark as off-site: adds an external-link arrow and `target`/`rel`. */
  external?: boolean;
  /**
   * Render as a custom link component (e.g. a router `Link`). It receives the
   * same props — including `href` — so an adapter can map `href` to its own API.
   * Defaults to a plain `<a>`.
   */
  as?: React.ElementType;
}

const FooterLink: React.FC<FooterLinkProps> = ({
  tag,
  external,
  as: Component = 'a',
  className,
  children,
  ...rest
}) => {
  // `external` guarantees the safe defaults even if the caller passes their own
  // target/rel: target defaults to _blank but is overridable, while
  // noopener/noreferrer are always merged into rel (deduped) so the anti-
  // tabnabbing protection can't be dropped. Spread after `rest` so these win.
  const externalProps = external
    ? {
        target: rest.target ?? '_blank',
        rel: [...new Set(`${rest.rel ?? ''} noopener noreferrer`.trim().split(/\s+/))].join(' '),
      }
    : undefined;
  return (
    <Component className={cn('ratio-footer__link', className)} {...rest} {...externalProps}>
      {children}
      {tag ? <span className="ratio-footer__tag">{tag}</span> : null}
      {external ? <ArrowUpRight className="ratio-footer__link-external" aria-hidden /> : null}
    </Component>
  );
};

// ── Publisher ────────────────────────────────────────────────────────────────

export interface FooterPublisherProps {
  publisher: Publisher;
  className?: string;
}

const FooterPublisher: React.FC<FooterPublisherProps> = ({ publisher, className }) => (
  <div className={cn('ratio-footer__publisher', className)}>
    <div className="ratio-footer__publisher-name">{publisher.name}</div>
    <p>{publisher.address}</p>
    <p>{publisher.phone}</p>
    {publisher.email ? <ObfuscatedEmail email={publisher.email} className="block" /> : null}
    {publisher.organizationNumber ? (
      <div className="ratio-footer__publisher-org">Org.nr. {publisher.organizationNumber}</div>
    ) : null}
  </div>
);

// ── Newsletter (bring your own form) ─────────────────────────────────────────

export interface FooterNewsletterProps {
  /** Heading, set in the display serif. */
  label: React.ReactNode;
  /** Optional supporting line under the label. */
  hint?: React.ReactNode;
  /** The signup form — an input + `Button`, or whatever the app uses. */
  children?: React.ReactNode;
  className?: string;
}

const FooterNewsletter: React.FC<FooterNewsletterProps> = ({ label, hint, children, className }) => (
  <div className={cn('ratio-footer__newsletter', className)}>
    <div className="ratio-footer__newsletter-label">{label}</div>
    {hint ? <p className="ratio-footer__newsletter-hint">{hint}</p> : null}
    {children}
  </div>
);

// ── Social ───────────────────────────────────────────────────────────────────

export interface FooterSocialProps {
  children?: React.ReactNode;
  className?: string;
}

export interface FooterSocialItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Accessible name for the icon-only link — becomes `aria-label` + `title`. */
  label: string;
  /** Render as a custom link component (e.g. a router `Link`). Defaults to `<a>`. */
  as?: React.ElementType;
  /** The icon. */
  children?: React.ReactNode;
}

interface FooterSocialComponent extends React.FC<FooterSocialProps> {
  Item: React.FC<FooterSocialItemProps>;
}

const FooterSocial = ((({ children, className }: FooterSocialProps) => (
  <div className={cn('ratio-footer__social', className)}>{children}</div>
)) as FooterSocialComponent);

const FooterSocialItem: React.FC<FooterSocialItemProps> = ({
  label,
  as: Component = 'a',
  className,
  children,
  ...rest
}) => (
  <Component
    className={cn('ratio-footer__social-item', className)}
    aria-label={label}
    title={label}
    {...rest}
  >
    {children}
  </Component>
);

FooterSocial.Item = FooterSocialItem;

// ── BottomBar ────────────────────────────────────────────────────────────────

export interface FooterBottomBarProps {
  /** Left slot — typically the copyright line. */
  copyright?: React.ReactNode;
  /** Right slot — legal links, a language switch, etc. */
  children?: React.ReactNode;
  /**
   * Draw the subtle top rule that separates the bar from the footer body.
   * Default `true`; set `false` for a single-row compact footer where there is
   * no body above it.
   */
  divider?: boolean;
  className?: string;
}

const FooterBottomBar: React.FC<FooterBottomBarProps> = ({
  copyright,
  children,
  divider = true,
  className,
}) => (
  <div className={cn('ratio-footer__bottom', !divider && 'ratio-footer__bottom--flush', className)}>
    {/* Rendered directly, not wrapped in a <span>, so a block-level copyright
        node (e.g. a <div>) doesn't produce invalid nesting. The links cluster
        keeps to the right via margin-left:auto even when copyright is absent. */}
    {copyright}
    {children ? <div className="ratio-footer__bottom-links">{children}</div> : null}
  </div>
);

// ── Shell + compound assembly ────────────────────────────────────────────────

interface FooterComponent extends React.FC<FooterProps> {
  Classic: React.FC<FooterClassicProps>;
  Brand: React.FC<FooterBrandProps>;
  LinkColumn: React.FC<FooterLinkColumnProps>;
  Link: React.FC<FooterLinkProps>;
  Publisher: React.FC<FooterPublisherProps>;
  Newsletter: React.FC<FooterNewsletterProps>;
  Social: FooterSocialComponent;
  BottomBar: React.FC<FooterBottomBarProps>;
}

/**
 * Thin `<footer>` shell with the standard background, padding, and `Container`
 * wrapper. Compose your own layout from the building blocks — `Footer.Brand`,
 * `Footer.LinkColumn` (with `Footer.Link`), `Footer.Publisher`,
 * `Footer.Newsletter`, `Footer.Social` (with `Footer.Social.Item`) and
 * `Footer.BottomBar` — or use `Footer.Classic` for the legacy fixed layout.
 * Everything is token-driven; set `dark` to anchor the page with a deep block.
 */
const FooterRoot: FooterComponent = (({ children, className, dark }: FooterProps) => (
  <footer
    className={cn(
      'p-3 pt-10',
      dark ? 'ratio-footer--dark bg-primary-950' : 'bg-overlay-press',
      className,
    )}
  >
    <Container>{children}</Container>
  </footer>
)) as FooterComponent;

/**
 * Pre-2.0 Footer layout — siteTitle and an optional publisher block on the
 * left, children stacked next to it via `md:flex md:justify-between`.
 *
 * Renders the `Footer` shell underneath so wrapper styles (background, padding,
 * surface tone, Container) live in exactly one place.
 *
 * Kept as a backward-compat wrapper for the four `apps/web` layouts and
 * `apps/historia` that already shipped with this exact shape. New code should
 * compose the building blocks (`Footer.Brand`, `Footer.LinkColumn`, …) inside
 * the `<Footer>` shell instead.
 */
const FooterClassic: React.FC<FooterClassicProps> = ({
  siteTitle,
  publisher,
  children,
  className,
  dark,
}) => (
  <FooterRoot className={className} dark={dark}>
    <div className="md:flex md:justify-between">
      {siteTitle && (
        <div className="mb-6 md:mb-0">
          <span className="self-center text-xl font-semibold whitespace-nowrap">{siteTitle}</span>
          {publisher && (
            <div className="mt-2 font-light leading-tight">
              <p>{publisher.name}</p>
              <p>{publisher.address}</p>
              <p>{publisher.phone}</p>
              {publisher.email && <ObfuscatedEmail email={publisher.email} className="block" />}
              {publisher.organizationNumber && <p>Org.nr. {publisher.organizationNumber}</p>}
            </div>
          )}
        </div>
      )}
      {children && <div>{children}</div>}
    </div>
  </FooterRoot>
);

FooterRoot.Classic = FooterClassic;
FooterRoot.Brand = FooterBrand;
FooterRoot.LinkColumn = FooterLinkColumn;
FooterRoot.Link = FooterLink;
FooterRoot.Publisher = FooterPublisher;
FooterRoot.Newsletter = FooterNewsletter;
FooterRoot.Social = FooterSocial;
FooterRoot.BottomBar = FooterBottomBar;

export const Footer = FooterRoot;
