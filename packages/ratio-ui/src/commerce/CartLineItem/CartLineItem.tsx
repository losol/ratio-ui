// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

export interface CartLineItemData {
  productId: string;
  title: string;
  quantity: number;
  pricePerUnitIncVat: number;
  vatAmount: number;
  lineTotalIncVat: number;
  currency: string;
}

/** Built-in text of `CartLineItem`. Each entry falls back to English. */
export interface CartLineItemLabels {
  /** VAT note after the unit price, given the formatted VAT amount. @default (vat) => `incl. VAT ${vat}` */
  vatAmount?: (formattedVat: string) => string;
  /** Note under the line total. @default 'incl. VAT' */
  totalIncludesVat?: string;
  /** Name of the quantity field. @default 'Quantity' */
  quantity?: string;
  /** Name of the decrement button. @default 'Decrease quantity' */
  decreaseQuantity?: string;
  /** Name of the increment button. @default 'Increase quantity' */
  increaseQuantity?: string;
  /** Text of the remove button. @default 'Remove' */
  remove?: string;
}

export interface CartLineItemProps {
  /** Line item data */
  item: CartLineItemData;
  /** Locale for price formatting */
  locale: string;
  /** Format price function */
  formatPrice: (amount: number, currency: string, locale: string) => string;
  /** Whether to show quantity controls */
  showQuantityControls?: boolean;
  /** Quantity change handler */
  onQuantityChange?: (productId: string, quantity: number) => void;
  /** Remove handler */
  onRemove?: (productId: string) => void;
  /** Test ID prefix */
  testIdPrefix?: string;
  /** Built-in text. Each entry falls back to English. */
  labels?: CartLineItemLabels;
  /** Quantity field component (optional for customization) */
  QuantityField?: React.ComponentType<{
    value: number;
    minValue: number;
    onChange: (value: number) => void;
    decrementAriaLabel: string;
    incrementAriaLabel: string;
    'aria-label': string;
    testId?: string;
  }>;
}

/**
 * CartLineItem - Display a single cart line item with optional quantity controls
 *
 * @example
 * ```tsx
 * import { CartLineItem } from '@eventuras/ratio-ui/commerce/CartLineItem';
 * import { formatPrice } from '@eventuras/core/currency';
 * import { NumberField } from '@eventuras/ratio-ui/forms';
 *
 * <CartLineItem
 *   item={lineItem}
 *   locale="nb"
 *   formatPrice={formatPrice}
 *   showQuantityControls
 *   onQuantityChange={(id, qty) => updateCart(id, qty)}
 *   onRemove={(id) => removeFromCart(id)}
 *   QuantityField={NumberField}
 * />
 * ```
 */
export const CartLineItem: React.FC<CartLineItemProps> = ({
  item,
  locale,
  formatPrice,
  showQuantityControls = false,
  onQuantityChange,
  onRemove,
  testIdPrefix = 'cart-item',
  QuantityField,
  labels,
}) => {
  const {
    vatAmount = (vat: string) => `incl. VAT ${vat}`,
    totalIncludesVat = 'incl. VAT',
    quantity = 'Quantity',
    decreaseQuantity = 'Decrease quantity',
    increaseQuantity = 'Increase quantity',
    remove = 'Remove',
  } = labels ?? {};

  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-(--text) truncate">
          {item.title}
        </p>
        <p className="mt-1 text-xs text-(--text-subtle)">
          {item.quantity} x {formatPrice(item.pricePerUnitIncVat, item.currency, locale)}
          {' '}({vatAmount(formatPrice(item.vatAmount, item.currency, locale))})
        </p>

        {showQuantityControls && QuantityField && onQuantityChange && (
          <div className="mt-2">
            <QuantityField
              value={item.quantity}
              minValue={0}
              onChange={(nextQuantity: number) => {
                if (nextQuantity === 0 && onRemove) {
                  onRemove(item.productId);
                  return;
                }
                onQuantityChange(item.productId, nextQuantity);
              }}
              decrementAriaLabel={decreaseQuantity}
              incrementAriaLabel={increaseQuantity}
              aria-label={quantity}
              testId={`${testIdPrefix}-quantity-${item.productId}`}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        {showQuantityControls && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="text-sm text-error-text hover:opacity-80"
          >
            {remove}
          </button>
        )}
        <div className="text-right">
          <p className="text-sm font-semibold text-(--text) whitespace-nowrap">
            {formatPrice(item.lineTotalIncVat, item.currency, locale)}
          </p>
          <p className="text-xs text-(--text-subtle)">
            {totalIncludesVat}
          </p>
        </div>
      </div>
    </div>
  );
};
