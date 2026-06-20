import { describe, it, expect } from 'vitest';
import {
  buildOrder,
  normalizeQuantities,
  PricingError,
  type CatalogProduct,
} from '@/lib/pricing';

const catalog: CatalogProduct[] = [
  { id: 'personality-deep-dive', title: 'Personality Deep Dive Report', price: 1299, is_active: true },
  { id: 'basic-certificate', title: 'QuizLab Achievement Certificate', price: 499, is_active: true },
  { id: 'retired-product', title: 'Retired', price: 999, is_active: false },
];

describe('normalizeQuantities', () => {
  it('throws on an empty cart', () => {
    expect(() => normalizeQuantities([])).toThrow(PricingError);
  });

  it('merges duplicate product lines', () => {
    const map = normalizeQuantities([
      { productId: 'a', quantity: 1 },
      { productId: 'a', quantity: 2 },
    ]);
    expect(map.get('a')).toBe(3);
  });

  it('rejects zero, negative, and non-integer quantities', () => {
    expect(() => normalizeQuantities([{ productId: 'a', quantity: 0 }])).toThrow(PricingError);
    expect(() => normalizeQuantities([{ productId: 'a', quantity: -1 }])).toThrow(PricingError);
    expect(() => normalizeQuantities([{ productId: 'a', quantity: NaN as any }])).toThrow(PricingError);
  });

  it('rejects missing productId', () => {
    expect(() => normalizeQuantities([{ productId: '', quantity: 1 }])).toThrow(PricingError);
  });
});

describe('buildOrder', () => {
  it('computes the total in cents (no x100 bug)', () => {
    // 1 x $12.99 => 1299 cents, NOT 129900
    const { amountCents } = buildOrder(
      [{ productId: 'personality-deep-dive', quantity: 1 }],
      catalog
    );
    expect(amountCents).toBe(1299);
  });

  it('sums quantities and multiple products correctly', () => {
    // 2 x 1299 + 3 x 499 = 2598 + 1497 = 4095 cents
    const { amountCents, items } = buildOrder(
      [
        { productId: 'personality-deep-dive', quantity: 2 },
        { productId: 'basic-certificate', quantity: 3 },
      ],
      catalog
    );
    expect(amountCents).toBe(4095);
    expect(items).toHaveLength(2);
    const cert = items.find((i) => i.product_id === 'basic-certificate')!;
    expect(cert.product_price).toBe(499);
    expect(cert.quantity).toBe(3);
  });

  it('ignores any price the client might try to send (uses catalog price)', () => {
    // Even if a malicious client sends extra fields, only productId/quantity are read
    const malicious = [
      { productId: 'personality-deep-dive', quantity: 1, price: 1 } as any,
    ];
    const { amountCents } = buildOrder(malicious, catalog);
    expect(amountCents).toBe(1299);
  });

  it('rejects unknown products', () => {
    expect(() =>
      buildOrder([{ productId: 'does-not-exist', quantity: 1 }], catalog)
    ).toThrow(PricingError);
  });

  it('rejects inactive products', () => {
    expect(() =>
      buildOrder([{ productId: 'retired-product', quantity: 1 }], catalog)
    ).toThrow(/not available/);
  });

  it('rejects an empty cart', () => {
    expect(() => buildOrder([], catalog)).toThrow(PricingError);
  });
});
