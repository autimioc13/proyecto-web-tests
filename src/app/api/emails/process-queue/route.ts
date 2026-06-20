import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue, getEmailQueueStats } from '@/lib/email-queue';

/**
 * API Route to process email queue
 * Called by cron job every 5 minutes
 * POST /api/emails/process-queue
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (expect a cron secret header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Email queue processing started...');

    // Process the queue
    await processEmailQueue();

    // Get stats
    const stats = await getEmailQueueStats();

    return NextResponse.json(
      {
        success: true,
        message: 'Email queue processed successfully',
        stats,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email queue processing:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking queue status
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow GET if it's from localhost or has valid auth
    const isLocalhost = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';
    if (!isLocalhost && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getEmailQueueStats();

    return NextResponse.json(
      {
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting email queue stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
