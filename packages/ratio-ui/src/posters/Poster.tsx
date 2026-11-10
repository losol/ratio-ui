// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Poster — draws a laid-out poster as one self-contained SVG. No hooks and
// no 'use client': the layout is arithmetic, so a poster renders on the
// server as in the browser, and the same SVG is the file an app exports.

import React, { type Ref } from 'react';
import {
  layoutPoster,
  type PosterContent,
  type PosterLayer,
  type PosterLayout,
  type PosterTemplate,
  type PosterTypefaces,
} from '@eventuras/ratio-ui-core/posters';
import { cn } from '../utils/cn';
import './Poster.css';

export interface PosterProps {
  /** The design: size, colours, frame and slots. */
  template: PosterTemplate;
  /** What goes in each slot, by name. */
  content: PosterContent;
  /**
   * What the poster says, for a screen reader. Default: its texts in
   * drawing order.
   */
  label?: string;
  /**
   * The theme's faces, by role: its `font`, for example `bureau.font` from
   * `@eventuras/ratio-ui-core/themes/bureau`. Default: the standard theme's,
   * Source Serif 4 and Source Sans 3. The page must load them, as the
   * theme's font stylesheet does.
   */
  fonts?: { display: string; body: string };
  /** Faces of your own, measured your way. Wins over `fonts`. */
  typefaces?: PosterTypefaces;
  className?: string;
  /** The `<svg>`, to export it with `posterToBlob`. */
  ref?: Ref<SVGSVGElement>;
}

/** A poster as SVG, sized in its own pixels and scaled to its container on the page. */
export function Poster({ template, content, label, fonts, typefaces, className, ref }: PosterProps) {
  const layout = layoutPoster(template, content, { fonts, typefaces });
  return (
    <PosterSvg
      layout={layout}
      label={label ?? describe(layout)}
      className={className}
      ref={ref}
    />
  );
}

export interface PosterSvgProps {
  /** A layout from `layoutPoster`. */
  layout: PosterLayout;
  label: string;
  className?: string;
  ref?: Ref<SVGSVGElement>;
}

/** Draws a layout already made with `layoutPoster`, for an app that inspects it first. */
export function PosterSvg({ layout, label, className, ref }: PosterSvgProps) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      role="img"
      aria-label={label}
      className={cn('ratio-poster', className)}
      data-overflow={layout.overflow.length > 0 ? layout.overflow.join(' ') : undefined}
    >
      {layout.layers.map((layer, i) => (
        <Layer key={i} layer={layer} />
      ))}
    </svg>
  );
}

function Layer({ layer }: { layer: PosterLayer }) {
  switch (layer.kind) {
    case 'rect':
      return (
        <rect
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          fill={layer.fill ?? 'none'}
          stroke={layer.stroke}
          strokeWidth={layer.strokeWidth}
        />
      );
    case 'image':
      return (
        <image
          href={layer.href}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          preserveAspectRatio={layer.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
          data-slot={layer.slot}
        />
      );
    case 'text':
      return (
        <text
          fontFamily={layer.family}
          fontSize={layer.font.size}
          fontWeight={layer.font.weight === 'bold' ? 700 : 400}
          letterSpacing={layer.font.letterSpacing ? layer.font.letterSpacing * layer.font.size : undefined}
          fill={layer.color}
          textAnchor={layer.anchor}
          // Measured at each face's default optical size.
          style={{ fontOpticalSizing: 'none' }}
          data-slot={layer.slot}
        >
          {layer.lines.map((line, i) => (
            <tspan key={i} x={line.x} y={line.y}>
              {line.text}
            </tspan>
          ))}
        </text>
      );
  }
}

/** The poster's words, in drawing order: a label when the app gives none. */
function describe(layout: PosterLayout): string {
  return layout.layers
    .flatMap(layer =>
      layer.kind === 'text' ? [layer.source] : layer.kind === 'image' && layer.alt ? [layer.alt] : [],
    )
    .map(part => part.replace(/\s+/g, ' ').trim())
    .map(part => (/[.!?:…]$/.test(part) ? part : `${part}.`))
    .join(' ');
}
