// src/lib/pricing.ts
// Pure, framework-agnostic order pricing logic.
//
// Centralizing this here means the checkout total is computed in ONE place
// from authoritative product prices (in cents), and can be unit-tested without
// touching Stripe or the database. This is what prevents the historical
// "x100 cents" bug and client-side price tampering from coming back.

export interface CartLine {
  productId: string;
  quantity: number;
}

/** A product as stored in the catalog. `price` is in cents (e.g. 1299 = $12.99). */
export interface CatalogProduct {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
}

export interface OrderLine {
  product_id: string;
  product_title: string;
  product_price: number; // cents
  quantity: number;
}

export interface BuiltOrder {
  amountCents: number;
  items: OrderLine[];
}

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PricingError';
  }
}

/**
 * Collapse cart lines into a map of productId -> total quantity, validating
 * that every quantity is a positive integer.
 */
export function normalizeQuantities(lines: CartLine[]): Map<string, number> {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new PricingError('Cart is empty');
  }

  const quantityById = new Map<string, number>();
  for (const line of lines) {
    const qty = Math.floor(Number(line?.quantity));
    if (!line?.productId || !Number.isFinite(qty) || qty <= 0) {
      throw new PricingError('Invalid cart item');
    }
    quantityById.set(line.productId, (quantityById.get(line.productId) || 0) + qty);
  }
  return quantityById;
}

/**
 * Build an order total (in cents) and per-line breakdown from the requested
 * cart lines and the authoritative catalog products.
 *
 * Throws PricingError if the cart is empty, a product is missing/inactive,
 * a quantity is invalid, or the resulting total is not positive.
 */
export function buildOrder(lines: CartLine[], catalog: CatalogProduct[]): BuiltOrder {
  const quantityById = normalizeQuantities(lines);
  const catalogById = new Map(catalog.map((p) => [p.id, p]));

  let amountCents = 0;
  const items: OrderLine[] = [];

  for (const [productId, quantity] of quantityById) {
    const product = catalogById.get(productId);
    if (!product) {
      throw new PricingError(`Product ${productId} is unavailable`);
    }
    if (!product.is_active) {
      throw new PricingError(`Product ${productId} is not available`);
    }
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new PricingError(`Product ${productId} has an invalid price`);
    }

    amountCents += product.price * quantity;
    items.push({
      product_id: product.id,
      product_title: product.title,
      product_price: product.price,
      quantity,
    });
  }

  if (amountCents <= 0) {
    throw new PricingError('Order total must be greater than 0');
  }

  return { amountCents, items };
}
