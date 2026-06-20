import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/analytics/stats
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const quizId = searchParams.get('quiz_id');

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' });

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', new Date(endDate).toISOString());
    }

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data: events, count, error } = await query;

    if (error) {
      throw error;
    }

    // Aggregate stats
    const stats = {
      total_events: count || 0,
      by_event_type: {} as Record<string, number>,
      by_quiz_id: {} as Record<string, number>,
    };

    events?.forEach((event) => {
      stats.by_event_type[event.event_type] =
        (stats.by_event_type[event.event_type] || 0) + 1;

      if (event.quiz_id) {
        stats.by_quiz_id[event.quiz_id] =
          (stats.by_quiz_id[event.quiz_id] || 0) + 1;
      }
    });

    return NextResponse.json({ stats });
  } catch (err) {
    console.error('[Analytics Stats] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
