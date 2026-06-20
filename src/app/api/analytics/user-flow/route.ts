import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { analyzeFunnelMetrics } from '@/lib/monetization';

// GET /api/analytics/user-flow
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

    // Query conversion funnel data
    let query = supabase
      .from('conversion_funnel')
      .select('*');

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', new Date(endDate).toISOString());
    }

    const { data: funnelData, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate metrics
    const totalUsers = funnelData?.length || 0;
    const quizStarters =
      funnelData?.filter((f) => f.step_1_quiz_started).length || 0;
    const quizCompleters =
      funnelData?.filter((f) => f.step_2_quiz_completed).length || 0;
    const resultViewers =
      funnelData?.filter((f) => f.step_3_result_viewed).length || 0;
    const productViewers =
      funnelData?.filter((f) => f.step_4_product_viewed).length || 0;
    const cartAdders =
      funnelData?.filter((f) => f.step_5_product_added_to_cart).length || 0;
    const checkoutStarters =
      funnelData?.filter((f) => f.step_6_checkout_started).length || 0;
    const converters =
      funnelData?.filter((f) => f.step_7_order_created).length || 0;

    const userFlow = {
      total_users: totalUsers,
      quiz_starters: quizStarters,
      quiz_completers: quizCompleters,
      result_viewers: resultViewers,
      product_viewers: productViewers,
      cart_adders: cartAdders,
      checkout_starters: checkoutStarters,
      converters: converters,
      funnel_drop_off: [] as any[],
    };

    const analysis = analyzeFunnelMetrics(userFlow);

    return NextResponse.json({
      period: {
        start: startDate,
        end: endDate,
      },
      user_flow: userFlow,
      funnel_analysis: analysis,
      step_conversion_rates: [
        {
          step: 'Quiz Started',
          users: quizStarters,
          conversion_rate: totalUsers === 0 ? 0 : (quizStarters / totalUsers) * 100,
        },
        {
          step: 'Quiz Completed',
          users: quizCompleters,
          conversion_rate: quizStarters === 0 ? 0 : (quizCompleters / quizStarters) * 100,
        },
        {
          step: 'Result Viewed',
          users: resultViewers,
          conversion_rate: quizCompleters === 0 ? 0 : (resultViewers / quizCompleters) * 100,
        },
        {
          step: 'Product Viewed',
          users: productViewers,
          conversion_rate: resultViewers === 0 ? 0 : (productViewers / resultViewers) * 100,
        },
        {
          step: 'Added to Cart',
          users: cartAdders,
          conversion_rate: productViewers === 0 ? 0 : (cartAdders / productViewers) * 100,
        },
        {
          step: 'Checkout Started',
          users: checkoutStarters,
          conversion_rate: cartAdders === 0 ? 0 : (checkoutStarters / cartAdders) * 100,
        },
        {
          step: 'Order Created',
          users: converters,
          conversion_rate: checkoutStarters === 0 ? 0 : (converters / checkoutStarters) * 100,
        },
      ],
    });
  } catch (err) {
    console.error('[Analytics User Flow] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
