// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton } from './ActionButton';
import { Text } from '../Text';
import { Bell, Check, Download, MenuIcon, Pause, Play, Plus } from '../../icons';

const meta: Meta<typeof ActionButton> = {
  title: 'Core/ActionButton (beta)',
  component: ActionButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ICON = 15;

/**
 * The scriptorium toolbar: compact chrome for dense surfaces. Icon-only
 * buttons stay square (pass `ariaLabel`!); the one prominent action per
 * toolbar gets `variant="solid"`. (For copy-to-clipboard actions, reach for
 * `CopyButton` instead — it owns the copied-feedback state.)
 */
export const Toolbar: Story = {
  render: () => (
    <div className="flex items-center gap-1.5">
      <ActionButton ariaLabel="Pause copying">
        <Pause size={ICON} />
      </ActionButton>
      <ActionButton ariaLabel="Resume copying">
        <Play size={ICON} />
      </ActionButton>
      <ActionButton ariaLabel="Proofread">
        <Check size={ICON} />
      </ActionButton>
      <ActionButton variant="solid">
        <Plus size={ICON} />
        Add evidence
      </ActionButton>
    </div>
  ),
};

/**
 * Icon + label — as a plain string or wrapped in `Text`; both get the same
 * padding. (They didn't always: a CSS-based icon-only check missed text
 * nodes and stripped the padding from `<Pause /> Pause`.)
 */
export const IconAndText: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ActionButton>
        <Pause size={ICON} />
        Pause
      </ActionButton>
      <ActionButton>
        <Pause size={ICON} />
        <Text as="span" weight="medium">
          Pause
        </Text>
      </ActionButton>
    </div>
  ),
};

/** The three variants — default (card-toned), `ghost` (transparent), `solid` — plus disabled. */
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ActionButton>
        <Download size={ICON} />
        Download
      </ActionButton>
      <ActionButton variant="ghost">
        <Download size={ICON} />
        Download
      </ActionButton>
      <ActionButton variant="solid">
        <Download size={ICON} />
        Download
      </ActionButton>
      <ActionButton disabled>
        <Download size={ICON} />
        Originals never leave
      </ActionButton>
    </div>
  ),
};

/** The three sizes: `sm` (24) · `md` (28, default) · `lg` (36). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ActionButton size="sm">
        <Download size={13} />
        Download
      </ActionButton>
      <ActionButton size="md">
        <Download size={ICON} />
        Download
      </ActionButton>
      <ActionButton size="lg">
        <Download size={17} />
        Download
      </ActionButton>
    </div>
  ),
};

/**
 * `round` makes the button fully circular — burger buttons, bell buttons,
 * and the clear-X inside inputs. Here: the reading-room bell rung when the
 * day's scroll deliveries arrived.
 */
export const Round: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ActionButton round ariaLabel="Open menu">
        <MenuIcon size={16} />
      </ActionButton>
      <ActionButton round size="lg" ariaLabel="New deliveries">
        <Bell size={18} />
      </ActionButton>
      <ActionButton round variant="solid" ariaLabel="Add scroll">
        <Plus size={16} />
      </ActionButton>
    </div>
  ),
};
