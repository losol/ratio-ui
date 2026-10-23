// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Diploma.css';

// Plain markup and CSS, no hooks: the diploma renders on the server and
// prints as it shows. Statics are attached here, with no 'use client'
// directive, which is what scripts/check-client-statics.mjs requires.

export interface DiplomaProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. @default 'article' */
  as?: React.ElementType;
  /** `a4` holds the portrait page's proportion, for a preview of the print. */
  sheet?: 'a4';
  /** A mark in the corner: a `Stamp`, an `AchievementBadgeArt`, a logo. */
  seal?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Diploma — a sheet that says who earned what: the title, the recipient,
 * a line of text, the achievements as badges, and the signatures. Built
 * from its parts in reading order; print it with the app's `@page`.
 *
 * @example
 * ```tsx
 * <Diploma sheet="a4">
 *   <Diploma.Eyebrow>Civitas skole</Diploma.Eyebrow>
 *   <Diploma.Title>Diplom</Diploma.Title>
 *   <Diploma.Text>tildeles</Diploma.Text>
 *   <Diploma.Recipient>Ola Nordmann</Diploma.Recipient>
 *   <Diploma.Text>for oppnådde læringsmål i matematikk, 4. trinn</Diploma.Text>
 *   <Diploma.Achievements>
 *     <AchievementBadge achievement={gangemester} credential={award} />
 *   </Diploma.Achievements>
 *   <Diploma.Footer>
 *     <Diploma.Signature name="Kari Lærer" role="Kontaktlærer" />
 *     <Diploma.Meta>Oslo, 23. oktober 2026</Diploma.Meta>
 *   </Diploma.Footer>
 * </Diploma>
 * ```
 */
function DiplomaRoot({
  as: Component = 'article',
  sheet,
  seal,
  className,
  children,
  ...rest
}: DiplomaProps) {
  return (
    <Component className={cn('ratio-diploma', className)} data-sheet={sheet} {...rest}>
      {children}
      {seal && <div className="ratio-diploma__seal">{seal}</div>}
    </Component>
  );
}

interface PartProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  children?: ReactNode;
}

const part =
  (name: string, block: string, defaultAs: React.ElementType) =>
  ({ as: Component = defaultAs, className, children, ...rest }: PartProps) => (
    <Component className={cn(block, className)} {...rest}>
      {children}
    </Component>
  );

/** Who issues it, above the title: the school, the course. */
const Eyebrow = part('Diploma.Eyebrow', 'ratio-diploma__eyebrow', 'p');
/** The big word: "Diplom", "Certificate of Completion". An `h1` by default. */
const Title = part('Diploma.Title', 'ratio-diploma__title', 'h1');
/** The recipient's name. */
const Recipient = part('Diploma.Recipient', 'ratio-diploma__recipient', 'p');
/** A line of running text: "tildeles", "for oppnådde læringsmål i …". */
const Text = part('Diploma.Text', 'ratio-diploma__text', 'p');
/** Signatures, the date and place, side by side at the foot. */
const Footer = part('Diploma.Footer', 'ratio-diploma__footer', 'footer');
/** The small print at the foot: date and place, a credential id. */
const Meta = part('Diploma.Meta', 'ratio-diploma__meta', 'p');

export interface DiplomaAchievementsProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  /** The badges, one per child. */
  children: ReactNode;
}

/** The achievements as a row of badges, wrapping, each in its own list item. */
function Achievements({ className, children, ...rest }: DiplomaAchievementsProps) {
  return (
    <ul className={cn('ratio-diploma__achievements', className)} {...rest}>
      {React.Children.map(children, (child, i) =>
        child == null || child === false ? null : <li key={i}>{child}</li>,
      )}
    </ul>
  );
}

export interface DiplomaSignatureProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The signer. */
  name: string;
  /** Their role: "Kontaktlærer", "Rektor". */
  role?: string;
  /** The signature itself, above the line: an image, or nothing for a line to sign by hand. */
  children?: ReactNode;
  className?: string;
}

/** A signature line with the name and role under it. */
function Signature({ name, role, children, className, ...rest }: DiplomaSignatureProps) {
  return (
    <div className={cn('ratio-diploma__signature', className)} {...rest}>
      {children}
      <span className="ratio-diploma__signature-name">{name}</span>
      {role && <span className="ratio-diploma__signature-role">{role}</span>}
    </div>
  );
}

for (const [c, n] of [
  [DiplomaRoot, 'Diploma'],
  [Eyebrow, 'Diploma.Eyebrow'],
  [Title, 'Diploma.Title'],
  [Recipient, 'Diploma.Recipient'],
  [Text, 'Diploma.Text'],
  [Footer, 'Diploma.Footer'],
  [Meta, 'Diploma.Meta'],
  [Achievements, 'Diploma.Achievements'],
  [Signature, 'Diploma.Signature'],
] as const) {
  (c as { displayName?: string }).displayName = n;
}

export const Diploma = Object.assign(DiplomaRoot, {
  Eyebrow,
  Title,
  Recipient,
  Text,
  Achievements,
  Footer,
  Signature,
  Meta,
});
