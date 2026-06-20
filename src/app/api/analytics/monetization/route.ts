import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  calculateCPMFromMicros,
  estimateRevenueMicros,
  calculateCompletionRate,
} from '@/lib/monetization';

// GET /api/analytics/monetization
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

    // Get monetization logs
    let query = supabase
      .from('monetization_log')
      .select('*');

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: logs, error } = await query.order('date', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate aggregated metrics
    const totalImpressions = logs?.reduce((sum, log) => sum + log.impression_count, 0) || 0;
    const totalCompletions = logs?.reduce((sum, log) => sum + log.completion_count, 0) || 0;
    const totalConversions = logs?.reduce((sum, log) => sum + log.conversion_count, 0) || 0;
    const totalRevenueMicros = logs?.reduce((sum, log) => sum + log.total_revenue_micros, 0) || 0;

    const avgCPM = calculateCPMFromMicros(totalRevenueMicros, totalImpressions);
    const completionRate = calculateCompletionRate(totalCompletions, totalImpressions);
    const conversionRate =
      totalImpressions === 0 ? 0 : (totalConversions / totalImpressions) * 100;

    return NextResponse.json({
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        total_impressions: totalImpressions,
        total_completions: totalCompletions,
        total_conversions: totalConversions,
        total_revenue_usd: totalRevenueMicros / 1000000,
        total_revenue_micros: totalRevenueMicros,
        avg_cpm: avgCPM,
        completion_rate: completionRate,
        conversion_rate: conversionRate,
      },
      daily_breakdown: logs?.map((log) => ({
        date: log.date,
        impressions: log.impression_count,
        completions: log.completion_count,
        conversions: log.conversion_count,
        revenue_usd: log.total_revenue_micros / 1000000,
        revenue_micros: log.total_revenue_micros,
        cpm: log.cpm_rate,
      })) || [],
    });
  } catch (err) {
    console.error('[Analytics Monetization] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
