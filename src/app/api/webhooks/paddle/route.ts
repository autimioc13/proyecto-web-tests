// src/app/api/webhooks/paddle/route.ts
// Webhook handler for Paddle Billing events.
//
// Paddle notifies us when a transaction completes. We verify the signature,
// then mark the matching pending order as completed and enqueue a confirmation
// email. Events are stored for idempotency/audit.

import { NextRequest, NextResponse } from 'next/server';
import { Paddle, EventName, Environment } from '@paddle/paddle-node-sdk';
import { serviceSupabase as supabase } from '@/lib/supabase/service';
import { enqueueEmail } from '@/lib/email-queue';
import { PADDLE_ENVIRONMENT } from '@/lib/paddle/config';

// Lazily create the Paddle client so importing this route never throws at
// build time when PADDLE_API_KEY is not set.
let paddleClient: Paddle | null = null;
function getPaddle(): Paddle {
  const key = process.env.PADDLE_API_KEY;
  if (!key) {
    throw new Error('PADDLE_API_KEY is not configured');
  }
  if (!paddleClient) {
    paddleClient = new Paddle(key, {
      environment:
        PADDLE_ENVIRONMENT === 'production'
          ? Environment.production
          : Environment.sandbox,
    });
  }
  return paddleClient;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature') || '';
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';
  const rawBody = await req.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event;
  try {
    // Verifies the signature and parses the event
    event = await getPaddle().webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err: any) {
    console.error('[Paddle] Signature verification failed:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ error: 'Empty event' }, { status: 400 });
  }

  // Store event for idempotency + audit (ignore duplicates via unique event_id)
  const { data: existing } = await supabase
    .from('paddle_events')
    .select('id, processed')
    .eq('event_id', event.eventId)
    .maybeSingle();

  if (existing?.processed) {
    // Already handled — acknowledge without reprocessing
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  if (!existing) {
    await supabase.from('paddle_events').insert({
      event_id: event.eventId,
      event_type: event.eventType,
      event_data: event.data as any,
    });
  }

  try {
    if (event.eventType === EventName.TransactionCompleted) {
      await handleTransactionCompleted(event.data as any);
    }

    await supabase
      .from('paddle_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', event.eventId);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[Paddle] Error handling event:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}

async function handleTransactionCompleted(data: any): Promise<void> {
  const customData = data?.customData || {};
  const orderId: string | undefined = customData.orderId;
  const transactionId: string | undefined = data?.id;

  if (!orderId) {
    console.error('[Paddle] transaction.completed missing orderId in customData');
    return;
  }

  // Use the amount actually charged by Paddle when available (smallest unit)
  const paddleTotalRaw = data?.details?.totals?.total;
  const paddleTotal =
    paddleTotalRaw != null && !Number.isNaN(Number(paddleTotalRaw))
      ? Number(paddleTotalRaw)
      : undefined;
  const currency: string | undefined = data?.currencyCode;

  const updates: Record<string, unknown> = {
    status: 'completed',
    paddle_transaction_id: transactionId || null,
    updated_at: new Date().toISOString(),
  };
  if (paddleTotal != null) updates.total_price = paddleTotal;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, customer_email, customer_name, total_price, user_id')
    .single();

  if (orderError || !order) {
    console.error('[Paddle] Could not update order', orderId, orderError);
    return;
  }

  // Enqueue order confirmation email (best-effort)
  if (order.customer_email) {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_title, product_price, quantity')
      .eq('order_id', orderId);

    try {
      await enqueueEmail(
        'order_confirmation',
        {
          customerEmail: order.customer_email,
          customerName: order.customer_name || 'Customer',
          orderId,
          items: items || [],
          totalPrice: paddleTotal ?? order.total_price,
          currency: currency || 'USD',
        },
        order.user_id || undefined
      );
    } catch (err) {
      console.error('[Paddle] Failed to enqueue confirmation email:', err);
    }
  }

  console.log(`[Paddle] Order ${orderId} marked completed (txn ${transactionId})`);
}
