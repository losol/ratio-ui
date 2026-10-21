// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import type { BorderProps } from '../../tokens/borders';
import type { Color, Status } from '../../tokens/colors';
import { surfaceBgClasses } from '../../tokens/colors';
import { buildSpacingClasses } from '../../tokens/spacing';
import { buildBorderClasses } from '../../tokens/borders';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';
import { cn } from '../../utils/cn';
import { ChevronDown } from '../../icons';
import './Card.css';

export type CardShadow = 'none' | 'xs' | 'sm' | 'md';

export interface CardProps
  extends SpacingProps,
    BorderProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'className' | 'color' | 'onToggle' | 'style'> {
  children?: ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Semantic surface tint. Maps to `bg-{color}-50` in light and
   * `bg-{color}-950` in dark via `surfaceBgClasses`. Overrides the
   * default `--card` fill.
   */
  color?: Color;
  /**
   * Drop the fill, leaving the card transparent. Pair with `border`
   * (from `BorderProps`) when you want an outlined transparent card.
   */
  transparent?: boolean;
  /**
   * Drop shadow. Defaults to `'xs'` for filled cards, `'none'` for
   * transparent ones.
   */
  shadow?: CardShadow;
  /**
   * Left edge stripe in a status color — colour-codes a card's category or
   * severity in a stack. Only the left border changes, so it composes with
   * `color`, `border`, `borderColor` and `hoverEffect` (the stripe stays put
   * while the other three sides take the hover border).
   */
  accent?: Status;
  /**
   * Add the canonical interactive hover — surface lifts to `--card-hover`,
   * border picks up `--primary`, and a soft Linseed-tinted glow appears.
   * Tuned to hint, not shout; the card stays put so cursor pass-by
   * doesn't make text twitch. Use only on cards that act as clickable
   * surfaces (links, calls-to-action).
   */
  hoverEffect?: boolean;
  /**
   * The card that should stand out on the page. Its edge comes from the
   * `--card-featured-*` tokens: a frame in the primary colour, thick in
   * Bureau. Use for one card in a view, not for every card.
   */
  featured?: boolean;
  backgroundImageUrl?: string;
  /**
   * Open and close the card: it renders as a native `<details>`, with its
   * `Card.Header` as the `<summary>` and the rest of the children as the
   * body. No JavaScript needed; find-in-page reaches the closed content.
   * `as` is ignored. Pair with `name` for one-open-at-a-time.
   */
  collapsible?: boolean;
  /**
   * Group name for `collapsible` cards: cards that share a `name` open one
   * at a time, the browser closing the others.
   */
  name?: string;
  /** Open state for an uncontrolled `collapsible` card. @default true */
  defaultOpen?: boolean;
  /** Open state for a controlled `collapsible` card — pair with `onToggle`. */
  open?: boolean;
  /** Called with the new open state when a `collapsible` card opens or closes. */
  onToggle?: (open: boolean) => void;
  testId?: string;
}

// Token-driven so themes can reskin card elevation (see tokens/card.css
// + Card.css). Defaults mirror the previous Tailwind shadow-xs/sm/md.
const SHADOW_CLASSES: Record<CardShadow, string> = {
  none: '',
  xs: 'card-shadow-xs',
  sm: 'card-shadow-sm',
  md: 'card-shadow-md',
};


const CardRoot: React.FC<CardProps> = ({
  transparent = false,
  shadow,
  hoverEffect = false,
  featured = false,
  gap = 'sm',
  color,
  accent,
  children,
  as,
  backgroundImageUrl,
  collapsible = false,
  name,
  defaultOpen = true,
  open,
  onToggle,
  className,
  style,
  testId,
  ...spacingAndBorder
}) => {
  // Card-tier defaults — applied when consumer doesn't pass them.
  const padding = spacingAndBorder.padding ?? 'md';
  const radius = spacingAndBorder.radius ?? 'xl';
  const border = spacingAndBorder.border ?? !transparent;
  const effectiveShadow: CardShadow = shadow ?? (transparent ? 'none' : 'xs');

  const fillClass = transparent ? 'bg-transparent' : 'bg-card';

  // Hover effect — opt-in, only meaningful for clickable surfaces.
  // The smaller tile-tier glow when no shadow is present (flat editorial
  // mode); the bigger one for elevated cards.
  const hoverShadow =
    effectiveShadow === 'none'
      ? 'hover:shadow-(--card-hover-shadow-tile)'
      : 'hover:shadow-(--card-hover-shadow)';
  const transitionClasses = hoverEffect ? 'transition-all duration-200 ease-out' : '';
  const hoverClasses = hoverEffect
    ? `hover:bg-card-hover hover:border-(--primary) ${hoverShadow}`
    : '';

  // `transparent` takes precedence over `color` so the prop contract holds.
  const bgClasses = transparent ? fillClass : color ? surfaceBgClasses[color] : fillClass;

  const {
    padding: _padding,
    paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    border: _border,
    borderColor,
    radius: _radius,
    ...rest
  } = spacingAndBorder;

  const spacingClasses = buildSpacingClasses({
    padding,
    paddingX, paddingY, paddingTop, paddingBottom,
    margin, marginX, marginY, marginTop, marginBottom,
    gap,
  });
  const borderClasses = buildBorderClasses({ border, borderColor, radius });

  const combinedStyle = buildCoverImageStyle(backgroundImageUrl) || style;

  // A collapsible card is a `<details>`: its header renders the `<summary>`,
  // and whatever follows is the body, set off by the card's `gap`. The header
  // cannot read that from the DOM, so the root hands it down — no context, so
  // Card stays server-safe.
  const kids = React.Children.toArray(children);
  const hasFooter = kids.some((child) => isSlot(child, 'Card.Footer'));
  // The footer takes the card's `gap` as its padding above the rule, so the
  // slot reads one value for both. Passed down, not read from context, so
  // Card stays server-safe.
  const withFooterGap = (nodes: ReactNode[]) =>
    nodes.map((child) =>
      isSlot(child, 'Card.Footer')
        ? React.cloneElement(child as React.ReactElement<CardFooterProps>, { gap })
        : child,
    );

  let content: ReactNode = hasFooter ? withFooterGap(kids) : children;
  if (collapsible) {
    const header = kids.find((child) => isSlot(child, 'Card.Header'));
    const body = withFooterGap(kids.filter((child) => !isSlot(child, 'Card.Header')));
    content = (
      <>
        {header && React.cloneElement(header as React.ReactElement<CardHeaderProps>, { asSummary: true })}
        {body.length > 0 && (
          <div className={cn(hasFooter && 'flex flex-col', buildSpacingClasses({ marginTop: gap, gap: hasFooter ? gap : undefined }))}>
            {body}
          </div>
        )}
      </>
    );
  }

  const Component: React.ElementType = collapsible ? 'details' : (as ?? 'div');
  const detailsProps = collapsible
    ? {
        name,
        ...(open === undefined ? { open: defaultOpen } : { open }),
        onToggle:
          onToggle &&
          ((event: React.SyntheticEvent<HTMLDetailsElement>) => onToggle(event.currentTarget.open)),
      }
    : undefined;

  return (
    <Component
      className={cn(
        // .ratio-card: stable hook for theme-scoped card chrome.
        'ratio-card',
        'relative',
        collapsible && 'group/card',
        // A footer sinks to the bottom, so footers line up across a row of
        // cards of different heights.
        hasFooter && !collapsible && 'flex flex-col',
        bgClasses,
        borderClasses,
        SHADOW_CLASSES[effectiveShadow],
        accent && 'border-l-4',
        featured && 'ratio-card--featured',
        transitionClasses,
        hoverClasses,
        spacingClasses,
        className,
      )}
      style={combinedStyle}
      data-accent={accent}
      data-testid={testId}
      {...detailsProps}
      {...rest}
    >
      {content}
    </Component>
  );
};
CardRoot.displayName = 'Card';

export interface CardHeaderProps {
  /** The title — a `Heading`, or plain text. */
  children?: ReactNode;
  /**
   * One line at the end of the header, truncated: the state of the content,
   * so a closed card still tells what is inside.
   */
  summary?: ReactNode;
  className?: string;
  /** Set by `Card` when the card is `collapsible`. Not part of the public API. */
  asSummary?: boolean;
}

const isSlot = (child: ReactNode, name: string): boolean =>
  React.isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === name;

/**
 * The top row of a card: the title, and a `summary` at the end. In a
 * `collapsible` card it renders as the `<summary>` and grows a chevron;
 * elsewhere it is a plain row. Keep controls out of it in a collapsible
 * card — a button inside a summary cannot be pressed without also
 * toggling the card.
 */
const CardHeader: React.FC<CardHeaderProps> = ({ children, summary, className, asSummary = false }) => {
  const inner = (
    <>
      <div className="min-w-0 flex-1">{children}</div>
      {summary && (
        <span className="min-w-0 max-w-[50%] flex-none truncate text-sm text-(--text-muted)">
          {summary}
        </span>
      )}
    </>
  );
  const base = cn('flex items-center gap-3', className);

  if (asSummary) {
    return (
      <summary
        className={cn(
          base,
          'cursor-pointer list-none [&::-webkit-details-marker]:hidden',
          'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
        )}
      >
        {inner}
        <ChevronDown
          aria-hidden
          size={18}
          className="flex-none text-(--text-subtle) transition-transform duration-200 group-open/card:rotate-180"
        />
      </summary>
    );
  }

  return <div className={base}>{inner}</div>;
};
CardHeader.displayName = 'Card.Header';

export interface CardMetaProps {
  /**
   * The small print, at either end of the row: what the card is at the
   * start, who it is from at the end. One child sits at the start; give two
   * for both corners.
   */
  children?: ReactNode;
  className?: string;
}

/**
 * The top corners of a card: a line of small print in capitals, in the
 * primary colour, with one item at each end: what the card is, and who it
 * is from. With `Card.Footer` (an element at each end, sunk to the bottom)
 * a card has something in all four corners. Set in the `--eyebrow-*` tokens,
 * like `Heading.Eyebrow`, so a theme restyles both at once.
 */
const CardMeta: React.FC<CardMetaProps> = ({ children, className }) => (
  <div
    className={cn(
      'flex items-baseline justify-between gap-3 uppercase text-(--primary)',
      'font-(family-name:--eyebrow-font-family) text-(length:--eyebrow-font-size)',
      'tracking-(--eyebrow-letter-spacing) font-(--eyebrow-font-weight)',
      '[&>*:last-child:not(:first-child)]:text-right',
      className,
    )}
  >
    {children}
  </div>
);
CardMeta.displayName = 'Card.Meta';

export interface CardBodyProps {
  children?: ReactNode;
  className?: string;
}

/**
 * The content between header and footer. Optional — bare children are the
 * body too — but it names the part, and it grows to fill the card, so a
 * footer sits at the bottom whatever the body's height.
 */
const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={cn('min-w-0 flex-1', className)}>{children}</div>
);
CardBody.displayName = 'Card.Body';

export interface CardFooterProps {
  /** Left and right ends of the row — put two elements in for `justify-between`. */
  children?: ReactNode;
  /** A rule above the footer. @default true */
  divider?: boolean;
  className?: string;
  /** Set by `Card` to its own `gap`. Not part of the public API. */
  gap?: SpacingProps['gap'];
}

/**
 * The bottom row of a card: inputs and outputs, a status and an action.
 * Sinks to the bottom of the card, so footers line up across a row of
 * cards of different heights, and rules itself off from the content.
 */
const CardFooter: React.FC<CardFooterProps> = ({ children, divider = true, className, gap = 'sm' }) => (
  <div
    className={cn(
      'mt-auto flex items-center justify-between gap-2',
      divider && 'border-t border-border-1',
      buildSpacingClasses({ paddingTop: gap }),
      className,
    )}
  >
    {children}
  </div>
);
CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardRoot, {
  Meta: CardMeta,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
