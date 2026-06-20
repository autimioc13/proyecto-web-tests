'use client';

// src/lib/paddle/client.ts
// Client-side helper to load Paddle.js and open the overlay checkout.

import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import {
  PADDLE_CLIENT_TOKEN,
  PADDLE_ENVIRONMENT,
  isPaddleConfigured,
} from './config';

let paddlePromise: Promise<Paddle | undefined> | null = null;

/** Lazily initialize a single Paddle.js instance. */
export function getPaddle(): Promise<Paddle | undefined> {
  if (!isPaddleConfigured()) {
    return Promise.reject(
      new Error('Paddle is not configured (missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)')
    );
  }
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: PADDLE_ENVIRONMENT,
      token: PADDLE_CLIENT_TOKEN,
    });
  }
  return paddlePromise;
}

export interface PaddleLineItem {
  priceId: string;
  quantity: number;
}

export interface OpenCheckoutOptions {
  items: PaddleLineItem[];
  email?: string;
  customData?: Record<string, unknown>;
  successUrl?: string;
}

/** Open the Paddle overlay checkout with the given line items. */
export async function openPaddleCheckout(options: OpenCheckoutOptions): Promise<void> {
  const paddle = await getPaddle();
  if (!paddle) {
    throw new Error('Failed to initialize Paddle');
  }

  paddle.Checkout.open({
    items: options.items.map((i) => ({ priceId: i.priceId, quantity: i.quantity })),
    ...(options.email ? { customer: { email: options.email } } : {}),
    ...(options.customData ? { customData: options.customData } : {}),
    settings: {
      displayMode: 'overlay',
      ...(options.successUrl ? { successUrl: options.successUrl } : {}),
    },
  });
}
