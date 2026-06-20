import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/analytics/aggregate
// This is a cron endpoint that aggregates events into monetization_log
export async function POST(req: NextRequest) {
  try {
    // Verify authorization (could be from a cron service with a secret token)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      // Allow calls from localhost for testing
      const isLocalhost =
        req.headers.get('host')?.includes('localhost') ||
        req.headers.get('host')?.includes('127.0.0.1');

      if (!isLocalhost) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies) {
            cookies.forEach((cookie) => cookieStore.set(cookie.name, cookie.value));
          },
        },
      }
    );

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    // Get events from today
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', today.toISOString());

    if (eventsError) {
      throw eventsError;
    }

    // Aggregate by event type and quiz_id
    const aggregated = new Map<string, any>();

    events?.forEach((event) => {
      const key = `${event.event_type}_${event.quiz_id || 'global'}`;
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          date: todayString,
          event_type: event.event_type,
          quiz_id: event.quiz_id,
          impression_count: 0,
          completion_count: 0,
          click_count: 0,
          conversion_count: 0,
          cpm_rate: 2.5, // Default CPM
          total_revenue_micros: 0,
        });
      }

      const entry = aggregated.get(key);

      // Count by event type
      if (event.event_type === 'ad_impression') {
        entry.impression_count += 1;
      } else if (event.event_type === 'quiz_completed') {
        entry.completion_count += 1;
      } else if (event.event_type === 'product_viewed') {
        entry.click_count += 1;
      } else if (event.event_type === 'order_created') {
        entry.conversion_count += 1;
      }

      aggregated.set(key, entry);
    });

    // Upsert into monetization_log
    const entries = Array.from(aggregated.values());
    const { error: upsertError } = await supabase
      .from('monetization_log')
      .upsert(entries, {
        onConflict: 'date,event_type,quiz_id',
      });

    if (upsertError) {
      throw upsertError;
    }

    // Clean up old events (>90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString());

    if (deleteError) {
      console.warn('[Analytics Aggregate] Error cleaning old events:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: `Aggregated ${entries.length} metrics entries`,
      date: todayString,
      entries_count: entries.length,
    });
  } catch (err) {
    console.error('[Analytics Aggregate] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      const isLocalhost =
        req.headers.get('host')?.includes('localhost') ||
        req.headers.get('host')?.includes('127.0.0.1');

      if (!isLocalhost) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Aggregation endpoint is ready. Use POST to trigger aggregation.',
      endpoint: '/api/analytics/aggregate',
      method: 'POST',
    });
  } catch (err) {
    console.error('[Analytics Aggregate] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
