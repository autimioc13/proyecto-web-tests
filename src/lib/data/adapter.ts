import { QuizAnalyticsEvent as AnalyticsEvent, AggregatedMetrics } from '@/types';

export interface DataAdapter {
  saveEvent(event: AnalyticsEvent): Promise<void>;
  getEvents(quizSlug?: string, limit?: number): Promise<AnalyticsEvent[]>;
  getMetrics(quizSlug?: string): Promise<AggregatedMetrics[]>;
  aggregateMetrics(): Promise<Map<string, AggregatedMetrics>>;
}
