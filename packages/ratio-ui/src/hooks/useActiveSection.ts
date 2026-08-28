// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useEffect, useState } from 'react';

export interface UseActiveSectionOptions {
  /**
   * Px of sticky chrome at the top of the viewport. A section becomes
   * current once its element has scrolled up to this line. @default 0
   */
  offset?: number;
}

/**
 * Scroll-spy: which of `ids` is the section being read. The current section
 * is the last one whose element has scrolled up to the `offset` line at the
 * top of the viewport — or to its own `scroll-margin-top`, when that sits
 * lower, so a target that an anchor jump lands with breathing room under the
 * sticky chrome still counts. Before any has, it is the topmost; at the
 * bottom of the page it is the lowest, so a short final section still gets
 * its turn.
 *
 * Positions are read on scroll and resize, one frame at a time — not through
 * an IntersectionObserver. An observer only reports *crossings*, and an
 * anchor jump or a fast scroll skips them, leaving the highlight stale (the
 * bug this replaces in `TableOfContents`). Tracks window scrolling; ids may
 * come in any order, and ids without an element are ignored.
 *
 * @example
 * const activeId = useActiveSection(['program', 'venue', 'signup'], { offset: 116 });
 */
export function useActiveSection(
  ids: readonly string[],
  options: UseActiveSectionOptions = {},
): string | undefined {
  const { offset = 0 } = options;
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  // Key on the ids' content, not the array identity — callers rarely memoise.
  const idsKey = ids.join('\n');

  useEffect(() => {
    const idList = idsKey ? idsKey.split('\n') : [];
    if (idList.length === 0) return;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      // Positions decide everything below — never the order of `ids`.
      const sections = idList
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => ({ el, top: el.getBoundingClientRect().top }));
      if (sections.length === 0) {
        setActiveId(undefined);
        return;
      }

      // Bottom of a scrollable page: the lowest section wins even when it is
      // too short to ever reach the line.
      const { scrollHeight } = document.documentElement;
      const viewportBottom = window.innerHeight + window.scrollY;
      if (scrollHeight > window.innerHeight + 1 && viewportBottom >= scrollHeight - 1) {
        setActiveId(sections.reduce((a, b) => (b.top > a.top ? b : a)).el.id);
        return;
      }

      let current: HTMLElement | undefined;
      let currentTop = -Infinity;
      let topmost: HTMLElement | undefined;
      let topmostTop = Infinity;
      for (const { el, top } of sections) {
        // Where an anchor jump would land this element: under the chrome, or
        // at its own scroll margin if that is lower. +1px for subpixel rounding.
        const line = Math.max(offset, parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
        if (top <= line + 1 && top > currentTop) {
          current = el;
          currentTop = top;
        }
        if (top < topmostTop) {
          topmost = el;
          topmostTop = top;
        }
      }
      setActiveId((current ?? topmost)?.id);
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(evaluate);
    };

    // First read on the next frame — after layout, and not as a synchronous
    // state update inside the effect.
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [idsKey, offset]);

  return idsKey ? activeId : undefined;
}
