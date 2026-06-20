import { NextRequest, NextResponse } from 'next/server';
import { enqueueEmail } from '@/lib/email-queue';

/**
 * API Route to trigger order confirmation email
 * POST /api/emails/send-order-confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerEmail,
      customerName,
      orderId,
      items,
      totalPrice,
      userId,
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !orderId || !items || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Enqueue email
    await enqueueEmail(
      'order_confirmation',
      {
        customerEmail,
        customerName,
        orderId,
        items,
        totalPrice,
      },
      userId
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Order confirmation email queued',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error queueing order confirmation email:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
