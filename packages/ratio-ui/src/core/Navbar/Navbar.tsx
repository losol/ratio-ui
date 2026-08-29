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

export interface NavbarProps extends React.ComponentPropsWithoutRef<'nav'> {
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
   * Frosted glass: the page surface at 88% (`--surface-glass`) with a
   * backdrop blur, so content shows through as the bar pins or floats.
   * Follows the token context — light on a light page, dark inside `dark`
   * (the hero-overlay look, with `overlay`).
   */
  glass?: boolean;
  /**
   * Marks the navbar as a dark surface — a local dark token context, so
   * brand, content text, muted tones and borders take the dark theme's
   * values. Use for primary-toned navbars or glass overlays on dark heroes.
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
  /**
   * Painted zones behind the bar — one soft pill per colour, side by side,
   * blended into the bar's own background (`multiply` on a light bar,
   * `screen` on a dark one) so the bar's text stays legible over each. The
   * bar is isolated while a wash is on, so the blend never reaches the
   * page behind it — give the bar a background (`bgColor`, `glass`) for
   * the zones to tint. The occasion slot for flag colours (pride, a
   * national day, a season); the app owns the list and must check AA
   * contrast of the bar text over every colour.
   */
  wash?: readonly string[];
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
  /**
   * Explicit `aria-current` — `"location"` for an in-page anchor, where
   * `"page"` would be wrong. Every value except `false` / `"false"` (the
   * ARIA spellings of "not current") gets the current styling.
   */
  'aria-current'?: React.AriaAttributes['aria-current'];
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

export interface NavbarMotifProps {
  /** The motif — an inline SVG in one colour, drawn in `currentColor`. */
  children?: ReactNode;
  /**
   * Slide in once on page load — 16px from the right over 700 ms, then
   * still. Never a loop. Off under `prefers-reduced-motion` and under
   * `data-motion="none"`.
   */
  entry?: boolean;
  className?: string;
}

export function NavbarBrand({ children, className }: Readonly<NavbarBrandProps>) {
  return (
    <div className={cn('ratio-navbar__brand flex shrink-0 items-center text-(--text)', className)}>
      {children}
    </div>
  );
}

export function NavbarContent({ children, className }: Readonly<NavbarContentProps>) {
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
export function NavbarSearch({ children, className }: Readonly<NavbarSearchProps>) {
  return (
    <div className={cn('flex min-w-0 grow items-center', className)}>
      <div className="w-full max-w-100">{children}</div>
    </div>
  );
}

/** Horizontal pill links — pair with {@link NavbarLink}. */
export function NavbarLinks({ children, className }: Readonly<NavbarLinksProps>) {
  return (
    <ul className={cn('ratio-navbar__links flex list-none items-center gap-1 p-0 m-0', className)}>
      {children}
    </ul>
  );
}

export function NavbarLink({
  href,
  icon,
  isCurrent,
  'aria-current': ariaCurrentProp,
  LinkComponent,
  className,
  children,
}: Readonly<NavbarLinkProps>) {
  const Tag = (LinkComponent ?? 'a') as React.ElementType;
  const ariaCurrent = ariaCurrentProp ?? (isCurrent ? 'page' : undefined);
  const current = ariaCurrent !== undefined && ariaCurrent !== false && ariaCurrent !== 'false';
  return (
    <li className="list-none">
      <Tag
        href={href}
        aria-current={ariaCurrent}
        className={cn(
          'ratio-navbar__link inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
          current
            ? 'bg-primary-100 font-semibold text-(--text) dark:bg-primary-900 [.surface-dark_&]:bg-primary-900'
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
export function NavbarActions({ children, className }: Readonly<NavbarActionsProps>) {
  return (
    <div className={cn('ratio-navbar__actions flex shrink-0 items-center gap-2', className)}>{children}</div>
  );
}

/** Flexible gap — pushes whatever follows to the right edge. */
export function NavbarSpacer({ className }: Readonly<{ className?: string }>) {
  return <div aria-hidden className={cn('grow', className)} />;
}

/**
 * The motif slot at the bar's right edge — one silhouette per occasion (a
 * sleigh in December, a flag at half mast), never content. A fixed 32px
 * tall; the width follows the SVG. Hidden below 880px, where the bar has
 * no room to spare. Decorative, so `aria-hidden`.
 */
export function NavbarMotif({ children, entry = false, className }: Readonly<NavbarMotifProps>) {
  return (
    <div
      aria-hidden
      className={cn(
        'ratio-navbar__motif hidden h-8 shrink-0 items-center min-[55rem]:flex [&>svg]:h-full [&>svg]:w-auto',
        entry && 'animate-motif-in motion-reduce:animate-none',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * The disclosure trigger for {@link NavbarCollapse} — a round burger button
 * that morphs into an X when its panel is open. `aria-expanded` and
 * `aria-controls` are wired via the navbar's disclosure state; typically
 * `md:hidden`. Several pairs can coexist (`controls="search"` etc.) — one
 * panel open at a time.
 */
export function NavbarToggle({
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
export function NavbarCollapse({ id = 'menu', children, className }: Readonly<NavbarCollapseProps>) {
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
export function NavbarRow({ children, variant, className }: Readonly<NavbarRowProps>) {
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

export const NavbarRoot = ({
  children,
  bgColor,
  sticky = false,
  overlay = false,
  glass = false,
  dark = false,
  elevated = false,
  fluid = false,
  wash,
  className,
  ...rest
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
  // overlay takes precedence over sticky when both are passed. A static bar
  // is still positioned, so the wash layer anchors to it.
  const positionClass = overlay
    ? 'absolute top-0 left-0 right-0 z-50'
    : sticky
      ? 'sticky top-0 z-50'
      : 'relative';
  const glassClass = glass ? 'bg-surface-glass backdrop-blur-md' : '';
  const zones = wash?.length ?? 0;

  return (
    <nav
      {...rest}
      className={cn(
        'ratio-navbar',
        bgColor,
        positionClass,
        glassClass,
        // Keep the wash's blend inside the bar, off the page behind it.
        zones > 0 && 'isolate',
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
      {zones > 0 && (
        // multiply tints a light bar; on a dark one it goes black, so the
        // dark theme and a `dark` bar switch to screen.
        <div
          aria-hidden
          className="ratio-navbar__wash pointer-events-none absolute inset-0 overflow-hidden mix-blend-multiply dark:mix-blend-screen [.surface-dark_&]:mix-blend-screen"
        >
          {wash!.map((color, i) => (
            <span
              key={`${i}-${color}`}
              className="absolute h-[180%] rounded-full opacity-45"
              style={{
                left: `${(i / zones) * 100 - 6}%`,
                width: `${100 / zones + 14}%`,
                top: i % 2 ? '-30%' : '-40%',
                background: color,
              }}
            />
          ))}
        </div>
      )}
      <NavbarDisclosureContext.Provider value={disclosureApi}>
        <div
          className={cn(
            'relative',
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
