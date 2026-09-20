// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';

import { ActionButton } from '../ActionButton';
import { ChevronDown, X } from '../../icons';
import { DescriptionList } from '../DescriptionList';
import type { Status } from '../../tokens/colors';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';
import './Panel.css';

/** Status vocabulary, shared with `Badge`, `Announcement` and `Card`. */
export type PanelStatus = Status;

/** How the status is drawn on the edge of the panel. */
export type PanelAccent = 'none' | 'pill' | 'flush' | 'top' | 'ring' | 'tint';

/** What the panel sits on. */
export type PanelSurface = 'filled' | 'card' | 'outline' | 'transparent';

/** v1 presets over `accent` + `surface`. @deprecated Prefer `accent` and `surface`. */
export type PanelVariant = 'alert' | 'callout' | 'notice';

export type PanelSize = 'sm' | 'md' | 'lg';

export interface PanelProps extends SpacingProps {
  children?: ReactNode;
  /** Colour of the signal. @default 'neutral' */
  status?: PanelStatus;
  /** Edge treatment of the status. @default 'none' */
  accent?: PanelAccent;
  /** Fill behind the content. @default 'filled' */
  surface?: PanelSurface;
  /**
   * v1 preset: `alert` = flush + filled, `callout` = outline, `notice` =
   * filled. Only applies where `accent`/`surface` are not given.
   * @deprecated Set `accent` and `surface` directly.
   */
  variant?: PanelVariant;
  /** Padding and title step. @default 'md' */
  size?: PanelSize;
  /** Turn the header into a native `<details>` disclosure. */
  collapsible?: boolean;
  /** Open state for an uncontrolled disclosure. @default true */
  defaultOpen?: boolean;
  /** Open state for a controlled disclosure — pair with `onToggle`. */
  open?: boolean;
  /** Called with the new open state when the disclosure opens or closes. */
  onToggle?: (open: boolean) => void;
  /** Render a dismiss button. The panel does not hide itself; the caller unmounts it. */
  dismissible?: boolean;
  /** Called when the dismiss button is pressed. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. @default 'Dismiss' */
  dismissLabel?: string;
  /** Replace the body with a skeleton and set `aria-busy`. */
  loading?: boolean;
  /** Render the root as a link with a hover surface. Excludes `collapsible`. */
  href?: string;
  /** Rendered element when neither `href` nor `collapsible` applies. @default 'section' */
  as?: React.ElementType;
  /**
   * Live-region role. Left unset the panel derives one from `status`:
   * `error` announces as `alert`, `info`/`success`/`warning` as `status`,
   * and `neutral` gets none — a panel without a signal is not news.
   * Pass `null` to opt a status panel out of the live region entirely,
   * which is what server-rendered content wants. Not applied with `href` or
   * `collapsible`: a link or a `<details>` keeps its native role.
   */
  role?: 'status' | 'alert' | null;
  className?: string;
  testId?: string;
}

/**
 * Every treatment below reads the same four variables, so a status is one
 * entry here instead of a row per variant. `neutral` is the only one that
 * has no semantic status token set yet and borrows the card surface.
 */
const STATUS_VARS: Record<PanelStatus, string> = {
  neutral:
    '[--panel-solid:var(--color-neutral-500)] [--panel-bg:var(--card)] [--panel-border:var(--border-1)] [--panel-text:var(--text)]',
  info: '[--panel-solid:var(--color-info)] [--panel-bg:var(--color-info-bg)] [--panel-border:var(--color-info-border)] [--panel-text:var(--color-info-text)]',
  success:
    '[--panel-solid:var(--color-success)] [--panel-bg:var(--color-success-bg)] [--panel-border:var(--color-success-border)] [--panel-text:var(--color-success-text)]',
  warning:
    '[--panel-solid:var(--color-warning)] [--panel-bg:var(--color-warning-bg)] [--panel-border:var(--color-warning-border)] [--panel-text:var(--color-warning-text)]',
  error:
    '[--panel-solid:var(--color-error)] [--panel-bg:var(--color-error-bg)] [--panel-border:var(--color-error-border)] [--panel-text:var(--color-error-text)]',
};

const SURFACE_CLASSES: Record<PanelSurface, string> = {
  filled: 'border bg-(--panel-bg) border-(--panel-border) text-(--panel-text)',
  card: 'border bg-card border-border-1',
  outline: 'border bg-transparent border-(--panel-border)',
  transparent: 'border-0 bg-transparent',
};

/**
 * The stripe is a `::before`, not an element, so the slots underneath stay
 * the panel's first child and keep their `:first-child` padding.
 */
const ACCENT_CLASSES: Record<PanelAccent, string> = {
  none: '',
  // Stripe runs the full left edge, so the radius there is squared off.
  flush:
    "overflow-hidden rounded-l-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-(--panel-solid) before:content-['']",
  pill: "before:absolute before:top-3 before:bottom-3 before:left-2 before:w-1 before:rounded-full before:bg-(--panel-solid) before:content-['']",
  top: "overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-(--panel-solid) before:content-['']",
  ring: 'border-2 border-(--panel-solid)',
  // Header carries the tint; the body falls back to the card surface.
  tint: 'overflow-hidden bg-card border-(--panel-border)',
};

/** Padding, title step and the extra left inset a stripe needs, as variables the slots read. */
const SIZE_VARS: Record<PanelSize, string> = {
  sm: '[--panel-px:0.875rem] [--panel-py:0.75rem] [--panel-title:0.875rem] [--panel-gap:0.625rem]',
  md: '[--panel-px:1rem] [--panel-py:0.875rem] [--panel-title:0.9375rem] [--panel-gap:0.75rem]',
  lg: '[--panel-px:1.25rem] [--panel-py:1rem] [--panel-title:1rem] [--panel-gap:0.75rem]',
};

const ACCENT_INSET: Record<PanelAccent, Record<PanelSize, string>> = {
  none: { sm: '', md: '', lg: '' },
  ring: { sm: '', md: '', lg: '' },
  top: { sm: '', md: '', lg: '' },
  tint: { sm: '', md: '', lg: '' },
  flush: {
    sm: '[--panel-pl:1.125rem]',
    md: '[--panel-pl:1.25rem]',
    lg: '[--panel-pl:1.5rem]',
  },
  pill: {
    sm: '[--panel-pl:1.375rem]',
    md: '[--panel-pl:1.5rem]',
    lg: '[--panel-pl:1.75rem]',
  },
};

const VARIANT_PRESETS: Record<
  PanelVariant,
  { accent: PanelAccent; surface: PanelSurface }
> = {
  alert: { accent: 'flush', surface: 'filled' },
  callout: { accent: 'none', surface: 'outline' },
  notice: { accent: 'none', surface: 'filled' },
};

/** Shared by every slot so padding stays in one place. */
const SLOT_X = 'pl-(--panel-pl) pr-(--panel-px)';

// The dismiss button (and any ActionButton dropped into a slot) takes the
// panel's own colour instead of the page's muted text — same token trick
// `Announcement` uses.
const CHROME_TOKENS = [
  '[--action-button-fg:currentColor]',
  '[--action-button-fg-hover:currentColor]',
  '[--action-button-border:transparent]',
  '[--action-button-bg-hover:color-mix(in_oklch,currentColor_15%,transparent)]',
].join(' ');

const isSlot = (child: ReactNode, name: string): boolean =>
  React.isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === name;

/**
 * Panel — a bordered block that carries a status: a warning in a form, a
 * receipt after checkout, a collapsible section, a metadata aside.
 *
 * Three axes, independent of each other:
 * - `status` picks the colour (`neutral` by default — no signal),
 * - `accent` decides how that colour meets the edge,
 * - `surface` decides what sits behind the content.
 *
 * ```tsx
 * <Panel status="warning" accent="flush">
 *   <Panel.Header icon={<AlertTriangle />}>
 *     <Panel.Title>Payment missing</Panel.Title>
 *     <Panel.Description>Due 12 March</Panel.Description>
 *   </Panel.Header>
 *   <Panel.Body>We have not registered a payment.</Panel.Body>
 *   <Panel.Footer><Button size="sm">Pay now</Button></Panel.Footer>
 * </Panel>
 * ```
 *
 * Server-safe: `collapsible` is a native `<details>`, and a dismissible
 * panel renders the button but never hides itself — the caller unmounts it
 * and decides what remembers the dismissal, the same contract `Announcement`
 * keeps.
 *
 * Not `Announcement`: that is the band across the top of the page. This is
 * the block inside the content.
 */
const PanelRoot: React.FC<PanelProps> = ({
  children,
  status = 'neutral',
  accent,
  surface,
  variant,
  size = 'md',
  collapsible = false,
  defaultOpen = true,
  open,
  onToggle,
  dismissible = false,
  onDismiss,
  dismissLabel = 'Dismiss',
  loading = false,
  href,
  as,
  role,
  className,
  testId,
  ...spacingProps
}) => {
  const preset = variant ? VARIANT_PRESETS[variant] : undefined;
  const resolvedAccent = accent ?? preset?.accent ?? 'none';
  const resolvedSurface = surface ?? preset?.surface ?? 'filled';

  // A status is only live if it says something; `neutral` never is.
  const resolvedRole =
    role === null
      ? undefined
      : (role ?? (status === 'error' ? 'alert' : status === 'neutral' ? undefined : 'status'));

  if (process.env.NODE_ENV !== 'production') {
    if (collapsible && href) {
      console.warn('[ratio-ui] Panel: `href` and `collapsible` are mutually exclusive; `collapsible` wins.');
    }
    // A link root swallows everything inside it, so a nested control is both
    // invalid HTML and unreachable by keyboard.
    if (href && (dismissible || React.Children.toArray(children).some(c => isSlot(c, 'Panel.Footer')))) {
      console.warn('[ratio-ui] Panel: a panel with `href` must not contain buttons or links — drop `dismissible`/`Panel.Footer`, or make the link a `Panel.Footer` action instead.');
    }
    const hasSlot = React.Children.toArray(children).some(
      child =>
        isSlot(child, 'Panel.Header') ||
        isSlot(child, 'Panel.Body') ||
        isSlot(child, 'Panel.Footer') ||
        isSlot(child, 'Panel.Meta'),
    );
    if (children && !hasSlot) {
      console.warn('[ratio-ui] Panel: bare children are wrapped in `Panel.Body`. Wrap them yourself to silence this.');
    }
  }

  // v1 passed content straight in; keep that working by wrapping it.
  const hasSlot = React.Children.toArray(children).some(
    child =>
      isSlot(child, 'Panel.Header') ||
      isSlot(child, 'Panel.Body') ||
      isSlot(child, 'Panel.Footer') ||
      isSlot(child, 'Panel.Meta'),
  );
  let content = hasSlot ? children : <PanelBody>{children}</PanelBody>;

  // The header has to render a `<summary>` inside a `<details>` and a plain
  // row outside one. It cannot read that from the DOM, so the root hands it
  // down — cheaper than a context, and it keeps Panel server-safe.
  if (collapsible) {
    content = React.Children.map(content, child =>
      isSlot(child, 'Panel.Header')
        ? React.cloneElement(child as React.ReactElement<PanelHeaderProps>, { asSummary: true })
        : child,
    );
  }

  const rootClasses = cn(
    'group/panel relative rounded-lg',
    STATUS_VARS[status],
    SIZE_VARS[size],
    // Default inset equals the horizontal padding; stripe accents widen it.
    '[--panel-pl:var(--panel-px)]',
    ACCENT_INSET[resolvedAccent][size],
    // `tint` keeps the body on the card surface, so it overrides the fill.
    resolvedAccent === 'tint' ? 'border' : SURFACE_CLASSES[resolvedSurface],
    ACCENT_CLASSES[resolvedAccent],
    href && 'block no-underline text-inherit transition-colors hover:bg-card-hover hover:border-border-2',
    dismissible && CHROME_TOKENS,
    buildSpacingClasses(spacingProps),
    className,
  );

  const body = (
    <>
      {loading ? <PanelSkeleton /> : content}
      {dismissible && (
        <ActionButton
          round
          variant="ghost"
          ariaLabel={dismissLabel}
          onPress={onDismiss}
          className={cn(
            'absolute top-1.5 right-1.5',
            // 44px touch target on small screens, 36px from md — the same
            // floor `Announcement` keeps, well above the 24px WCAG minimum.
            'h-11 min-w-11 md:h-9 md:min-w-9',
            'opacity-70 hover:opacity-100',
          )}
        >
          <X size={16} />
        </ActionButton>
      )}
    </>
  );

  const shared = {
    'data-testid': testId,
    'data-status': status,
    'data-accent': resolvedAccent,
    'data-surface': resolvedSurface,
    'data-size': size,
    'aria-busy': loading || undefined,
    className: rootClasses,
  };

  if (collapsible) {
    return (
      <details
        {...shared}
        {...(open === undefined ? { open: defaultOpen } : { open })}
        onToggle={onToggle && (event => onToggle(event.currentTarget.open))}
      >
        {body}
      </details>
    );
  }

  if (href) {
    return (
      <a href={href} {...shared}>
        {body}
      </a>
    );
  }

  // Only here: a live-region role would strip a link or a `<details>` of its own.
  const Component = as ?? 'section';
  return (
    <Component {...shared} role={resolvedRole}>
      {body}
    </Component>
  );
};
PanelRoot.displayName = 'Panel';

export interface PanelHeaderProps {
  children?: ReactNode;
  /** Leading icon, tinted with the panel's status colour. */
  icon?: ReactNode;
  /** Trailing controls — a link, a small button. Omitted when `collapsible`. */
  actions?: ReactNode;
  /** Pin the header while the body scrolls. */
  sticky?: boolean;
  className?: string;
  /** Set by `Panel` when the panel is `collapsible`. Not part of the public API. */
  asSummary?: boolean;
}

/**
 * The top row — icon, title, description, actions. Inside a `collapsible`
 * panel it renders as the `<summary>` and grows a chevron; `actions` is
 * dropped there, because a control nested in a summary cannot be operated
 * without also toggling the disclosure.
 */
const PanelHeader: React.FC<PanelHeaderProps> = ({
  children,
  icon,
  actions,
  sticky = false,
  className,
  asSummary = false,
}) => {
  const base = cn(
    'flex items-start gap-(--panel-gap) pt-(--panel-py) pb-(--panel-py)',
    SLOT_X,
    sticky && 'sticky top-0 z-10 bg-inherit',
    // `tint` gives the header its own band and a rule under it. The band is
    // the status background itself — mixing against `--card` would go through
    // its 50% alpha and come out muddy.
    'group-data-[accent=tint]/panel:border-b group-data-[accent=tint]/panel:border-(--panel-border)',
    'group-data-[accent=tint]/panel:bg-(--panel-bg) group-data-[accent=tint]/panel:text-(--panel-text)',
    className,
  );

  const inner = (
    <>
      {icon && (
        <span aria-hidden className="mt-0.5 flex-none text-(--panel-solid) [&>svg]:h-4.5 [&>svg]:w-4.5">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </>
  );

  if (asSummary) {
    if (process.env.NODE_ENV !== 'production' && actions) {
      console.warn('[ratio-ui] Panel.Header: `actions` is ignored in a collapsible panel — move them to `Panel.Footer`.');
    }
    return (
      // Native disclosure: the summary is the button, so no JS is needed.
      <summary
        className={cn(
          base,
          'cursor-pointer list-none hover:bg-overlay-hover [&::-webkit-details-marker]:hidden',
          'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
        )}
      >
        {inner}
        <ChevronDown
          aria-hidden
          size={18}
          className="mt-0.5 flex-none text-(--text-subtle) transition-transform duration-200 group-open/panel:rotate-180"
        />
      </summary>
    );
  }

  return (
    <div className={base}>
      {inner}
      {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
    </div>
  );
};
PanelHeader.displayName = 'Panel.Header';

export interface PanelTitleProps {
  children?: ReactNode;
  /** Heading level. `span` by default — a panel is rarely a document section. */
  as?: 'span' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /**
   * Typeface. Sans keeps the panel in the interface layer; `display` is for
   * a panel that is the page's main content.
   * @default 'body'
   */
  font?: 'body' | 'display';
  className?: string;
}

/** The title — sans, one step up from the body, scaled by the panel's `size`. */
const PanelTitle: React.FC<PanelTitleProps> = ({
  children,
  as: Tag = 'span',
  font = 'body',
  className,
}) => (
  <Tag
    className={cn(
      'm-0 block text-(length:--panel-title) leading-tight font-semibold tracking-[-0.005em]',
      font === 'display' && 'font-serif',
      className,
    )}
  >
    {children}
  </Tag>
);
PanelTitle.displayName = 'Panel.Title';

/** One line of secondary text under the title — a deadline, a count, a date. */
const PanelDescription: React.FC<{ children?: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('mt-0.5 text-[0.8rem] opacity-80', className)}>{children}</div>;
PanelDescription.displayName = 'Panel.Description';

export interface PanelBodyProps {
  children?: ReactNode;
  /** Rules between direct children — for lists of rows. */
  divided?: boolean;
  /** Scroll the body instead of growing the panel. */
  scrollable?: boolean;
  /** Cap for a `scrollable` body, e.g. `'18rem'`. */
  maxHeight?: string;
  className?: string;
}

/**
 * The content. Body text holds one size across all three panel sizes — it
 * is the padding that carries the step, not the prose.
 */
const PanelBody: React.FC<PanelBodyProps> = ({
  children,
  divided = false,
  scrollable = false,
  maxHeight,
  className,
}) => (
  <div
    style={maxHeight ? { maxHeight } : undefined}
    className={cn(
      'pt-0 pb-(--panel-py) text-[0.9rem] leading-relaxed first:pt-(--panel-py)',
      SLOT_X,
      // `tint` puts a rule above the body, so it needs its top padding back.
      'group-data-[accent=tint]/panel:pt-(--panel-py) group-data-[accent=tint]/panel:text-(--text-muted)',
      divided && 'divide-y divide-border-1',
      (scrollable || maxHeight) && 'overflow-y-auto',
      className,
    )}
  >
    {children}
  </div>
);
PanelBody.displayName = 'Panel.Body';

export interface PanelFooterProps {
  children?: ReactNode;
  /** Horizontal distribution of the actions. @default 'end' */
  align?: 'start' | 'between' | 'end';
  className?: string;
}

const FOOTER_ALIGN: Record<NonNullable<PanelFooterProps['align']>, string> = {
  start: 'justify-start',
  between: 'justify-between',
  end: 'justify-end',
};

/** The action row — ruled off, on a faint wash so it reads as a base. */
const PanelFooter: React.FC<PanelFooterProps> = ({ children, align = 'end', className }) => (
  <div
    className={cn(
      'flex flex-wrap items-center gap-2 border-t border-border-1 bg-overlay-hover',
      'pt-(--panel-py) pb-(--panel-py)',
      SLOT_X,
      FOOTER_ALIGN[align],
      className,
    )}
  >
    {children}
  </div>
);
PanelFooter.displayName = 'Panel.Footer';

/**
 * A `DescriptionList` in `meta` form at the panel's padding. All styling and
 * every prop live on the list; this only drops its outer rules, which the
 * panel's own border already provides.
 */
const PanelMeta: React.FC<{ children?: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('pt-0 pb-(--panel-py) first:pt-(--panel-py)', SLOT_X)}>
    <DescriptionList variant="meta" className={cn('border-y-0 py-0', className)}>
      {children}
    </DescriptionList>
  </div>
);
PanelMeta.displayName = 'Panel.Meta';

/** Body stand-in while `loading`. Three bars, no text to read. */
const PanelSkeleton: React.FC = () => (
  <div className={cn('flex flex-col gap-2.5 py-(--panel-py)', SLOT_X)}>
    <div className="panel-skeleton h-3 w-1/2 rounded" />
    <div className="panel-skeleton h-2.5 w-full rounded" />
    <div className="panel-skeleton h-2.5 w-3/4 rounded" />
  </div>
);

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Title: PanelTitle,
  Description: PanelDescription,
  Body: PanelBody,
  Footer: PanelFooter,
  Meta: PanelMeta,
});
