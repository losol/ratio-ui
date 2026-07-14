// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useState,
  type ReactNode,
} from 'react';
import { ActionButton } from '../ActionButton';
import { MenuIcon, X } from '../../icons';
import { cn } from '../../utils/cn';

// Disclosure state for Toggle/Collapse pairs. One panel open at a time —
// opening the menu closes the search, and vice versa.
type NavbarDisclosureApi = {
  openPanel: string | null;
  toggle: (id: string) => void;
  panelId: (id: string) => string;
};
const NavbarDisclosureContext = createContext<NavbarDisclosureApi | null>(null);

export interface NavbarProps {
  children?: ReactNode;
  /** Tailwind background class (default `bg-transparent`). */
  bgColor?: string;
  /** Make navbar sticky at the top. Ignored when `overlay` is also set. */
  sticky?: boolean;
  /**
   * Float the navbar over the next sibling (e.g. a hero section) using
   * absolute positioning. Unlike `sticky`, it doesn't reserve layout space
   * and scrolls away with the page. Takes precedence over `sticky` when
   * both are provided.
   */
  overlay?: boolean;
  /**
   * Translucent dark background with backdrop-blur. Composes with `overlay`
   * for a glass hero-overlay look. Pair with `dark` when the resulting
   * background is dark enough that you need light text.
   */
  glass?: boolean;
  /**
   * Marks the navbar as a dark surface so the brand and content text
   * use the light `var(--text)` color. Use for primary-toned navbars
   * or glass overlays on dark heroes.
   */
  dark?: boolean;
  /**
   * Elevation instead of lines ("baren står på en subtil skygge"): card
   * background and a soft shadow, never borders. Centered (default width)
   * it's a floating card with rounded corners from `md`; with `fluid` it's a
   * flat full-width app header. Rows inside are separated by background tone.
   */
  elevated?: boolean;
  /**
   * Full-width row (admin consoles) instead of the centered `container`
   * (marketing pages).
   */
  fluid?: boolean;
  className?: string;
}

export type NavbarRowVariant = 'utility' | 'brand' | 'nav';

export interface NavbarRowProps {
  children?: ReactNode;
  /**
   * Row treatment in a stacked navbar:
   * - `'utility'` — slim top strip on a tinted background (event line,
   *   language switch)
   * - `'brand'` — the main row (logo/tagline, search, CTA)
   * - `'nav'` — the link row; links carry their own vertical padding
   */
  variant?: NavbarRowVariant;
  className?: string;
}

export interface NavbarBrandProps {
  children?: ReactNode;
  className?: string;
}

export interface NavbarContentProps {
  children?: ReactNode;
  className?: string;
}

export interface NavbarSearchProps {
  /** Drop a `SearchField` (or any control) in here — this is just the zone. */
  children?: ReactNode;
  className?: string;
}

export interface NavbarLinksProps {
  children?: ReactNode;
  className?: string;
}

export interface NavbarLinkProps {
  href: string;
  children?: ReactNode;
  /** Optional leading icon — pass a sized element, e.g. `<LayoutGrid size={16} />`. */
  icon?: ReactNode;
  /** Mark as the current page — tinted pill + `aria-current="page"`. */
  isCurrent?: boolean;
  /** Routing link component (e.g. Next.js Link). Defaults to `<a>`. */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: ReactNode;
    className?: string;
  }>;
  className?: string;
}

export interface NavbarToggleProps {
  /**
   * Which `Navbar.Collapse` this button controls (its `id`). Defaults to
   * `'menu'`, so a single pair needs no wiring.
   */
  controls?: string;
  /** Accessible name. `aria-expanded` carries the open/closed state. */
  ariaLabel?: string;
  /** Custom icon(s); default is a burger that morphs into an X when open. */
  children?: ReactNode;
  className?: string;
}

export interface NavbarCollapseProps {
  /** Pairs the panel with a `Navbar.Toggle` (its `controls`). @default 'menu' */
  id?: string;
  children?: ReactNode;
  className?: string;
}

export interface NavbarActionsProps {
  children?: ReactNode;
  className?: string;
}

function NavbarBrand({ children, className }: Readonly<NavbarBrandProps>) {
  return (
    <div className={cn('flex shrink-0 items-center text-(--text)', className)}>
      {children}
    </div>
  );
}

function NavbarContent({ children, className }: Readonly<NavbarContentProps>) {
  return (
    <div className={cn('flex grow items-center gap-3 text-(--text)', className)}>
      {children}
    </div>
  );
}

/**
 * The search zone — grows between brand and links, capping the control at a
 * comfortable width. A slot on purpose: `SearchField` lives in `forms/`,
 * which `core/` can't depend on, so you drop it in from the call site.
 */
function NavbarSearch({ children, className }: Readonly<NavbarSearchProps>) {
  return (
    <div className={cn('flex min-w-0 grow items-center', className)}>
      <div className="w-full max-w-100">{children}</div>
    </div>
  );
}

/** Horizontal pill links — pair with {@link NavbarLink}. */
function NavbarLinks({ children, className }: Readonly<NavbarLinksProps>) {
  return (
    <ul className={cn('flex list-none items-center gap-1 p-0 m-0', className)}>
      {children}
    </ul>
  );
}

function NavbarLink({
  href,
  icon,
  isCurrent,
  LinkComponent,
  className,
  children,
}: Readonly<NavbarLinkProps>) {
  const Tag = (LinkComponent ?? 'a') as React.ElementType;
  return (
    <li className="list-none">
      <Tag
        href={href}
        aria-current={isCurrent ? 'page' : undefined}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
          isCurrent
            ? 'bg-primary-100 font-semibold text-(--text) dark:bg-primary-900'
            : 'text-(--text-muted) hover:bg-card-hover hover:text-(--text)',
          className,
        )}
      >
        {icon && (
          <span aria-hidden className="shrink-0">
            {icon}
          </span>
        )}
        {children}
      </Tag>
    </li>
  );
}

/** Right-hand cluster — bell, theme toggle, user menu. */
function NavbarActions({ children, className }: Readonly<NavbarActionsProps>) {
  return (
    <div className={cn('flex shrink-0 items-center gap-2', className)}>{children}</div>
  );
}

/** Flexible gap — pushes whatever follows to the right edge. */
function NavbarSpacer({ className }: Readonly<{ className?: string }>) {
  return <div aria-hidden className={cn('grow', className)} />;
}

/**
 * The disclosure trigger for {@link NavbarCollapse} — a round burger button
 * that morphs into an X when its panel is open. `aria-expanded` and
 * `aria-controls` are wired via the navbar's disclosure state; typically
 * `md:hidden`. Several pairs can coexist (`controls="search"` etc.) — one
 * panel open at a time.
 */
function NavbarToggle({
  controls = 'menu',
  ariaLabel = 'Menu',
  children,
  className,
}: Readonly<NavbarToggleProps>) {
  const ctx = useContext(NavbarDisclosureContext);
  const expanded = ctx?.openPanel === controls;
  return (
    <ActionButton
      round
      ariaLabel={ariaLabel}
      aria-expanded={expanded}
      // Only reference the panel while it exists — Collapse unmounts when
      // closed, and aria-controls must not point at a missing id.
      aria-controls={expanded ? ctx?.panelId(controls) : undefined}
      onPress={() => ctx?.toggle(controls)}
      className={className}
    >
      {children ?? (
        <span className="inline-flex items-center justify-center">
          <MenuIcon size={17} className="in-aria-expanded:hidden" />
          <X size={17} className="hidden in-aria-expanded:inline" />
        </span>
      )}
    </ActionButton>
  );
}

/**
 * The disclosure panel that folds out under the bar — search, vertical nav,
 * actions. Paired with {@link NavbarToggle} via `id`; typically `md:hidden`.
 */
function NavbarCollapse({ id = 'menu', children, className }: Readonly<NavbarCollapseProps>) {
  const ctx = useContext(NavbarDisclosureContext);
  if (ctx?.openPanel !== id) return null;
  return (
    <div id={ctx.panelId(id)} className={cn('w-full px-4 py-4', className)}>
      {children}
    </div>
  );
}

const ROW_VARIANT_CLASSES: Record<NavbarRowVariant, string> = {
  utility:
    'flex items-center justify-between gap-3 px-5 py-2 text-[11.5px] text-(--text-muted) ' +
    'bg-secondary-100 dark:bg-white/5',
  brand: 'flex items-center justify-between gap-4 px-5 pt-4 pb-3',
  nav: 'flex items-center gap-3 px-5',
};

/**
 * One row in a stacked navbar (see the `elevated` editorial layout). Rows are
 * separated by background tone, never borders. Without `variant` you get a
 * plain flex row.
 */
function NavbarRow({ children, variant, className }: Readonly<NavbarRowProps>) {
  return (
    <div
      className={cn(
        variant ? ROW_VARIANT_CLASSES[variant] : 'flex items-center gap-3 px-5 py-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

const NavbarRoot = ({
  children,
  bgColor,
  sticky = false,
  overlay = false,
  glass = false,
  dark = false,
  elevated = false,
  fluid = false,
  className,
}: Readonly<NavbarProps>) => {
  const uid = useId();
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const disclosureApi: NavbarDisclosureApi = {
    openPanel,
    toggle: (id) => setOpenPanel((cur) => (cur === id ? null : id)),
    panelId: (id) => `${uid}-${id}`,
  };
  // Unwrap fragments when collecting children — Children.toArray treats
  // <>…</> as a single opaque child (same fix as Tabs), which would break
  // Row detection and Collapse extraction for conditionally grouped parts.
  const flattenChildren = (nodes: ReactNode): ReturnType<typeof Children.toArray> =>
    Children.toArray(nodes).flatMap((c) =>
      isValidElement(c) && c.type === React.Fragment
        ? flattenChildren((c.props as { children?: ReactNode }).children)
        : [c],
    );
  const childArray = flattenChildren(children);
  // With Navbar.Row children the rows own their layout — the inner wrapper
  // just stacks them full-bleed (width still follows container/fluid).
  const hasRows = childArray.some((c) => isValidElement(c) && c.type === NavbarRow);
  // Navbar.Collapse panels render BELOW the bar row; each pairs with a
  // Navbar.Toggle through the disclosure context (one open at a time).
  const collapses = childArray.filter((c) => isValidElement(c) && c.type === NavbarCollapse);
  const barChildren = collapses.length
    ? childArray.filter((c) => !collapses.includes(c))
    : childArray;
  // overlay takes precedence over sticky when both are passed.
  const positionClass = overlay
    ? 'absolute top-0 left-0 right-0 z-50'
    : sticky
      ? 'sticky top-0 z-50'
      : '';
  const glassClass = glass ? 'bg-overlay-drag backdrop-blur-md' : '';

  return (
    <nav
      className={cn(
        bgColor,
        positionClass,
        glassClass,
        dark && 'surface-dark',
        // Elevation, never lines. Fluid bars stay flat (app header); centered
        // bars become a floating card from md (full-bleed below).
        elevated &&
          'bg-card overflow-hidden shadow-[0_12px_32px_-18px_rgb(20_30_60/0.3)] dark:shadow-[0_14px_36px_-18px_rgb(0_0_0/0.55)]',
        elevated && !fluid && 'rounded-none md:rounded-xl',
        // With rows, the width constraint sits on the bar itself so the rows
        // (and their background tones) always span the full card.
        hasRows && !fluid && 'container mx-auto',
        'text-(--text) m-0 p-0',
        className,
      )}
    >
      <NavbarDisclosureContext.Provider value={disclosureApi}>
        <div
          className={cn(
            hasRows
              ? 'w-full'
              : cn(
                  'flex flex-wrap items-center gap-3 py-2 px-3',
                  fluid ? 'w-full px-4' : 'container mx-auto',
                ),
          )}
        >
          {barChildren}
        </div>
        {collapses}
      </NavbarDisclosureContext.Provider>
    </nav>
  );
};

/**
 * Navbar — the app/site header, composed from parts:
 *
 * ```tsx
 * <Navbar sticky elevated fluid>
 *   <Navbar.Brand>…logo…</Navbar.Brand>
 *   <Navbar.Search><SearchField size="sm" … /></Navbar.Search>
 *   <Navbar.Links>
 *     <Navbar.Link href="/" isCurrent>Dashboard</Navbar.Link>
 *     <Navbar.Link href="/resources">Resources</Navbar.Link>
 *   </Navbar.Links>
 *   <Navbar.Spacer />
 *   <Navbar.Actions>…bell, user menu…</Navbar.Actions>
 * </Navbar>
 * ```
 */
export const Navbar = Object.assign(NavbarRoot, {
  Row: NavbarRow,
  Toggle: NavbarToggle,
  Collapse: NavbarCollapse,
  Brand: NavbarBrand,
  Content: NavbarContent,
  Search: NavbarSearch,
  Links: NavbarLinks,
  Link: NavbarLink,
  Actions: NavbarActions,
  Spacer: NavbarSpacer,
});
