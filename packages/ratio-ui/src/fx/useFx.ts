// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { FxEffect } from '@eventuras/ratio-ui-core/fx';
import { play, type FxPlayback, type PlayOptions } from './play';

/**
 * `play()` for a component: every effect it starts is taken off the page
 * when the component unmounts, so a closed dialog leaves no confetti behind.
 *
 * @example
 * const fx = useFx();
 * <Button onPress={(e) => fx(confetti, { origin: e.target })}>Done</Button>
 */
export function useFx() {
  const playing = useRef(new Set<FxPlayback>());

  useEffect(() => {
    const current = playing.current;
    return () => {
      for (const playback of current) playback.stop();
      current.clear();
    };
  }, []);

  return useCallback(
    <Options,>(effect: FxEffect<Options>, options?: Partial<Options> & PlayOptions): FxPlayback => {
      const playback = play(effect, options);
      playing.current.add(playback);
      void playback.finished.then(() => playing.current.delete(playback));
      return playback;
    },
    [],
  );
}
