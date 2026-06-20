// src/app/api/payments/paddle/create-order/route.ts
// Creates a PENDING order (with server-computed prices) before opening the
// Paddle overlay. Paddle then charges the customer; the webhook marks the
// order as completed. Prices are NEVER trusted from the client.

import { NextRequest, NextResponse } from 'next/server';
import { buildOrder, PricingError, type CartLine } from '@/lib/pricing';
import { serviceSupabase as supabase } from '@/lib/supabase/service';

interface CreateOrderRequest {
  items: CartLine[];
  customerEmail: string;
  customerName?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderRequest = await req.json();
    const { items, customerEmail, customerName, userId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Missing customer email' },
        { status: 400 }
      );
    }

    const productIds = Array.from(
      new Set(items.map((line) => line?.productId).filter(Boolean))
    );
    if (productIds.length === 0) {
      return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
    }

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

    // Server-computed total (pure, tested logic)
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        total_price: amountCents,
        status: 'pending',
        payment_method: 'card',
        customer_name: customerName || null,
        customer_email: customerEmail,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const orderId: string = order.id;

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsBase.map((item) => ({ ...item, order_id: orderId })));

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      await supabase.from('orders').delete().eq('id', orderId);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderId, amount: amountCents }, { status: 200 });
  } catch (error) {
    console.error('Error creating Paddle order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
