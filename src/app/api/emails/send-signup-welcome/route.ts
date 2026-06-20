import { NextRequest, NextResponse } from 'next/server';
import { enqueueEmail } from '@/lib/email-queue';

/**
 * API Route to trigger signup welcome email
 * POST /api/emails/send-signup-welcome
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, displayName, userId } = body;

    // Validate required fields
    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Enqueue email
    await enqueueEmail(
      'signup_welcome',
      {
        email,
        displayName,
      },
      userId
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Signup welcome email queued',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error queueing signup welcome email:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
