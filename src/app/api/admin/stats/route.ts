import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Today's orders
    const { data: todayOrders, count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())
      .eq('status', 'completed');

    // Yesterday's orders
    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())
      .eq('status', 'completed');

    // Calculate revenue
    const todayRevenue = (todayOrders || []).reduce(
      (sum, order) => sum + (order.total_price || 0),
      0
    );
    const yesterdayRevenue = (yesterdayOrders || []).reduce(
      (sum, order) => sum + (order.total_price || 0),
      0
    );

    // Active quizzes (from tests table)
    const { count: activeTests } = await supabase
      .from('tests')
      .select('*', { count: 'exact' });

    // Last 7 days revenue for chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const { data: dailyOrders } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
        .eq('status', 'completed');

      const revenue = (dailyOrders || []).reduce(
        (sum, order) => sum + (order.total_price || 0),
        0
      );

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue,
      });
    }

    // Revenue change percentage
    const revenueChange =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
          ? 100
          : 0;

    // Orders change percentage
    const yesterdayOrdersCount = yesterdayOrders?.length ?? 0;
    const ordersChange = yesterdayOrdersCount > 0
      ? ((ordersCount! - yesterdayOrdersCount) / yesterdayOrdersCount) * 100
      : ordersCount! > 0
        ? 100
        : 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        ordersToday: ordersCount || 0,
        revenueToday: todayRevenue,
        revenueChange: Math.round(revenueChange),
        ordersChange: Math.round(ordersChange),
        activeTests: activeTests || 0,
      },
      chartData: last7Days,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
