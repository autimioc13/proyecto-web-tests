import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AnalyticsEvent } from '@/types/analytics';

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events format' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('cf-connecting-ip') ||
      '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || '';

    // Get authenticated user if available
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Process and save events
    const processedEvents = events.map((event: AnalyticsEvent) => ({
      event_type: event.event_type,
      quiz_id: event.quiz_id,
      product_id: event.product_id,
      order_id: event.order_id,
      session_id: event.session_id,
      user_id: user?.id,
      metadata: event.metadata || {},
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    }));

    // Insert events into database
    const { data, error } = await supabase
      .from('events')
      .insert(processedEvents);

    if (error) {
      console.error('[Analytics Track] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save events', details: error.message },
        { status: 500 }
      );
    }

    // Update or create analytics session
    if (events.length > 0 && events[0].session_id) {
      await supabase
        .from('analytics_sessions')
        .upsert({
          session_id: events[0].session_id,
          user_id: user?.id,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id'
        });
    }

    return NextResponse.json({
      success: true,
      message: `Tracked ${events.length} events`,
      inserted: events.length,
    });
  } catch (err) {
    console.error('[Analytics Track] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'health';

    if (action === 'health') {
      return NextResponse.json({
        status: 'ok',
        message: 'Analytics tracking endpoint is running',
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use POST to track events.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('[Analytics Track] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
