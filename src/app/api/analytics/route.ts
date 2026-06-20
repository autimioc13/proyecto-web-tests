import { getDataAdapter } from '@/lib/data';
import { QuizAnalyticsEvent as AnalyticsEvent } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event: AnalyticsEvent = body;

    const adapter = getDataAdapter();
    await adapter.saveEvent(event);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Analytics API] Error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const quizSlug = searchParams.get('quizSlug');
    const action = searchParams.get('action') || 'metrics';

    const adapter = getDataAdapter();

    if (action === 'events') {
      const events = await adapter.getEvents(quizSlug || undefined, 1000);
      return NextResponse.json({ events });
    }

    if (action === 'metrics') {
      const metrics = quizSlug
        ? await adapter.getMetrics(quizSlug)
        : await adapter.getMetrics();
      return NextResponse.json({ metrics });
    }

    if (action === 'aggregate') {
      const aggregated = await adapter.aggregateMetrics();
      const data = Array.from(aggregated.values());
      return NextResponse.json({ metrics: data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[Analytics API] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
