// src/lib/paddle/config.ts
// Central Paddle configuration.
//
// Paddle is a Merchant of Record: it charges the customer in their local
// currency (USD, EUR, COP, ...), handles global sales tax/VAT, and pays out
// to your account. We map each internal product id to a Paddle "price id"
// (price_xxx) that you create in the Paddle dashboard.

export type PaddleEnvironment = 'sandbox' | 'production';

export const PADDLE_ENVIRONMENT: PaddleEnvironment =
  (process.env.NEXT_PUBLIC_PADDLE_ENV as PaddleEnvironment) || 'sandbox';

export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

/**
 * Map of internal product id -> Paddle price id.
 *
 * Create a Product + Price in the Paddle dashboard for each item, then paste
 * the generated price id (looks like `pri_01h...`) here. Until these are set,
 * the checkout button will tell the user the item is not yet purchasable.
 *
 * The values can also be provided via a single env var as JSON in
 * NEXT_PUBLIC_PADDLE_PRICE_IDS, which takes precedence when present.
 */
const STATIC_PRICE_IDS: Record<string, string> = {
  'personality-deep-dive': '',
  'logic-advanced-course': '',
  'intelligence-fundamentals-course': '',
  'productivity-mastery': '',
  'basic-certificate': '',
  'premium-certificate': '',
  'knowledge-master-bundle': '',
  'serious-learner-bundle': '',
  'developer-api-access': '',
};

function loadPriceIds(): Record<string, string> {
  const raw = process.env.NEXT_PUBLIC_PADDLE_PRICE_IDS;
  if (raw) {
    try {
      return { ...STATIC_PRICE_IDS, ...JSON.parse(raw) };
    } catch {
      console.warn('[Paddle] NEXT_PUBLIC_PADDLE_PRICE_IDS is not valid JSON; ignoring.');
    }
  }
  return STATIC_PRICE_IDS;
}

export const PADDLE_PRICE_IDS = loadPriceIds();

/** Returns the Paddle price id for an internal product id, or null if not configured. */
export function getPaddlePriceId(productId: string): string | null {
  const id = PADDLE_PRICE_IDS[productId];
  return id && id.trim().length > 0 ? id : null;
}

export function isPaddleConfigured(): boolean {
  return PADDLE_CLIENT_TOKEN.trim().length > 0;
}
