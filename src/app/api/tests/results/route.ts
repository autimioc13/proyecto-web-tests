import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testId, sessionId, score, grade, timeSpent, categoryId } = body as {
      testId: string;
      sessionId: string;
      score: number;
      grade: string;
      timeSpent: number;
      categoryId?: string;
    };

    // Validate inputs
    if (!testId || !sessionId || score === undefined || !grade) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update session as completed
    const { error: updateSessionError } = await supabase
      .from('sessions')
      .update({ status: 'completed', time_spent: timeSpent })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateSessionError) {
      console.error('Session update error:', updateSessionError);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    // Save result
    const { data: result, error: resultError } = await supabase
      .from('results')
      .insert([
        {
          user_id: user.id,
          session_id: sessionId,
          test_id: testId,
          test_title: testId, // Will be replaced with real title from tests table if needed
          category_id: categoryId,
          score,
          grade,
          time_spent: timeSpent,
        },
      ])
      .select('id')
      .single();

    if (resultError) {
      console.error('Result save error:', resultError);
      return NextResponse.json(
        { error: 'Failed to save result' },
        { status: 500 }
      );
    }

    // Log activity
    const { error: activityLogError } = await supabase
      .from('activity_logs')
      .insert([
        {
          user_id: user.id,
          activity_type: 'test_completed',
          resource: 'test',
          resource_id: testId,
          details: { score, grade, categoryId },
        },
      ]);

    if (activityLogError) {
      console.error('Activity log error:', activityLogError);
    }

    return NextResponse.json({ resultId: result.id });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
