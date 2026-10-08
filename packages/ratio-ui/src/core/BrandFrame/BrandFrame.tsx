// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './BrandFrame.css';

export type BrandFrameVariant = 'page' | 'panel' | 'notice';

export interface BrandFrameProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Element to render. Defaults to `div`. */
  as?: React.ElementType;
  /**
   * How much frame. `page` is the widest band, round the whole page;
   * `panel` the content that should stand out (a featured card); `notice`
   * a thin frame for a banner or status strip.
   */
  variant?: BrandFrameVariant;
  className?: string;
}

/**
 * A thick border in the brand colour, the way a poster is framed. Opt-in
 * per page: the frame is drawn only under `data-brand-frame="on"` (on
 * `<html>`, any ancestor, or the frame itself). Without it a `panel` or
 * `notice` keeps the theme's ordinary edge, and a `page` frame draws
 * nothing, so the same markup serves a reader who turned the frame off.
 *
 * Colours and widths come from the `--brand-frame-*` tokens; in dark mode
 * the page frame steps back into the surface.
 *
 * @beta The prop shape and the token set may change before release.
 *
 * @example
 * ```tsx
 * <html data-brand-frame="on">
 *   <BrandFrame variant="page" className="min-h-screen">
 *     <BrandFrame variant="panel" className="bg-card p-6">Featured</BrandFrame>
 *   </BrandFrame>
 * </html>
 * ```
 */
export const BrandFrame: React.FC<BrandFrameProps> = ({
  as: Component = 'div',
  variant = 'panel',
  className,
  children,
  ...rest
}) => (
  <Component className={cn('ratio-brand-frame', className)} data-variant={variant} {...rest}>
    {children}
  </Component>
);
BrandFrame.displayName = 'BrandFrame';
