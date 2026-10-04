// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Story scaffolding only — not exported from the package.

import React from 'react';
import { View } from 'react-native';
import { RatioProvider, useTheme, type ColorScheme } from './RatioProvider';
import { Text } from './Text';

const Surface: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        minWidth: 280,
        gap: theme.space.s,
        padding: theme.space.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
      }}
    >
      <Text size="xs" tone="subtle" family="mono">
        {label}
      </Text>
      {children}
    </View>
  );
};

/** The story in Bureau light and Bureau dark, side by side, on the theme's own paper. */
export const BothModes: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
    {(['light', 'dark'] as ColorScheme[]).map(scheme => (
      <RatioProvider key={scheme} colorScheme={scheme}>
        <Surface label={`bureau · ${scheme}`}>{children}</Surface>
      </RatioProvider>
    ))}
  </View>
);
