// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';

import { ActionButton } from '../ActionButton';
import { buttonSizes, buttonStyles } from '../Button/Button';
import { X } from '../../icons';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

/**
 * The status tones share tokens with `Panel` and `Badge`; `neutral` is the
 * quiet linen marking and `ink` the near-black mourning band.
 */
export type AnnouncementTone = Status | 'ink';
export type AnnouncementVariant = 'row' | 'banner';

export interface AnnouncementProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Colour and weight of the message. `info` for news and deadlines,
   * `warning` for operations (closures, postponements), `error` and
   * `success` for an outage and its all-clear. `neutral` is the quiet
   * marking that asks for nothing — a flag at half mast; `ink` is the
   * mourning band, near-black and shown alone. @default 'info'
   */
  tone?: AnnouncementTone;
  /**
   * `'row'` (default) is one line, ~40px: icon, sentence, link, dismiss.
   * `'banner'` is the taller form with a serif `Title` above the sentence
   * and room for a `Rule` or `Image` — for markings and deaths.
   */
  variant?: AnnouncementVariant;
  /**
   * Full-width row (app headers) instead of the centered `container`
   * (marketing pages) — the same switch as `Navbar`.
   */
  fluid?: boolean;
  /**
   * Renders the dismiss button. The band does not hide itself: the caller
   * unmounts it and decides what remembers the dismissal — keyed by the
   * message, never by the period, so an edited message stays dismissed and
   * a new one shows again. Leave unset for `neutral` and `ink`: a marking
   * is not the reader's to close.
   */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. @default 'Dismiss' */
  dismissLabel?: string;
  /**
   * Name of the region landmark, in plain words for the tone — "Notice",
   * "Announcement". Pass `role="status"` as well only when the band is
   * injected after load; a server-rendered band is part of the page, not
   * news. @default 'Announcement'
   */
  'aria-label'?: string;
  className?: string;
  testId?: string;
}

export interface AnnouncementSlotProps {
  children?: ReactNode;
  className?: string;
}

export interface AnnouncementTitleProps extends AnnouncementSlotProps {
  /** Rendered element. `span` by default; pass `h2` when the band headlines the page. */
  as?: 'span' | 'h2' | 'h3' | 'p';
}

export interface AnnouncementLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  /**
   * Override the rendered element. Defaults to a plain `<a>`; pass a
   * Next.js / TanStack Link for internal routes to keep client-side
   * navigation. Receives `href`, `className` and the other anchor props.
   */
  as?: React.ElementType;
}

export interface AnnouncementImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Required — the picture carries meaning here (a portrait, a flag, a place). */
  alt: string;
}

const TONE_CLASSES: Record<AnnouncementTone, string> = {
  info: 'bg-info-bg border-info-border text-info-text',
  success: 'bg-success-bg border-success-border text-success-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text',
  error: 'bg-error-bg border-error-border text-error-text',
  // Linen-300 with muted text: a marking that carries no consequence.
  neutral: 'bg-secondary-300 border-border-2 text-(--text-muted) dark:bg-secondary-900',
  // Near-black with the warm off-white of the dark theme's `--text`.
  // `surface-dark` so anything dropped in — a Button, a Badge — takes the
  // dark-theme tokens instead of vanishing against the ink.
  ink: 'surface-dark bg-neutral-950 border-black text-(--text) dark:border-neutral-800',
};

const VARIANT_CLASSES: Record<AnnouncementVariant, string> = {
  row: 'gap-3 py-2.5',
  banner: 'gap-4 py-4',
};

// The dismiss button (and any ActionButton dropped in) reads the band's own
// colour instead of the page's muted text — same token trick ActionButton
// uses for its `solid` variant.
const CHROME_TOKENS = [
  '[--action-button-fg:currentColor]',
  '[--action-button-fg-hover:currentColor]',
  '[--action-button-border:transparent]',
  '[--action-button-bg-hover:color-mix(in_oklch,currentColor_15%,transparent)]',
].join(' ');

/**
 * Announcement — the band along the top of a site for everything it
 * needs to *say* about an event: a deadline, planned maintenance, a flag at
 * half mast, a death. One component in two forms — a one-line `row` below
 * the navbar, a taller `banner` above it — composed from parts:
 *
 * ```tsx
 * <Announcement tone="warning" onDismiss={dismiss}>
 *   <Info size={17} aria-hidden />
 *   <Announcement.Body>
 *     The reading room is closed 3–5 September.{' '}
 *     <Announcement.Link href="/notices/floor">Read more</Announcement.Link>
 *   </Announcement.Body>
 * </Announcement>
 *
 * <Announcement tone="ink" variant="banner">
 *   <Announcement.Rule />
 *   <Announcement.Body>
 *     <Announcement.Title>Ingrid Solheim, 1937–2026</Announcement.Title>
 *     Lectures 3–5 September are postponed. Registered participants get an email.
 *   </Announcement.Body>
 *   <Announcement.Action href="/in-memoriam">Read more</Announcement.Action>
 * </Announcement>
 * ```
 *
 * Exactly one way in: an inline `Link` inside the sentence, or the pill
 * `Action` pushed to the right — never both, never two. The band never
 * changes the layout beneath it; it pushes the page down.
 *
 * Named for what it says, not where it sits: page chrome is the common
 * case, but with `fluid` it sits just as well across the top of a `Card`
 * or a `Drawer` — a notice scoped to that surface.
 *
 * What the band does not do is decide *whether* to show: one band at a time
 * (mourning suppresses the rest), the active period, and the dismissal
 * record per message all belong to the caller, who has the admin record.
 *
 * Not `Panel`: that is the message box inside the content. This is page
 * chrome.
 */
const AnnouncementRoot: React.FC<AnnouncementProps> = ({
  tone = 'info',
  variant = 'row',
  fluid = false,
  onDismiss,
  dismissLabel = 'Dismiss',
  'aria-label': ariaLabel = 'Announcement',
  className,
  children,
  testId,
  ...rest
}) => (
  <div
    role="region"
    aria-label={ariaLabel}
    data-testid={testId}
    data-variant={variant}
    {...rest}
    className={cn(
      'group/announcement w-full border-b text-[13px] leading-[1.45]',
      TONE_CLASSES[tone],
      CHROME_TOKENS,
      className,
    )}
  >
    <div
      className={cn(
        'flex items-center px-5',
        fluid ? 'w-full' : 'container mx-auto',
        VARIANT_CLASSES[variant],
      )}
    >
      {children}
      {onDismiss && (
        <ActionButton
          round
          variant="ghost"
          ariaLabel={dismissLabel}
          onPress={onDismiss}
          className={cn(
            // Trailing edge — after the Action pill when there is one, else
            // pushed right on its own.
            'ml-auto -mr-2 shrink-0 [[data-slot=action]~&]:ml-1',
            // 44px touch target on small screens, 36px from md; negative
            // margins keep the row at its one-line height either way.
            '-my-3 h-11 min-w-11 md:-my-2 md:h-9 md:min-w-9',
            'opacity-60 hover:opacity-100',
          )}
        >
          <X size={15} />
        </ActionButton>
      )}
    </div>
  </div>
);
AnnouncementRoot.displayName = 'Announcement';

/**
 * The text block — the sentence, with an optional `Title` first. A `row`
 * runs the full line; a `banner` caps at 52ch so its sentence wraps under
 * the title instead of pushing the action off the edge.
 */
const AnnouncementBody: React.FC<AnnouncementSlotProps> = ({ children, className }) => (
  <div className={cn('min-w-0 group-data-[variant=banner]/announcement:max-w-[52ch]', className)}>
    {children}
  </div>
);
AnnouncementBody.displayName = 'Announcement.Body';

/**
 * The headline of a `banner` — serif, on its own line above the sentence.
 * In a `row` it is the bold sans lead-in: "Notice · …". Sentence case, no
 * exclamation marks.
 */
const AnnouncementTitle: React.FC<AnnouncementTitleProps> = ({
  as: Tag = 'span',
  children,
  className,
}) => (
  <Tag
    className={cn(
      'm-0 font-semibold',
      'group-data-[variant=banner]/announcement:mb-0.5 group-data-[variant=banner]/announcement:block',
      'group-data-[variant=banner]/announcement:font-serif group-data-[variant=banner]/announcement:text-[17px]',
      'group-data-[variant=banner]/announcement:leading-[1.15] group-data-[variant=banner]/announcement:tracking-[-0.01em]',
      className,
    )}
  >
    {children}
  </Tag>
);
AnnouncementTitle.displayName = 'Announcement.Title';

/**
 * The inline way in — a link inside the sentence, in the band's own colour
 * and underlined. The everyday `row` uses this; hover shifts the colour,
 * the underline stays.
 */
const AnnouncementLink: React.FC<AnnouncementLinkProps> = ({
  as: Tag = 'a',
  className,
  children,
  ...rest
}) => (
  <Tag
    className={cn(
      'rounded-xs font-semibold text-inherit underline decoration-current/50 underline-offset-[3px]',
      'transition-opacity hover:opacity-80',
      'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
      className,
    )}
    {...rest}
  >
    {children}
  </Tag>
);
AnnouncementLink.displayName = 'Announcement.Link';

/**
 * The pill way in — an outline `Button`-styled link pushed to the right,
 * for a `banner` or a `row` whose sentence has no natural place for a
 * link. Text and border take the band's colour, so it reads the same on
 * ink as on info. Imperative label: "Read more", "See the programme".
 */
const AnnouncementAction: React.FC<AnnouncementLinkProps> = ({
  as: Tag = 'a',
  className,
  children,
  ...rest
}) => (
  <Tag
    data-slot="action"
    className={cn(
      'ml-auto inline-flex shrink-0 items-center gap-2 no-underline whitespace-nowrap',
      buttonSizes.sm,
      buttonStyles.outline,
      'font-semibold text-inherit border-current/50 hover:border-current hover:bg-current/10',
      'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
      className,
    )}
    {...rest}
  >
    {children}
  </Tag>
);
AnnouncementAction.displayName = 'Announcement.Action';

/** A 2px ochre rule the full height of the band — the graphic for a `banner` without a picture. */
const AnnouncementRule: React.FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden className={cn('w-0.5 shrink-0 self-stretch bg-accent-500', className)} />
);
AnnouncementRule.displayName = 'Announcement.Rule';

/**
 * The 4:3 picture slot of a `banner`, 104×78 — a portrait, a flag, a place.
 * Photographic, never an illustration. `alt` is required.
 */
const AnnouncementImage: React.FC<AnnouncementImageProps> = ({
  alt,
  className,
  ...rest
}) => (
  <img
    alt={alt}
    className={cn('h-19.5 w-26 shrink-0 rounded-lg object-cover', className)}
    {...rest}
  />
);
AnnouncementImage.displayName = 'Announcement.Image';

export const Announcement = Object.assign(AnnouncementRoot, {
  Body: AnnouncementBody,
  Title: AnnouncementTitle,
  Link: AnnouncementLink,
  Action: AnnouncementAction,
  Rule: AnnouncementRule,
  Image: AnnouncementImage,
});
