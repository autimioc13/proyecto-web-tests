import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { sessionId } = params;
    const body = await request.json();
    const { answers, timeSpent } = body as {
      answers: Record<string, string>;
      timeSpent: number;
    };

    // Verify user owns this session
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || session?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update session with answers
    const { error } = await supabase
      .from('sessions')
      .update({
        answers,
        time_spent: timeSpent,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Session update error:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
