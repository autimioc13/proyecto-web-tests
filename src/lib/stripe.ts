// src/lib/stripe.ts
// Stripe utility functions for client-side integration

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

interface CartLine {
  productId: string;
  quantity: number;
}

interface CreatePaymentIntentRequest {
  items: CartLine[];
  customerEmail: string;
  customerName: string;
  userId?: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  paymentId: string;
  orderId: string;
  amount: number;
}

export async function createPaymentIntent(
  data: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> {
  try {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment intent');
    }

    const paymentData: PaymentIntentResponse = await response.json();
    return paymentData;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

interface PaymentIntentStatusResponse {
  status: string;
  amount: number;
  currency: string;
}

export async function getPaymentIntentStatus(
  paymentIntentId: string
): Promise<PaymentIntentStatusResponse> {
  try {
    const response = await fetch(
      `/api/payments/create-intent?paymentIntentId=${paymentIntentId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to retrieve payment status');
    }

    const status: PaymentIntentStatusResponse = await response.json();
    return status;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}

// Stripe Payment Element styles
export const stripeElementOptions = {
  layout: 'tabs' as const,
  defaultValues: {
    billingDetails: {
      name: '',
      email: '',
    },
  },
};

// Appearance options for Stripe Elements
export const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#a78bfa',
    colorBackground: '#1e293b',
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '.Input:focus': {
      border: '1px solid rgba(255, 255, 255, 0.4)',
    },
  },
};
