// src/app/api/webhooks/stripe/route.ts
// Webhook handler for Stripe events

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lazily create the Stripe client so importing this route never throws at
// build time when STRIPE_SECRET_KEY is not set.
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: '2024-06-20' as any });
  }
  return stripeClient;
}

// Types for Stripe events
type StripeEvent = Stripe.Event;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: StripeEvent;
    try {
      event = getStripe().webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Log the event
    console.log(`Received Stripe event: ${event.type}`);

    // Store event in database for audit trail
    const { data: eventRecord, error: eventError } = await supabase
      .from('stripe_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error storing event in database:', eventError);
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, eventRecord?.id);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, eventRecord?.id);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, eventRecord?.id);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent, eventRecord?.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Mark event as processed
    if (eventRecord) {
      await supabase
        .from('stripe_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', eventRecord.id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  eventId?: string
) {
  try {
    // Get metadata
    const { userId, orderId } = paymentIntent.metadata;

    if (!userId || !orderId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Update stripe_payments table
    const { error: paymentError } = await supabase
      .from('stripe_payments')
      .update({
        status: 'succeeded',
        stripe_charge_id:
          typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge?.id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (paymentError) {
      console.error('Error updating payment status:', paymentError);
      return;
    }

    // Update order status to completed
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    console.log(`Payment succeeded for order ${orderId}`);

    // TODO: Send email confirmation to customer
    // TODO: Send webhook notification to admin
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  eventId?: string
) {
  try {
    const { userId, orderId } = paymentIntent.metadata;

    if (!userId || !orderId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Update stripe_payments table
    const { error: paymentError } = await supabase
      .from('stripe_payments')
      .update({
        status: 'failed',
        error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (paymentError) {
      console.error('Error updating payment status:', paymentError);
      return;
    }

    // Update order status to failed
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    console.log(`Payment failed for order ${orderId}`);

    // TODO: Send email notification to customer about failed payment
  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error);
  }
}

// Handle charge refunded
async function handleChargeRefunded(
  charge: Stripe.Charge,
  eventId?: string
) {
  try {
    // Find the related payment by charge ID
    const { data: payment, error: findError } = await supabase
      .from('stripe_payments')
      .select('*')
      .eq('stripe_charge_id', charge.id)
      .single();

    if (findError || !payment) {
      console.error('Payment not found for charge:', charge.id);
      return;
    }

    // Update stripe_payments table
    const { error: updateError } = await supabase
      .from('stripe_payments')
      .update({
        status: 'refunded',
        refund_reason: charge.refunds?.data[0]?.reason || 'Refund issued',
        refunded_amount: charge.amount_refunded,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating refund status:', updateError);
      return;
    }

    console.log(`Refund processed for payment ${payment.id}`);

    // TODO: Update order status if fully refunded
    // TODO: Send email notification to customer about refund
  } catch (error) {
    console.error('Error in handleChargeRefunded:', error);
  }
}

// Handle payment intent canceled
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  eventId?: string
) {
  try {
    // Update stripe_payments table
    const { error: updateError } = await supabase
      .from('stripe_payments')
      .update({
        status: 'failed',
        error_message: 'Payment intent was canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return;
    }

    console.log(`Payment intent canceled: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error in handlePaymentIntentCanceled:', error);
  }
}
