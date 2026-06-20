import { QuizAnalyticsEvent as AnalyticsEvent, AggregatedMetrics, SiloSlug } from '@/types';
import { DataAdapter } from '../adapter';

export class JsonAdapter implements DataAdapter {
  async saveEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  }

  async getEvents(quizSlug?: string, limit: number = 1000): Promise<AnalyticsEvent[]> {
    try {
      const url = `/api/analytics?action=events${quizSlug ? `&quizSlug=${quizSlug}` : ''}`;
      const res = await fetch(url);
      const { events } = await res.json();
      return events.slice(-limit);
    } catch {
      return [];
    }
  }

  async getMetrics(quizSlug?: string): Promise<AggregatedMetrics[]> {
    try {
      const url = `/api/analytics?action=metrics${quizSlug ? `&quizSlug=${quizSlug}` : ''}`;
      const res = await fetch(url);
      const { metrics } = await res.json();
      return metrics || [];
    } catch {
      return [];
    }
  }

  async aggregateMetrics(): Promise<Map<string, AggregatedMetrics>> {
    try {
      const res = await fetch('/api/analytics?action=aggregate');
      const { metrics } = await res.json();
      const map = new Map<string, AggregatedMetrics>();
      metrics.forEach((m: AggregatedMetrics) => {
        map.set(m.quizSlug, m);
      });
      return map;
    } catch {
      return new Map();
    }
  }
}
