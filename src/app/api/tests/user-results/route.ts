import { createServerClient } from '@/lib/supabase/server';
import { UserTestResult } from '@/lib/supabase/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's test results
    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Fetch results error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 }
      );
    }

    // Transform to camelCase (UserTestResult shape)
    const transformedResults: UserTestResult[] = results.map((row) => ({
      id: row.id,
      testId: row.test_id,
      testTitle: row.test_title,
      categoryId: row.category_id,
      score: row.score,
      grade: row.grade,
      completedAt: row.completed_at,
      timeSpent: row.time_spent,
    }));

    return NextResponse.json({ results: transformedResults });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
