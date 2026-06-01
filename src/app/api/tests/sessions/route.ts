import { createServerClient } from '@/lib/supabase/server';
import { SessionRow } from '@/lib/supabase/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testId } = body as { testId: string };

    if (!testId) {
      return NextResponse.json({ error: 'testId required' }, { status: 400 });
    }

    // Get test metadata to get categoryId
    const { data: test } = await supabase
      .from('tests')
      .select('category_id')
      .eq('id', testId)
      .single();

    // Create session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: user.id,
          test_id: testId,
          category_id: test?.category_id || null,
          answers: {},
          time_spent: 0,
          status: 'in_progress',
        },
      ] as SessionRow[])
      .select('id')
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
