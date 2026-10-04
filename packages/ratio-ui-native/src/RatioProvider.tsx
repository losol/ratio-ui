// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  resolveTheme,
  type ResolvedMode,
  type ResolvedTheme,
  type ShadowKey,
  type Theme,
} from '@eventuras/ratio-ui-core';
import { bureau } from '@eventuras/ratio-ui-core/themes/bureau';

export type ColorScheme = 'light' | 'dark';

/** The theme as a component reads it: one mode's colours, and the rest of the theme. @beta */
export interface RatioTheme extends Omit<ResolvedTheme, 'light' | 'dark'> {
  scheme: ColorScheme;
  /** The colours of the mode in use. */
  colors: ResolvedMode;
  /**
   * A shadow of the mode in use, as a `boxShadow` value (React Native 0.76
   * and up). `undefined` for `null`, so it can go straight into a style.
   */
  shadow: (key: ShadowKey | null) => string | undefined;
}

const toRatioTheme = (resolved: ResolvedTheme, scheme: ColorScheme): RatioTheme => {
  const { light, dark, ...rest } = resolved;
  const colors = scheme === 'dark' ? dark : light;
  return {
    ...rest,
    scheme,
    colors,
    shadow: key => {
      if (!key) return undefined;
      const { x, y, blur, color } = colors[key];
      return `${x}px ${y}px ${blur}px ${color}`;
    },
  };
};

const RatioContext = createContext<RatioTheme | null>(null);

// Bureau is the default theme, resolved once for every app that sets none.
const defaultResolved = resolveTheme(bureau);

/** @beta Prop shape may change before release. */
export interface RatioProviderProps {
  /** The theme, as `@eventuras/ratio-ui-core` authors it. @default bureau */
  theme?: Theme;
  /** Force light or dark. @default the device's setting */
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
}

/**
 * Puts a theme in reach of every Ratio component below it, in the device's
 * light or dark mode unless `colorScheme` says otherwise.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const RatioProvider: React.FC<RatioProviderProps> = ({ theme, colorScheme, children }) => {
  const system = useColorScheme();
  const scheme: ColorScheme = colorScheme ?? (system === 'dark' ? 'dark' : 'light');
  const resolved = useMemo(() => (theme ? resolveTheme(theme) : defaultResolved), [theme]);
  const value = useMemo(() => toRatioTheme(resolved, scheme), [resolved, scheme]);
  return <RatioContext.Provider value={value}>{children}</RatioContext.Provider>;
};

/**
 * The theme in use. Without a `RatioProvider` above, Bureau in the device's
 * mode — so a component works on its own, and a provider is only needed to
 * choose.
 *
 * @beta The shape of the theme it returns may change before release.
 */
export function useTheme(): RatioTheme {
  const fromProvider = useContext(RatioContext);
  const system = useColorScheme();
  const fallback = useMemo(
    () => toRatioTheme(defaultResolved, system === 'dark' ? 'dark' : 'light'),
    [system],
  );
  return fromProvider ?? fallback;
}
