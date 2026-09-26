// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ThemeToggle } from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Core/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

/**
 * The button is named by what pressing it does ("Switch to dark mode"), and
 * the name follows the theme. `labels` translates both names.
 */
export const Default: Story = {
  render: () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('button', { name: 'Switch to dark mode' });
    await userEvent.click(toggle);
    await expect(await canvas.findByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  },
};

/** Norwegian names through `labels`. */
export const Localized: Story = {
  render: () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    return (
      <ThemeToggle
        theme={theme}
        onThemeChange={setTheme}
        labels={{ switchToLight: 'Bytt til lyst tema', switchToDark: 'Bytt til mørkt tema' }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Bytt til lyst tema' }),
    ).toBeInTheDocument();
  },
};
