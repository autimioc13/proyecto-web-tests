import { QuizAnalyticsEvent as AnalyticsEvent, AggregatedMetrics, SiloSlug } from '@/types';
import { DataAdapter } from '../adapter';

export class MemoryAdapter implements DataAdapter {
  private events: AnalyticsEvent[] = [];

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    this.events.push(event);
  }

  async getEvents(quizSlug?: string, limit: number = 1000): Promise<AnalyticsEvent[]> {
    let filtered = this.events;
    if (quizSlug) {
      filtered = filtered.filter((e) => e.quizSlug === quizSlug);
    }
    return filtered.slice(-limit);
  }

  async getMetrics(quizSlug?: string): Promise<AggregatedMetrics[]> {
    const metricsMap = await this.aggregateMetrics();
    const metrics = Array.from(metricsMap.values());

    if (quizSlug) {
      return metrics.filter((m) => m.quizSlug === quizSlug);
    }

    return metrics;
  }

  async aggregateMetrics(): Promise<Map<string, AggregatedMetrics>> {
    const metricsMap = new Map<string, AggregatedMetrics>();

    this.events.forEach((event) => {
      if (!metricsMap.has(event.quizSlug)) {
        metricsMap.set(event.quizSlug, {
          quizSlug: event.quizSlug,
          silo: event.metadata?.silo || ('trivia' as SiloSlug),
          totalStarts: 0,
          totalCompletes: 0,
          totalAbandoms: 0,
          totalShares: 0,
          totalImpressions: 0,
          completionRate: 0,
          shareRate: 0,
          rpm: 0,
          estRevenue: 0,
        });
      }

      const metrics = metricsMap.get(event.quizSlug)!;

      if (event.eventName === 'quiz_start') metrics.totalStarts++;
      else if (event.eventName === 'quiz_complete') {
        metrics.totalCompletes++;
        metrics.totalImpressions += 2;
      } else if (event.eventName === 'quiz_abandon') metrics.totalAbandoms++;
      else if (event.eventName === 'quiz_share') metrics.totalShares++;
      else if (event.eventName === 'quiz_question_view') metrics.totalImpressions++;
    });

    metricsMap.forEach((metrics) => {
      metrics.completionRate =
        metrics.totalStarts > 0
          ? Math.round((metrics.totalCompletes / metrics.totalStarts) * 100)
          : 0;
      metrics.shareRate =
        metrics.totalCompletes > 0
          ? Math.round((metrics.totalShares / metrics.totalCompletes) * 100)
          : 0;

      const cpmBySilo: Record<SiloSlug, number> = {
        personalidad: 2000000,
        trivia: 3000000,
        curiosidades: 2500000,
        util: 5000000,
      };

      const cpm = cpmBySilo[metrics.silo] || 2500000;
      metrics.rpm = Math.round((metrics.totalImpressions / 1000) * cpm);
      metrics.estRevenue = metrics.rpm;
    });

    return metricsMap;
  }
}
