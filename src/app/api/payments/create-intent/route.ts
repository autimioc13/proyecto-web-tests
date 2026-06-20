// src/app/api/payments/create-intent/route.ts
// Endpoint to create a Stripe PaymentIntent for checkout.
//
// SECURITY: prices are NEVER trusted from the client. The client sends only
// product ids + quantities; the server looks up the authoritative prices from
// the `products` table, computes the total, and creates the order, order items,
// payment record and Stripe PaymentIntent. This prevents price tampering and
// the historical cents/dollars double-conversion bug.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buildOrder, PricingError, type CartLine } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PaymentIntentRequest {
  items: CartLine[];
  customerEmail: string;
  customerName: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PaymentIntentRequest = await req.json();
    const { items, customerEmail, customerName, userId } = body;

    // ---- Validate input (no prices accepted from the client) ----
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing customer information' },
        { status: 400 }
      );
    }

    // Collect unique product ids requested by the client
    const productIds = Array.from(
      new Set(items.map((line) => line?.productId).filter(Boolean))
    );

    if (productIds.length === 0) {
      return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
    }

    // ---- Fetch authoritative prices from the database ----
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, price, is_active')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      );
    }

    // ---- Compute the total server-side (pure, tested logic) ----
    let amountCents: number;
    let orderItemsBase: {
      product_id: string;
      product_title: string;
      product_price: number;
      quantity: number;
    }[];

    try {
      const built = buildOrder(items, products || []);
      amountCents = built.amountCents;
      orderItemsBase = built.items;
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // ---- Create the order (DB generates the id) ----
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        total_price: amountCents, // stored in cents
        status: 'pending',
        payment_method: 'card',
        customer_name: customerName,
        customer_email: customerEmail,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const orderId: string = order.id;

    // ---- Create order items ----
    const { error: itemsError } = await supabase.from('order_items').insert(
      orderItemsBase.map((item) => ({ ...item, order_id: orderId }))
    );

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Roll back the order so we don't leave an orphan
      await supabase.from('orders').delete().eq('id', orderId);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // ---- Create the Stripe PaymentIntent (amount already in cents) ----
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      description: `Order ${orderId} from QuizLab`,
      metadata: {
        userId: userId || '',
        orderId,
        customerName,
      },
      receipt_email: customerEmail,
    });

    // ---- Persist the payment record ----
    const { data: paymentData, error: paymentError } = await supabase
      .from('stripe_payments')
      .insert({
        user_id: userId || null,
        order_id: orderId,
        amount: amountCents,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_client_secret: paymentIntent.client_secret,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving payment to database:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: paymentData.id,
        orderId,
        amount: amountCents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error creating payment intent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve payment intent status
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json(
      {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    );
  }
}
