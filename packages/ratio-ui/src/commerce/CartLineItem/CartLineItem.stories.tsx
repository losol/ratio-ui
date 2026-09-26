// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { NumberField } from '../../forms';
import { OrderSummary } from '../OrderSummary';
import { CartLineItem, type CartLineItemData } from './CartLineItem';

const formatPrice = (amount: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const item: CartLineItemData = {
  productId: 'elements',
  title: 'Euclid, Elements (Byrne edition)',
  quantity: 2,
  pricePerUnitIncVat: 450,
  vatAmount: 90,
  lineTotalIncVat: 900,
  currency: 'NOK',
};

const meta: Meta<typeof CartLineItem> = {
  title: 'Commerce/CartLineItem',
  component: CartLineItem,
  tags: ['autodocs'],
  args: {
    item,
    locale: 'en',
    formatPrice,
    showQuantityControls: true,
    onQuantityChange: fn(),
    onRemove: fn(),
    QuantityField: NumberField,
  },
};

export default meta;
type Story = StoryObj<typeof CartLineItem>;

/** English defaults. */
export const Default: Story = {};

/** Norwegian through `labels`, inside an `OrderSummary` with its own `labels`. */
export const Norwegian: Story = {
  render: (args) => (
    <OrderSummary
      summary={{ items: [item], subtotalExVat: 720, totalVat: 180, totalIncVat: 900, currency: 'NOK' }}
      locale="nb"
      formatPrice={formatPrice}
      title="Ordresammendrag"
      showVatBreakdown
      labels={{ subtotalExVat: 'Subtotal (eks. mva)', vat: 'MVA', total: 'Totalt' }}
    >
      <CartLineItem
        {...args}
        locale="nb"
        labels={{
          vatAmount: (vat) => `inkl. mva ${vat}`,
          totalIncludesVat: 'inkl. mva',
          quantity: 'Antall',
          decreaseQuantity: 'Reduser antall',
          increaseQuantity: 'Øk antall',
          remove: 'Fjern',
        }}
      />
    </OrderSummary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Fjern' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Øk antall' })).toBeInTheDocument();
    await expect(canvas.getByText('inkl. mva')).toBeInTheDocument();
    await expect(canvas.getByText('MVA')).toBeInTheDocument();
  },
};
